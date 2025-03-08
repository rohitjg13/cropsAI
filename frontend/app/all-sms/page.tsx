"use client";

import React, { useState, useEffect } from "react";
import { MessageObject, MessageReader } from "@solimanware/capacitor-sms-reader";
import { extractTransactionAmount } from "../all-sms/regex";

const SmsReader = () => {
  const [messages, setMessages] = useState<MessageObject[]>([]);
  const [extractedAmounts, setExtractedAmounts] = useState<{[key: string]: string | null}>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await MessageReader.getMessages({});
        setMessages(response.messages);
        console.log("Messages fetched:", response.messages.length);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        console.error("Error fetching messages:", e);
        setError(`Failed to fetch messages: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  useEffect(() => {
    const processMessages = () => {
      if (messages.length === 0) return;
      
      console.log("Processing", messages.length, "messages for amount extraction");
      
      const newAmounts: {[key: string]: string | null} = {};
      
      messages.forEach((message, index) => {
        try {
          console.log(`Processing message ${index+1}/${messages.length}`);
          
          // Direct call to the extraction function
          const amount = extractTransactionAmount(message.body);
          
          console.log(`Amount extracted for message ${index+1}:`, amount);
          newAmounts[message.id] = amount;
          
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          console.error(`Error processing message ${index}:`, e);
          newAmounts[message.id] = null;
        }
      });
      
      setExtractedAmounts(newAmounts);
    };

    if (messages.length > 0) {
      processMessages();
    }
  }, [messages]);

  if (loading) return <div>Loading messages...</div>;
  if (error) return <div>Error: {error}</div>;
  if (messages.length === 0) return <div>No messages found</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">SMS Messages ({messages.length})</h1>
      {messages.map((message) => (
        <div key={message.id} className="border p-3 mb-3 rounded">
          <p><strong>From:</strong> {message.sender}</p>
          <p><strong>Date:</strong> {new Date(message.date).toLocaleString()}</p>
          <p><strong>Message:</strong> {message.body}</p>
          <p><strong>Amount:</strong> {
            message.id in extractedAmounts 
              ? (extractedAmounts[message.id] || "No amount found") 
              : "Processing..."
          }</p>
        </div>
      ))}
    </div>
  );
};

export default SmsReader;