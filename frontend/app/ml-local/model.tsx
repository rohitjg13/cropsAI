'use client'

import * as qna from "@tensorflow-models/qna";
import * as tf from "@tensorflow/tfjs"
import "@tensorflow/tfjs-backend-webgl"
import { useState,useEffect } from "react";

interface ExtractedInfo{
    question : string,
    answer : string
};

const TransactionExtractor = () => {

    const [model , setModel] = useState<qna.QuestionAndAnswer | null>(null);
    const [response , setResponse] = useState<ExtractedInfo[]>([]);

    useEffect(() => {
        const setUpTensorFlow = async () => {
            await tf.setBackend('webgl');
            await tf.ready();
            console.log("Tensorflow ready mame")
        };
        
        setUpTensorFlow();
    } , []);

    useEffect(() => {
        const loadModel = async () => {
            const qnamodel = qna.load();
            setModel(await qnamodel);
            console.log("Qna model loaded");
        }
        loadModel();
    } , []);

    const analyzeText = async(text : string) => {
        if(!model) return;
        const questions = [
            "Who sent the money?",
            "Who received the payment?",
            "What is the transaction amount?"
        ];
        const extractedInfo : ExtractedInfo[] = [];
        for(const question of questions) {
            const result = await model.findAnswers(question, text);
            extractedInfo.push({question: question, answer: result[0]?.text || "Not found"});
        }
        setResponse(extractedInfo);
    }

    return (
        <div className="mt-8 w-full max-w-md p-4 bg-white rounded-lg shadow-md">
            <textarea 
                onChange={(e) => analyzeText(e.target.value)} 
                placeholder="Paste SMS here..." 
                className="w-full h-32 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
            {response.length <= 0 && (
                <div className="mt-4 flex justify-center">
                    <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
            {response.length > 0 && (
                <ul className="mt-4 space-y-2">
                    {response.map((item, index) => (
                        <li key={index} className="p-2 bg-gray-100 rounded-lg">
                            <strong className="text-blue-600">{item.question}</strong>: {item.answer}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default TransactionExtractor;