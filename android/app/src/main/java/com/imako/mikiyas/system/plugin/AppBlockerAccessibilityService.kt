package com.imako.mikiyas.system.plugin

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.view.accessibility.AccessibilityEvent
import android.widget.Toast
import org.json.JSONArray
import org.json.JSONObject

class AppBlockerAccessibilityService : AccessibilityService() {

    private val PREFS_NAME = "AppBlockerPrefs"
    private var lastBlockedPackage = ""
    private var lastBlockedTimestamp = 0L

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null || event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            return
        }

        val packageName = event.packageName?.toString() ?: return

        // Ignore our own app and system launcher/UI
        if (packageName == applicationContext.packageName || 
            packageName == "com.android.systemui" || 
            packageName.contains("launcher")) {
            return
        }

        val prefs = applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val blockedAppsJson = prefs.getString("blocked_apps", "[]") ?: "[]"

        try {
            val jsonArray = JSONArray(blockedAppsJson)
            for (i in 0 until jsonArray.length()) {
                val appObj = jsonArray.getJSONObject(i)
                val targetPkg = appObj.optString("packageName", "")
                val isBlocked = appObj.optBoolean("isBlocked", false)
                val blockMode = appObj.optString("blockMode", "always")
                val dailyLimitMinutes = appObj.optInt("dailyLimitMinutes", 30)
                val currentUsageMinutes = appObj.optInt("currentUsageMinutes", 0)
                val appName = appObj.optString("name", packageName)

                if (isBlocked && targetPkg.equals(packageName, ignoreCase = true)) {
                    val shouldBlock = (blockMode == "always") || (currentUsageMinutes >= dailyLimitMinutes)

                    if (shouldBlock) {
                        val now = System.currentTimeMillis()
                        // Debounce duplicate events within 1.5 seconds
                        if (packageName == lastBlockedPackage && (now - lastBlockedTimestamp) < 1500) {
                            return
                        }
                        lastBlockedPackage = packageName
                        lastBlockedTimestamp = now

                        // 1. Send user back to Home Screen
                        performGlobalAction(GLOBAL_ACTION_HOME)

                        // 2. Increment blocked attempt counter
                        val attemptKey = "attempts_$packageName"
                        val currentAttempts = prefs.getInt(attemptKey, 0) + 1
                        prefs.edit().putInt(attemptKey, currentAttempts).apply()

                        // 3. Show non-intrusive HUD toast
                        Handler(Looper.getMainLooper()).post {
                            Toast.makeText(
                                applicationContext,
                                "🛑 $appName is blocked today by System for Mikiyas (Attempt #$currentAttempts)",
                                Toast.LENGTH_LONG
                            ).show()
                        }

                        // 4. Notify Capacitor Plugin
                        AppBlockerPlugin.notifyAppBlocked(packageName, currentAttempts)
                        break
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun onInterrupt() {
        // Accessibility service interrupted
    }
}
