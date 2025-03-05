package com.srimanandrohit.cropAI;

import android.Manifest;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "SmsReceiver")
public class SmsReceiver extends BroadcastReceiver {
    private static final String TAG = "SmsReceiver";
    private static Bridge staticBridge = null;
    private static final int NOTIFICATION_ID = 1;

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
                        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                            message = SmsMessage.createFromPdu((byte[]) pdu, bundle.getString("format"));
                        } else {
                            message = SmsMessage.createFromPdu((byte[]) pdu);
                        }

                        String sender = message.getOriginatingAddress();
                        String body = message.getMessageBody();
                        Log.d(TAG, "SMS Received - From: " + sender + ", Body: " + body);

                        try {
                            JSObject smsData = new JSObject();
                            smsData.put("sender", sender);
                            smsData.put("body", body);
                            smsData.put("timestamp", System.currentTimeMillis());
                            Log.d(TAG, "SMS Data: " + smsData.toString());

                            if (staticBridge != null) {
                                // App is running: Trigger event directly
                                String jsCode = "window.dispatchEvent(new CustomEvent('smsReceived', { detail: "
                                        + smsData.toString() + " }));";
                                staticBridge.getWebView().post(() -> {
                                    staticBridge.getWebView().evaluateJavascript(jsCode, null);
                                });
                            } else {
                                // App is closed: Create notification if permission is granted
                                Intent notificationIntent = new Intent(context, MainActivity.class);
                                notificationIntent.putExtra("sms_sender", sender);
                                notificationIntent.putExtra("sms_body", body);
                                notificationIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                                PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, notificationIntent,
                                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

                                NotificationCompat.Builder builder = new NotificationCompat.Builder(context, "sms_channel")
                                        .setSmallIcon(android.R.drawable.ic_dialog_info) // Replace with your app's icon
                                        .setContentTitle("New SMS Received")
                                        .setContentText("From: " + sender)
                                        .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                                        .setContentIntent(pendingIntent)
                                        .setAutoCancel(true);

                                NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);

                                // Check for POST_NOTIFICATIONS permission (API 33+)
                                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
                                    if (ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS)
                                            == PackageManager.PERMISSION_GRANTED) {
                                        notificationManager.notify(NOTIFICATION_ID, builder.build());
                                        Log.d(TAG, "Notification posted successfully");
                                    } else {
                                        Log.w(TAG, "POST_NOTIFICATIONS permission not granted; skipping notification");
                                        // Optionally store the SMS data locally to process later when permissions are granted
                                    }
                                } else {
                                    // For pre-Android 13, no permission needed
                                    notificationManager.notify(NOTIFICATION_ID, builder.build());
                                    Log.d(TAG, "Notification posted (pre-API 33)");
                                }
                            }
                        } catch (Exception e) {
                            Log.e(TAG, "Error processing SMS", e);
                        }

                        abortBroadcast(); // Prevent other apps from receiving the SMS
                    }
                }
            }
        }
    }
}