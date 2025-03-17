package com.srimanandrohit.cropAI;

import android.Manifest;
import android.content.pm.PackageManager;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.List;

@CapacitorPlugin(name = "SmsPlugin")
public class SmsPlugin extends Plugin {

    private static final String EVENT_SMS_RECEIVED = "smsReceived";

    @PluginMethod
    public void fetchMessages(PluginCall call) {
        MainActivity activity = (MainActivity) getActivity();
        if (activity == null) {
            call.reject("Activity not found");
            return;
        }

        activity.fetchMessagesForPlugin(call);
    }

    @PluginMethod
    public void hasSmsPermissions(PluginCall call) {
        boolean hasReadSms = ContextCompat.checkSelfPermission(getContext(),
                Manifest.permission.READ_SMS) == PackageManager.PERMISSION_GRANTED;
        boolean hasReceiveSms = ContextCompat.checkSelfPermission(getContext(),
                Manifest.permission.RECEIVE_SMS) == PackageManager.PERMISSION_GRANTED;

        JSObject result = new JSObject();
        result.put("granted", hasReadSms && hasReceiveSms);
        call.resolve(result);
    }

    @PluginMethod
    public void requestSmsPermissions(PluginCall call) {
        // Save the call to use it after the permissions are requested
        saveCall(call);

        pluginRequestPermissions(new String[] {
                Manifest.permission.READ_SMS,
                Manifest.permission.RECEIVE_SMS
        }, 101);
    }

    @Override
    protected void handleRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.handleRequestPermissionsResult(requestCode, permissions, grantResults);

        PluginCall savedCall = getSavedCall();
        if (savedCall == null) {
            return;
        }

        boolean allGranted = true;
        for (int result : grantResults) {
            if (result != PackageManager.PERMISSION_GRANTED) {
                allGranted = false;
                break;
            }
        }

        JSObject result = new JSObject();
        result.put("granted", allGranted);
        savedCall.resolve(result);
    }

    /**
     * Method to notify JavaScript about a new SMS
     * This can be called from SmsReceiver
     */
    public void notifySmsReceived(String sender, String body, long timestamp) {
        JSObject data = new JSObject();
        data.put("sender", sender);
        data.put("body", body);
        data.put("timestamp", timestamp);

        notifyListeners(EVENT_SMS_RECEIVED, data);
    }
}

