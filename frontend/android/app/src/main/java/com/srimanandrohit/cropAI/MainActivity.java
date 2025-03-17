package com.srimanandrohit.cropAI;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {
    private static final int SMS_PERMISSION_REQUEST_CODE = 101;
    private static final String[] SMS_PERMISSIONS = {
            Manifest.permission.RECEIVE_SMS,
            Manifest.permission.READ_SMS
    };
    private static final String TAG = "MainActivity";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Set the bridge for SmsReceiver
        SmsReceiver.setBridge(this.bridge);

        // Create notification channel
        createNotificationChannel();

        // Handle SMS intent if opened from notification
        handleSmsIntent(getIntent());

        // Check and request SMS permissions
        checkSmsPermissions();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleSmsIntent(intent); // Handle new intents (e.g., from notification)
    }

    private void handleSmsIntent(Intent intent) {
        if (intent != null && intent.hasExtra("sms_sender") && intent.hasExtra("sms_body")) {
            String sender = intent.getStringExtra("sms_sender");
            String body = intent.getStringExtra("sms_body");
            JSObject smsData = new JSObject();
            smsData.put("sender", sender);
            smsData.put("body", body);
            smsData.put("timestamp", System.currentTimeMillis());
            String jsCode = "window.dispatchEvent(new CustomEvent('smsReceived', { detail: "
                    + smsData.toString() + " }));";
            bridge.getWebView().post(() -> {
                bridge.getWebView().evaluateJavascript(jsCode, null);
            });
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    "sms_channel",
                    "SMS Notifications",
                    NotificationManager.IMPORTANCE_DEFAULT
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
        }
    }

    private void checkSmsPermissions() {
        boolean allPermissionsGranted = true;

        for (String permission : SMS_PERMISSIONS) {
            if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                allPermissionsGranted = false;
                break;
            }
        }

        if (!allPermissionsGranted) {
            ActivityCompat.requestPermissions(this, SMS_PERMISSIONS, SMS_PERMISSION_REQUEST_CODE);
        } else {
            // Permissions already granted
            Log.d(TAG, "SMS permissions already granted");
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == SMS_PERMISSION_REQUEST_CODE) {
            boolean allGranted = true;
            for (int result : grantResults) {
                if (result != PackageManager.PERMISSION_GRANTED) {
                    allGranted = false;
                    break;
                }
            }

            if (allGranted) {
                Log.d(TAG, "All SMS permissions granted");
                // Now that permissions are granted, you could trigger a message fetch here if needed
            } else {
                Log.w(TAG, "Some SMS permissions were denied");
                // Handle permission denial (e.g., show a message)
            }
        }
    }

    // Interface for SMS callback
    public interface MessageCallback {
        void onSuccess(List<SmsMessage> messages);
        void onFailure(String error);
    }

    // Message class to hold SMS data
    public static class SmsMessage {
        private String sender;
        private String body;
        private long timestamp;

        public SmsMessage(String sender, String body, long timestamp) {
            this.sender = sender;
            this.body = body;
            this.timestamp = timestamp;
        }

        // Getters
        public String getSender() { return sender; }
        public String getBody() { return body; }
        public long getTimestamp() { return timestamp; }
    }

    /**
     * Fetch SMS messages with callback
     * This method can be called from JavaScript via a plugin
     */
    public void fetchMessages(final MessageCallback callback) {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_SMS)
                != PackageManager.PERMISSION_GRANTED) {
            // Permission not granted, notify callback
            callback.onFailure("READ_SMS permission not granted");
            return;
        }

        new Thread(() -> {
            List<SmsMessage> messages = new ArrayList<>();
            Uri uri = Uri.parse("content://sms/inbox");
            Cursor cursor = null;

            try {
                cursor = getContentResolver().query(
                        uri,
                        new String[]{"_id", "address", "body", "date"},
                        null,
                        null,
                        "date DESC"
                );

                if (cursor != null && cursor.moveToFirst()) {
                    int senderIdx = cursor.getColumnIndex("address");
                    int bodyIdx = cursor.getColumnIndex("body");
                    int dateIdx = cursor.getColumnIndex("date");

                    do {
                        String sender = cursor.getString(senderIdx);
                        String body = cursor.getString(bodyIdx);
                        long timestamp = cursor.getLong(dateIdx);

                        // Create message object and add to list
                        SmsMessage message = new SmsMessage(sender, body, timestamp);
                        messages.add(message);

                        Log.d(TAG, "Found SMS: " + sender + " - " + body);
                    } while (cursor.moveToNext());

                    // Send success callback on main thread
                    final List<SmsMessage> finalMessages = messages;
                    Handler mainHandler = new Handler(Looper.getMainLooper());
                    mainHandler.post(() -> callback.onSuccess(finalMessages));
                } else {
                    // Send empty list or failure callback
                    Handler mainHandler = new Handler(Looper.getMainLooper());
                    Cursor finalCursor = cursor;
                    mainHandler.post(() -> {
                        if (finalCursor == null) {
                            Log.e(TAG, "Failed to query SMS database");
                            callback.onFailure("Failed to query SMS database");
                        } else {
                            // Empty list but query was successful
                            Log.d(TAG, "Query successful but no messages found");
                            callback.onSuccess(new ArrayList<>());
                        }
                    });
                }
            } catch (Exception e) {
                Log.e(TAG, "Error fetching SMS messages", e);
                Handler mainHandler = new Handler(Looper.getMainLooper());
                mainHandler.post(() -> callback.onFailure("Error: " + e.getMessage()));
            } finally {
                if (cursor != null && !cursor.isClosed()) {
                    cursor.close();
                }
            }
        }).start();
    }

    /**
     * Bridge method for Capacitor to fetch SMS messages
     * This will be registered in a plugin and called from JavaScript
     */
    public void fetchMessagesForPlugin(final PluginCall call) {
        fetchMessages(new MessageCallback() {
            @Override
            public void onSuccess(List<SmsMessage> messages) {
                try {
                    JSArray jsMessages = new JSArray();
                    for (SmsMessage message : messages) {
                        JSObject jsMessage = new JSObject();
                        jsMessage.put("sender", message.getSender());
                        jsMessage.put("body", message.getBody());
                        jsMessage.put("timestamp", message.getTimestamp());
                        jsMessages.put(jsMessage);
                    }

                    JSObject result = new JSObject();
                    result.put("messages", jsMessages);
                    call.resolve(result);
                } catch (Exception e) {
                    Log.e(TAG, "Error converting messages to JS", e);
                    call.reject("Error processing messages: " + e.getMessage());
                }
            }

            @Override
            public void onFailure(String error) {
                call.reject(error);
            }
        });
    }

    /**
     * Helper method to send SMS data to JavaScript
     * This can be called from SmsReceiver or other places
     */
    public void sendSmsToJavaScript(String sender, String body, long timestamp) {
        JSObject smsData = new JSObject();
        smsData.put("sender", sender);
        smsData.put("body", body);
        smsData.put("timestamp", timestamp);

        String jsCode = "window.dispatchEvent(new CustomEvent('smsReceived', { detail: "
                + smsData.toString() + " }));";

        runOnUiThread(() -> {
            if (bridge != null && bridge.getWebView() != null) {
                bridge.getWebView().evaluateJavascript(jsCode, null);
            }
        });
    }
}

