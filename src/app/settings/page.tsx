'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { User, Settings2, Lock, Bell, Smartphone, Fingerprint, Mail } from 'lucide-react';

interface SettingsData {
  firstName: string;
  lastName: string;
  email: string;
  smsEnabled: boolean;
  biometricAttendance: boolean;
  emailNotifications: boolean;
  attendanceReminders: boolean;
  paymentNotifications: boolean;
}

export default function SettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Profile settings
  const [settings, setSettings] = useState<SettingsData>({
    firstName: '',
    lastName: '',
    email: '',
    smsEnabled: false,
    biometricAttendance: false,
    emailNotifications: true,
    attendanceReminders: true,
    paymentNotifications: true,
  });

  // Password change
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Load user settings
  useEffect(() => {
    loadUserSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserSettings = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        toast.error('Failed to load user data');
        return;
      }

      // Load settings from user metadata
      const userSettings = user.user_metadata.settings || {};
      
      setSettings({
        firstName: user.user_metadata.first_name || '',
        lastName: user.user_metadata.last_name || '',
        email: user.email || '',
        smsEnabled: userSettings.smsEnabled || false,
        biometricAttendance: userSettings.biometricAttendance || false,
        emailNotifications: userSettings.emailNotifications ?? true,
        attendanceReminders: userSettings.attendanceReminders ?? true,
        paymentNotifications: userSettings.paymentNotifications ?? true,
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!settings.firstName.trim() || !settings.lastName.trim()) {
      toast.error('First name and last name are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: settings.firstName,
          lastName: settings.lastName,
        }),
      });

      if (response.ok) {
        toast.success('Profile updated successfully');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password updated successfully');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleToggleChange = async (key: keyof SettingsData, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));

    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });

      if (response.ok) {
        toast.success('Setting updated successfully');
      } else {
        // Revert on error
        setSettings(prev => ({ ...prev, [key]: !value }));
        toast.error('Failed to update setting');
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      setSettings(prev => ({ ...prev, [key]: !value }));
      toast.error('Failed to update setting');
    }
  };

  if (loadingSettings) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading settings...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Settings2 className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>Profile Information</CardTitle>
              </div>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={settings.firstName}
                  onChange={(e) => setSettings({ ...settings, firstName: e.target.value })}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={settings.lastName}
                  onChange={(e) => setSettings({ ...settings, lastName: e.target.value })}
                  placeholder="Enter your last name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={settings.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>
              <Button onClick={handleProfileUpdate} disabled={loading} className="w-full">
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                <CardTitle>Change Password</CardTitle>
              </div>
              <CardDescription>
                Update your login password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters long
              </p>
              <Button 
                onClick={handlePasswordChange} 
                disabled={passwordLoading}
                className="w-full"
              >
                {passwordLoading ? 'Updating...' : 'Change Password'}
              </Button>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                <CardTitle>System Settings</CardTitle>
              </div>
              <CardDescription>
                Configure system features and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* SMS Settings */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="sms-enabled" className="text-base font-medium cursor-pointer">
                      SMS Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enable SMS notifications for important updates
                    </p>
                  </div>
                </div>
                <Switch
                  id="sms-enabled"
                  checked={settings.smsEnabled}
                  onCheckedChange={(checked) => handleToggleChange('smsEnabled', checked)}
                />
              </div>

              <Separator />

              {/* Biometric Attendance */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Fingerprint className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="biometric-attendance" className="text-base font-medium cursor-pointer">
                      Biometric Attendance
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Use fingerprint or facial recognition for attendance
                    </p>
                  </div>
                </div>
                <Switch
                  id="biometric-attendance"
                  checked={settings.biometricAttendance}
                  onCheckedChange={(checked) => handleToggleChange('biometricAttendance', checked)}
                />
              </div>

              <Separator />

              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="email-notifications" className="text-base font-medium cursor-pointer">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for system updates
                    </p>
                  </div>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleToggleChange('emailNotifications', checked)}
                />
              </div>

              <Separator />

              {/* Attendance Reminders */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="attendance-reminders" className="text-base font-medium cursor-pointer">
                      Attendance Reminders
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminders to mark attendance for classes
                    </p>
                  </div>
                </div>
                <Switch
                  id="attendance-reminders"
                  checked={settings.attendanceReminders}
                  onCheckedChange={(checked) => handleToggleChange('attendanceReminders', checked)}
                />
              </div>

              <Separator />

              {/* Payment Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="payment-notifications" className="text-base font-medium cursor-pointer">
                      Payment Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about payments and dues
                    </p>
                  </div>
                </div>
                <Switch
                  id="payment-notifications"
                  checked={settings.paymentNotifications}
                  onCheckedChange={(checked) => handleToggleChange('paymentNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
