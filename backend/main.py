import os
import io
import base64
import shutil
import smtplib
from email.message import EmailMessage
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image, UnidentifiedImageError, ImageDraw
from transformers import ViTImageProcessor, ViTForImageClassification
from google import genai
from google.genai import types
from dotenv import load_dotenv
from inference_sdk import InferenceHTTPClient
from icrawler.builtin import GoogleImageCrawler
from twilio.rest import Client



sms_client = Client(os.getenv('TWILIO_ACCOUNT_SID'), os.getenv('TWILIO_AUTH_TOKEN'))

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Models and Client
processor = ViTImageProcessor.from_pretrained('wambugu71/crop_leaf_diseases_vit')
model = ViTForImageClassification.from_pretrained(
    'wambugu1738/crop_leaf_diseases_vit',
    ignore_mismatched_sizes=True
)
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

async def search_image(query):
    google_Crawler = GoogleImageCrawler(storage={'root_dir': r'imgs'})
    google_Crawler.crawl(keyword=query, max_num=1)


@app.route('/cropPrediction', methods=['POST'])
async def crop_prediction():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        image = Image.open(io.BytesIO(file.read()))

        # Crop Disease Classification
        inputs = processor(images=image, return_tensors="pt")
        outputs = model(**inputs)
        logits = outputs.logits
        predicted_class_idx = logits.argmax(-1).item()
        predicted_class = model.config.id2label[predicted_class_idx]
        predicted_class_formatted = predicted_class.split('___')[-1].replace('_', ' ')

        # Gemini prompt
        prompt = f'''Given an image of a crop and the disease name, provide a structured JSON output with detailed information. Extract relevant data and format it as follows:
        {{
            "crop_name": "<Name of the crop>",
            "crop_description": "<A short description about the crop>",
            "disease_name": "{predicted_class_formatted}",
            "disease_description": "<Very short description of the disease>",
            "causes": "<Main causes of the disease>",
            "symptoms": "<Key symptoms visible on the crop>",
            "prevention_measures": "<Methods to prevent the disease>",
            "treatment": {{
                "fertilizers": ["<List of effective fertilizers>"],
                "pesticides": ["<List of recommended pesticides>"],
                "biological_control": ["<Natural or organic treatment methods>"]
            }},
            "climatic_factors": "<How weather conditions affect this disease>",
            "soil_requirements": "<Impact on soil and necessary adjustments>",
            "crop_rotation_suggestions": "<Best rotation practices to reduce disease risk>"
        }}
        '''
        
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[prompt, image])
        data = response.text
        data = data[data.find('{'):data.rfind('}')+1]
        data = eval(data)
        await search_image(data["crop_name"])
        with open("imgs/000001.jpg", "rb") as file:
            img_str = base64.b64encode(file.read()).decode("utf-8")
        shutil.rmtree("imgs")  # remove images directory
        data["image"] = img_str
        return jsonify(data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/animalPrediction', methods=['POST'])
async def animal_prediction():
    try:
        CLIENT = InferenceHTTPClient(
            api_url="https://detect.roboflow.com",
            api_key=os.getenv('ROBOFLOW_API_KEY')
        )
        file = request.files['image']
        image = Image.open(io.BytesIO(file.read()))

        result = CLIENT.infer(image, model_id="animal-skin-disease/2")
        prediction = result["predictions"][0]
        animal_prediction = prediction["class"]

        # Get bounding box values
        x = prediction["x"]
        y = prediction["y"]
        width = prediction["width"]
        height = prediction["height"]

        if image.mode != 'RGBA':
            image = image.convert('RGBA')
        
        overlay = Image.new('RGBA', image.size, (0, 0, 0, 0))
        overlay_draw = ImageDraw.Draw(overlay)
        translucent_red = (255, 0, 0, 50)
        solid_red = (255, 0, 0)
        overlay_draw.rectangle([(x, y), (x + width, y + height)], fill=translucent_red, outline=solid_red, width=3)
        composite = Image.alpha_composite(image, overlay)

        buffered = io.BytesIO()
        composite.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

        prompt = f'''Given an image of an animal and the disease name, provide a structured JSON output with detailed information. Extract relevant data and format it as follows:
            {{
            "animal_name": "<Name of the animal>",
            "animal_description": "<A short description about the animal>",
            "disease_name": "{animal_prediction}",
            "disease_description": "<Detailed description of the disease>",
            "causes": "<Main causes of the disease>",
            "symptoms": "<Key symptoms visible on the animal>",
            "prevention_measures": "<Methods to prevent the disease>",
            "treatment": {{
                "medications": ["<List of effective medications>"],
                "vaccinations": ["<Recommended vaccines if applicable>"],
                "natural_remedies": ["<Home or organic treatment methods>"]
            }},
            "transmission": "<How the disease spreads>",
            "risk_factors": "<Environmental or genetic risk factors>",
            "affected_species": ["<Other species that can be affected>"],
            "quarantine_measures": "<Steps to isolate infected animals>",
            "recovery_time": "<Expected recovery duration>",
            "veterinary_consultation": "<When to seek professional help>"
            }}
        '''
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[prompt, image])
        data = response.text
        data = data[data.find('{'):data.rfind('}')+1]
        data = eval(data)
        data["image"] = img_str
        return jsonify(data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/smsVet', methods=['POST'])
def email_vet():
    try:
        payload = request.get_json()
        disease_name = payload.get("disease_name")
        animal_name = payload.get("animal_name")
        location = payload.get("location")
        
        message_body = f"Animal: {animal_name}\nDisease: {disease_name}\nLocation: {location}"

        message = sms_client.messages.create(
            to="+919384260810",
            from_=os.getenv('TWILIO_PHONE_NUMBER'),
            body=message_body
        )

        return jsonify({"success": True})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5002)