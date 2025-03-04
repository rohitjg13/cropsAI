package com.srimanandrohit.cropAI;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final int SMS_PERMISSION_REQUEST_CODE = 101;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Set the bridge for SmsReceiver
        SmsReceiver.setBridge(this.bridge);

        // Check and request SMS permissions
        checkSmsPermission();
    }

    private void checkSmsPermission() {
        // Check if SMS permission is already granted
        if (ContextCompat.checkSelfPermission(this,
                Manifest.permission.RECEIVE_SMS) != PackageManager.PERMISSION_GRANTED) {

            // Request SMS permissions
            ActivityCompat.requestPermissions(this,
                    new String[]{
                            Manifest.permission.RECEIVE_SMS,
                            Manifest.permission.READ_SMS
                    },
                    SMS_PERMISSION_REQUEST_CODE);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode,
                                           @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        if (requestCode == SMS_PERMISSION_REQUEST_CODE) {
            // Check if SMS permissions are granted
            boolean smsPermissionGranted = false;

            for (int result : grantResults) {
                if (result == PackageManager.PERMISSION_GRANTED) {
                    smsPermissionGranted = true;
                    break;
                }
            }

            if (!smsPermissionGranted) {
                // Permissions not granted
                // You might want to show a dialog explaining why permissions are needed
                // or disable SMS-related functionality
            }
        }
    }
}