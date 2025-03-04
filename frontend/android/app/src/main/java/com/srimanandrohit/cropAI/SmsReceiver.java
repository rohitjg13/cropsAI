package com.srimanandrohit.cropAI;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;

import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "SmsReceiver")
public class SmsReceiver extends BroadcastReceiver {
    private static final String TAG = "SmsReceiver";
    private static Bridge staticBridge = null;

    // Static method to set the bridge
    public static void setBridge(Bridge bridge) {
        staticBridge = bridge;
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        if ("android.provider.Telephony.SMS_RECEIVED".equals(intent.getAction())) {
            Bundle bundle = intent.getExtras();
            if (bundle != null) {
                Object[] pdus = (Object[]) bundle.get("pdus");
                if (pdus != null) {
                    for (Object pdu : pdus) {
                        SmsMessage message;

                        // Handle different Android versions
                        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                            message = SmsMessage.createFromPdu((byte[]) pdu, bundle.getString("format"));
                        } else {
                            message = SmsMessage.createFromPdu((byte[]) pdu);
                        }

                        String sender = message.getOriginatingAddress();
                        String body = message.getMessageBody();

                        Log.d(TAG, "SMS Received - From: " + sender + ", Body: " + body);

                        try {
                            // Create JSObject with SMS details
                            JSObject smsData = new JSObject();
                            smsData.put("sender", sender);
                            smsData.put("body", body);
                            smsData.put("timestamp", System.currentTimeMillis());

                            // Log the SMS data
                            Log.d(TAG, "Dispatching SMS event with data: " + smsData.toString());

                            // Use the static bridge reference to trigger a proper CustomEvent
                            if (staticBridge != null) {
                                String jsCode = "window.dispatchEvent(new CustomEvent('smsReceived', { detail: "
                                        + smsData.toString() + " }));";
                                staticBridge.getWebView().post(() -> {
                                    staticBridge.getWebView().evaluateJavascript(jsCode, null);
                                });
                            } else {
                                Log.e(TAG, "Bridge is null. Cannot trigger event.");
                            }
                        } catch (Exception e) {
                            Log.e(TAG, "Error processing SMS", e);
                        }

                        // Abort broadcast to prevent other apps from receiving the SMS
                        abortBroadcast();
                    }
                }
            }
        }
    }
}
