package com.srimanandrohit.cropAI;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.JSObject;

public class MainActivity extends BridgeActivity {
    private static final int SMS_PERMISSION_REQUEST_CODE = 101;

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
        checkSmsPermission();
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

    private void checkSmsPermission() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECEIVE_SMS)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.RECEIVE_SMS, Manifest.permission.READ_SMS},
                    SMS_PERMISSION_REQUEST_CODE);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == SMS_PERMISSION_REQUEST_CODE) {
            boolean granted = grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED;
            if (!granted) {
                // Handle permission denial (e.g., show a message)
            }
        }
    }
}