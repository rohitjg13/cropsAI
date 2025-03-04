package com.example.app;

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
    @Override
    public void onReceive(Context context, Intent intent) {
        if ("android.provider.Telephony.SMS_RECEIVED".equals(intent.getAction())) {
            Bundle bundle = intent.getExtras();
            if (bundle != null) {
                Object[] pdus = (Object[]) bundle.get("pdus");
                if (pdus != null) {
                    for (Object pdu : pdus) {
                        SmsMessage message = SmsMessage.createFromPdu((byte[]) pdu);
                        String sender = message.getOriginatingAddress();
                        String body = message.getMessageBody();
                        Log.d("SmsReceiver", "SMS from: " + sender + " - " + body);

                        // Call Capacitor Plugin
                        JSObject ret = new JSObject();
                        ret.put("sender", sender);
                        ret.put("body", body);
                        Bridge.getInstance().triggerWindowJSEvent("smsReceived", ret.toString());
                    }
                }
            }
        }
    }
}
