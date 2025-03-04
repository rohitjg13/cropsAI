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
            const result = await (await model).findAnswers(question, text);
            extractedInfo.push({question: question, answer: result[0]?.text || "Not found"});
        }
        setResponse(extractedInfo);
    }

    return (
        <div>
            <textarea onChange={(e) => analyzeText(e.target.value)} placeholder="Paste SMS here..."></textarea>
            {response.length > 0 && (
                <ul>
                {response.map((item, index) => (
                    <li key={index}><strong>{item.question}</strong>: {item.answer}</li>
                ))}
                </ul>
            )}
        </div>
    );
}

export default TransactionExtractor;