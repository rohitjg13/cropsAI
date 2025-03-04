package com.srimanandrohit.cropAI;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;
import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "SmsReceiver")
public class SmsReceiver extends BroadcastReceiver {
    private static final String TAG = "SmsReceiver";

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

                            // Trigger a JavaScript event
                            Bridge bridge = Bridge.getInstance();
                            if (bridge != null) {
                                bridge.triggerWindowJSEvent("smsReceived", smsData.toString());
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