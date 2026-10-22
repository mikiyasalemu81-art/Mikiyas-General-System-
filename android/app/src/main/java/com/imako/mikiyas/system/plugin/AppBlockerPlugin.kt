package com.imako.mikiyas.system.plugin

import android.app.AppOpsManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Process
import android.provider.Settings
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.util.Calendar

@CapacitorPlugin(name = "AppBlocker")
class AppBlockerPlugin : Plugin() {

    private val PREFS_NAME = "AppBlockerPrefs"

    companion object {
        private var instance: AppBlockerPlugin? = null

        fun notifyAppBlocked(packageName: String, attempts: Int) {
            instance?.let { plugin ->
                val data = JSObject().apply {
                    put("packageName", packageName)
                    put("attempts", attempts)
                    put("timestamp", System.currentTimeMillis())
                }
                plugin.notifyListeners("appBlocked", data)
            }
        }
    }

    override fun load() {
        super.load()
        instance = this
    }

    /**
     * Check if Android Usage Access and Accessibility permissions are granted
     */
    @PluginMethod
    fun checkPermissions(call: PluginCall) {
        val context = context ?: return call.reject("Context is null")

        // 1. Check Usage Access
        val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = appOps.checkOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS,
            Process.myUid(),
            context.packageName
        )
        val hasUsageStats = mode == AppOpsManager.MODE_ALLOWED

        // 2. Check Accessibility Service
        val enabledServices = Settings.Secure.getString(
            context.contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: ""
        val hasAccessibility = enabledServices.contains(context.packageName)

        val result = JSObject().apply {
            put("hasUsageStats", hasUsageStats)
            put("hasAccessibility", hasAccessibility)
            put("allGranted", hasUsageStats && hasAccessibility)
        }
        call.resolve(result)
    }

    /**
     * Open Android Settings -> Usage Access screen
     */
    @PluginMethod
    fun requestUsageAccess(call: PluginCall) {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
        call.resolve(JSObject().put("opened", true))
    }

    /**
     * Open Android Settings -> Accessibility screen
     */
    @PluginMethod
    fun requestAccessibility(call: PluginCall) {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
        call.resolve(JSObject().put("opened", true))
    }

    /**
     * Read actual foreground app usage in minutes from midnight today using UsageStatsManager
     */
    @PluginMethod
    fun getAppUsage(call: PluginCall) {
        val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
            ?: return call.reject("UsageStatsManager unavailable")

        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        val startTime = calendar.timeInMillis
        val endTime = System.currentTimeMillis()

        val stats = usageStatsManager.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY,
            startTime,
            endTime
        )

        val usageMap = JSObject()
        if (stats != null) {
            for (usage in stats) {
                val totalTimeInForegroundMs = usage.totalTimeInForeground
                val minutes = (totalTimeInForegroundMs / (1000 * 60)).toInt()
                if (minutes > 0) {
                    usageMap.put(usage.packageName, minutes)
                }
            }
        }

        call.resolve(JSObject().put("usage", usageMap))
    }

    /**
     * Save active blocked apps list into SharedPreferences for AccessibilityService to read
     */
    @PluginMethod
    fun setBlockedApps(call: PluginCall) {
        val appsArray = call.getArray("apps") ?: return call.reject("Missing 'apps' array")
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        prefs.edit().putString("blocked_apps", appsArray.toString()).apply()
        call.resolve(JSObject().put("success", true))
    }

    /**
     * Retrieve blocked attempts count per package
     */
    @PluginMethod
    fun getBlockedAttempts(call: PluginCall) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val allPrefs = prefs.all
        val attemptsObj = JSObject()

        for ((key, value) in allPrefs) {
            if (key.startsWith("attempts_") && value is Int) {
                val pkg = key.removePrefix("attempts_")
                attemptsObj.put(pkg, value)
            }
        }

        call.resolve(JSObject().put("attempts", attemptsObj))
    }

    /**
     * Get list of launchable user apps installed on Android device
     */
    @PluginMethod
    fun getInstalledApps(call: PluginCall) {
        val pm = context.packageManager
        val mainIntent = Intent(Intent.ACTION_MAIN, null).apply {
            addCategory(Intent.CATEGORY_LAUNCHER)
        }
        val resolveInfos = pm.queryIntentActivities(mainIntent, 0)
        val appsList = JSArray()

        for (info in resolveInfos) {
            val pkg = info.activityInfo.packageName
            // Skip system packages and own app
            if (pkg == context.packageName || pkg.startsWith("com.android.")) continue

            val appName = info.loadLabel(pm).toString()
            val appObj = JSObject().apply {
                put("packageName", pkg)
                put("name", appName)
            }
            appsList.put(appObj)
        }

        call.resolve(JSObject().put("installedApps", appsList))
    }
}
