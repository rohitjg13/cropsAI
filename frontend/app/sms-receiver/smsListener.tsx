'use client'

import { useEffect } from "react";
import { LocalNotifications } from "@capacitor/local-notifications";
import { App } from "@capacitor/app";

interface SmsData {
  sender: string;
  body: string;
  timestamp: number;
}

const SmsListener = () => {
  useEffect(() => {
    const createNotificationChannel = async () => {
      try {
        await LocalNotifications.createChannel({
          id: "sms_alerts",
          name: "SMS Alerts",
          description: "Notifications for incoming SMS messages",
          importance: 4,
          visibility: 1,
          vibration: true,
          sound: "default",
        });
        console.log("Notification channel created successfully");
      } catch (error) {
        console.error("Failed to create notification channel:", error);
      }
    };

    createNotificationChannel();

    LocalNotifications.addListener("localNotificationReceived", (notification) => {
      console.log("Notification received:", notification);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    App.addListener("appStateChange", (state: any) => {
      console.log("App state changed:", state);
    });

    const handleSmsReceived = (event: Event) => {
      try {
        if (!(event instanceof CustomEvent)) {
          console.error("Not a custom event:", event);
          return;
        }

        console.log("Raw SMS Event:", event.detail);

        const smsData: SmsData = typeof event.detail === "string"
          ? JSON.parse(event.detail)
          : event.detail;

        if (!smsData.sender || !smsData.body || !smsData.timestamp) {
          console.error("Invalid SMS data:", smsData);
          return;
        }

        console.log("Parsed SMS Data:", smsData);

        LocalNotifications.schedule({
          notifications: [
            {
              title: `SMS from ${smsData.sender}`,
              body: smsData.body,
              id: Math.floor(Date.now() % 2147483647),
              schedule: { at: new Date(Math.max(smsData.timestamp + 5000, Date.now() + 5000)) },
              sound: "default",
              channelId: "sms_alerts",
            }
          ]
        }).catch(error => {
          console.error("Failed to schedule notification:", error);
        });

      } catch (error) {
        console.error("Error processing SMS:", error);
      }
    };

    window.addEventListener("smsReceived", handleSmsReceived);

    return () => {
      window.removeEventListener("smsReceived", handleSmsReceived);
    };
  }, []);

  return null;
};

export default SmsListener;
