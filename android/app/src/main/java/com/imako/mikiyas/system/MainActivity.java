package com.imako.mikiyas.system;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.imako.mikiyas.system.plugin.AppBlockerPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AppBlockerPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
