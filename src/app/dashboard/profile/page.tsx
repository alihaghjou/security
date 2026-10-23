"use client";

import React, { useState } from "react";
import { User, Bell, Shield, Moon, Save, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function UserProfilePage() {
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState({
    inAppUrgent: true,
    emailUrgent: true,
    emailDailyDigest: false,
    browserPush: true,
    smsAlerts: false,
    quietHours: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Profile & Preferences
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your contact information and customize how and when SecureFlow alerts you.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Notification preferences updated successfully.</span>
        </div>
      )}

      {/* Account Info */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-teal-400" />
            <CardTitle className="text-base text-white">Your Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Full Name</Label>
              <Input defaultValue="Sarah Jenkins" disabled className="bg-slate-950 text-xs text-slate-300" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Corporate Email</Label>
              <Input defaultValue="sarah@acme-corp.demo" disabled className="bg-slate-950 text-xs text-slate-300" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Organization</Label>
              <Input defaultValue="Acme Corporation" disabled className="bg-slate-950 text-xs text-slate-300" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Assigned Department</Label>
              <Input defaultValue="Finance Operations" disabled className="bg-slate-950 text-xs text-slate-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-400" />
            <CardTitle className="text-base text-white">Notification Channels</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <div className="text-sm font-semibold text-slate-200">In-App Alert Notifications</div>
              <div className="text-xs text-slate-400">Display real-time security alerts directly in your browser banner.</div>
            </div>
            <Switch
              checked={prefs.inAppUrgent}
              onCheckedChange={(checked) => setPrefs({ ...prefs, inAppUrgent: checked })}
            />
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <div className="text-sm font-semibold text-slate-200">Email Notifications for Urgent Alerts</div>
              <div className="text-xs text-slate-400">Receive an email immediately when a critical threat or sign-in verification is flagged.</div>
            </div>
            <Switch
              checked={prefs.emailUrgent}
              onCheckedChange={(checked) => setPrefs({ ...prefs, emailUrgent: checked })}
            />
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <div className="text-sm font-semibold text-slate-200">Browser Push Notifications</div>
              <div className="text-xs text-slate-400">Allow instant desktop alerts for time-sensitive security confirmations.</div>
            </div>
            <Switch
              checked={prefs.browserPush}
              onCheckedChange={(checked) => setPrefs({ ...prefs, browserPush: checked })}
            />
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <div className="text-sm font-semibold text-slate-200">Quiet Hours Protection</div>
              <div className="text-xs text-slate-400">Pause non-urgent notices between 22:00 and 07:00. Critical incidents will still alert.</div>
            </div>
            <Switch
              checked={prefs.quietHours}
              onCheckedChange={(checked) => setPrefs({ ...prefs, quietHours: checked })}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs">
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
