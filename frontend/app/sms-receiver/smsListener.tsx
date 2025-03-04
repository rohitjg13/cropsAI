'use client'

import { useEffect } from 'react'
import { LocalNotifications } from "@capacitor/local-notifications"

interface SmsData {
  sender: string;
  body: string;
  timestamp: number;
}

const SmsListener = () => {
  useEffect(() => {
    const handleSmsReceived = (event: Event) => {
      try {
        // Type guard to ensure it's a custom event
        if (!(event instanceof CustomEvent)) {
          console.error('Not a custom event');
          return;
        }

        // Parse the detail as SmsData
        const smsData: SmsData = JSON.parse(event.detail as string);
        
        // Create local notification
        LocalNotifications.schedule({
          notifications: [
            {
              title: `SMS from ${smsData.sender}`,
              body: smsData.body,
              id: Math.floor(smsData.timestamp),
              schedule: { at: new Date(smsData.timestamp) },
              sound: 'default',
              channelId: 'sms_alerts',
            }
          ]
        }).catch(error => {
          console.error('Failed to schedule notification:', error);
        });

        console.log('SMS Notification Created:', smsData);
      } catch (error) {
        console.error('Error processing SMS:', error);
      }
    };

    // Add event listener
    window.addEventListener('smsReceived', handleSmsReceived);

    // Cleanup
    return () => {
      window.removeEventListener('smsReceived', handleSmsReceived);
    };
  }, []);

  return null;
};

export default SmsListener;