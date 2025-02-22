from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image, UnidentifiedImageError
from transformers import ViTImageProcessor, ViTForImageClassification
from google import genai
from google.genai import types
from dotenv import load_dotenv
import os
import io
from inference_sdk import InferenceHTTPClient

app = Flask(__name__)
CORS(app)

load_dotenv()

# Initialize models
processor = ViTImageProcessor.from_pretrained('wambugu71/crop_leaf_diseases_vit')
model = ViTForImageClassification.from_pretrained(
    'wambugu1738/crop_leaf_diseases_vit',
    ignore_mismatched_sizes=True
)
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

@app.route('/cropPrediction', methods=['POST'])
def crop_prediction():
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
            "disease_description": "<Detailed description of the disease>",
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
        
        return jsonify(data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/animalPrediction', methods=['POST'])
def animal_prediction():
    # Animal disease classification
    CLIENT = InferenceHTTPClient(
        api_url="https://detect.roboflow.com",
        api_key="MZtwASv2WPuqtGURnJdS"
    )
    file = request.files['image']
    image = Image.open(io.BytesIO(file.read()))

    result = CLIENT.infer(image, model_id="animal-skin-disease/2")
    animal_prediction = result["predictions"][0]["class"]
    print(result, animal_prediction)

    # Gemini prompt
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
    return jsonify({"result": result, "disease_name": animal_prediction, "data": data}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5001)