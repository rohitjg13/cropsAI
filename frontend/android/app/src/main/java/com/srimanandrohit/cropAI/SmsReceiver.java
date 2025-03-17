package com.srimanandrohit.cropAI;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.provider.Telephony;
import android.telephony.SmsMessage;
import android.util.Log;

import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;

public class SmsReceiver extends BroadcastReceiver {
    private static final String TAG = "SmsReceiver";
    private static Bridge bridge;

    // Set the bridge reference
    public static void setBridge(Bridge bridge) {
        SmsReceiver.bridge = bridge;
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent.getAction() != null && intent.getAction().equals(Telephony.Sms.Intents.SMS_RECEIVED_ACTION)) {
            Bundle bundle = intent.getExtras();
            if (bundle != null) {
                Object[] pdus = (Object[]) bundle.get("pdus");
                if (pdus != null) {
                    for (Object pdu : pdus) {
                        SmsMessage smsMessage = SmsMessage.createFromPdu((byte[]) pdu);
                        String sender = smsMessage.getDisplayOriginatingAddress();
                        String body = smsMessage.getMessageBody();
                        long timestamp = smsMessage.getTimestampMillis();

                        Log.d(TAG, "SMS received from: " + sender);

                        // Create SMS data object
                        JSObject smsData = new JSObject();
                        smsData.put("sender", sender);
                        smsData.put("body", body);
                        smsData.put("timestamp", timestamp);

                        // Send event through bridge if available
                        if (bridge != null) {
                            try {
                                // Use notifyListeners from the bridge instead of casting to specific plugin
                                bridge.triggerWindowJSEvent("smsReceived", smsData.toString());
                                Log.d(TAG, "SMS event sent to webview");
                            } catch (Exception e) {
                                Log.e(TAG, "Error sending SMS event to webview", e);
                            }
                        } else {
                            Log.w(TAG, "Bridge is null, cannot send SMS event");
                        }

                        // Create a notification intent
                        Intent notificationIntent = new Intent(context, MainActivity.class);
                        notificationIntent.putExtra("sms_sender", sender);
                        notificationIntent.putExtra("sms_body", body);
                        notificationIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);

                        // Start the activity
                        context.startActivity(notificationIntent);
                    }
                }
            }
        }
    }
}