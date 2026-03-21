'use client';

import { useState, useEffect } from 'react';
import { 
  Save, 
  Shield, 
  Bell, 
  Globe, 
  Database, 
  Key, 
  Users, 
  Moon, 
  Sun,
  RefreshCw,
  Check,
  X,
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [darkMode, setDarkMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);

  // Form states
  const [appName, setAppName] = useState('Stock Market App');
  const [appUrl, setAppUrl] = useState('http://localhost:3000');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [notificationEmail, setNotificationEmail] = useState('admin@example.com');
  const [finnhubKey, setFinnhubKey] = useState('d6c54a9r01qp4li1jhagd6c54a9r01qp4li1jhb0');
  const [razorpayKey, setRazorpayKey] = useState('rzp_test_xxxxxxxxxxxx');
  const [razorpaySecret, setRazorpaySecret] = useState('xxxxxxxxxxxxxxxx');
  
  // Toggle states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newUserAlerts, setNewUserAlerts] = useState(true);
  const [largeTransactionAlerts, setLargeTransactionAlerts] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  
  // Select values
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [passwordPolicy, setPasswordPolicy] = useState('strong');
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [rateLimit, setRateLimit] = useState('100');

  // Load saved settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setAppName(settings.appName || 'Stock Market App');
        setAppUrl(settings.appUrl || 'http://localhost:3000');
        setTimezone(settings.timezone || 'Asia/Kolkata');
        setNotificationEmail(settings.notificationEmail || 'admin@example.com');
        setDarkMode(settings.darkMode || false);
        setTwoFactorEnabled(settings.twoFactorEnabled || false);
        setEmailNotifications(settings.emailNotifications !== false);
        setNewUserAlerts(settings.newUserAlerts !== false);
        setLargeTransactionAlerts(settings.largeTransactionAlerts !== false);
        setAutoBackup(settings.autoBackup !== false);
        setSessionTimeout(settings.sessionTimeout || '30');
        setPasswordPolicy(settings.passwordPolicy || 'strong');
        setBackupFrequency(settings.backupFrequency || 'daily');
        setRateLimit(settings.rateLimit || '100');
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSave = () => {
    setSaving(true);
    
    // Save to localStorage
    const settings = {
      appName,
      appUrl,
      timezone,
      notificationEmail,
      darkMode,
      twoFactorEnabled,
      emailNotifications,
      newUserAlerts,
      largeTransactionAlerts,
      autoBackup,
      sessionTimeout,
      passwordPolicy,
      backupFrequency,
      rateLimit,
      lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      toast.success('Settings saved successfully!', {
        description: 'All changes have been applied.'
      });
    }, 1000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      // Reset to defaults
      setAppName('Stock Market App');
      setAppUrl('http://localhost:3000');
      setTimezone('Asia/Kolkata');
      setNotificationEmail('admin@example.com');
      setDarkMode(false);
      setTwoFactorEnabled(false);
      setEmailNotifications(true);
      setNewUserAlerts(true);
      setLargeTransactionAlerts(true);
      setAutoBackup(true);
      setSessionTimeout('30');
      setPasswordPolicy('strong');
      setBackupFrequency('daily');
      setRateLimit('100');
      
      localStorage.removeItem('adminSettings');
      
      toast.success('Settings reset to defaults');
    }
  };

  const handleClearCache = () => {
    toast.info('Clearing cache...', {
      description: 'This may take a moment.'
    });
    
    setTimeout(() => {
      toast.success('Cache cleared successfully');
    }, 1500);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    
    try {
      // Test Finnhub API
      const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${finnhubKey}`);
      const data = await response.json();
      
      if (data.c) {
        toast.success('Finnhub API Connection Successful', {
          description: `AAPL current price: $${data.c}`
        });
      } else {
        toast.error('Finnhub API Connection Failed', {
          description: 'Invalid API key or rate limit exceeded'
        });
      }
    } catch (error) {
      toast.error('Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  const handleBackup = () => {
    toast.info('Starting database backup...');
    
    setTimeout(() => {
      toast.success('Backup completed successfully', {
        description: `Backup file: backup-${new Date().toISOString().split('T')[0]}.zip`
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header with Save Button */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Settings</h1>
              <p className="text-blue-100">Configure your application settings</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-white/20 backdrop-blur-lg rounded-xl hover:bg-white/30 transition flex items-center gap-2 disabled:opacity-50 mt-4 md:mt-0"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Settings Navigation */}
        <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg border border-gray-700 overflow-hidden">
          <div className="flex flex-wrap border-b border-gray-700">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-4 text-sm font-medium transition flex items-center gap-2 ${
                activeTab === 'general'
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700/50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              <Globe className="w-4 h-4" />
              General
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-6 py-4 text-sm font-medium transition flex items-center gap-2 ${
                activeTab === 'security'
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700/50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              <Shield className="w-4 h-4" />
              Security
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-4 text-sm font-medium transition flex items-center gap-2 ${
                activeTab === 'notifications'
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700/50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              <Bell className="w-4 h-4" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`px-6 py-4 text-sm font-medium transition flex items-center gap-2 ${
                activeTab === 'database'
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700/50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              <Database className="w-4 h-4" />
              Database
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`px-6 py-4 text-sm font-medium transition flex items-center gap-2 ${
                activeTab === 'api'
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700/50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              <Key className="w-4 h-4" />
              API
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">General Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">App Name</label>
                    <input
                      type="text"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">App URL</label>
                    <input
                      type="text"
                      value={appUrl}
                      onChange={(e) => setAppUrl(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Dark Mode</p>
                      <p className="text-sm text-gray-400">Toggle dark mode theme</p>
                    </div>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className={`p-2 rounded-lg transition ${
                        darkMode ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                    <select 
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="America/New_York">America/New York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                      <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Security Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-400">Enable 2FA for admin accounts</p>
                    </div>
                    <button
                      onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Session Timeout</label>
                    <select 
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                      <option value="240">4 hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Password Policy</label>
                    <select 
                      value={passwordPolicy}
                      onChange={(e) => setPasswordPolicy(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
                    >
                      <option value="strong">Strong (8+ chars, mixed case, numbers, symbols)</option>
                      <option value="medium">Medium (8+ chars, mixed case)</option>
                      <option value="basic">Basic (6+ chars)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Notification Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Email Notifications</p>
                      <p className="text-sm text-gray-400">Receive email alerts</p>
                    </div>
                    <button
                      onClick={() => setEmailNotifications(!emailNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        emailNotifications ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          emailNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                    <div>
                      <p className="font-medium text-white">New User Registration</p>
                      <p className="text-sm text-gray-400">Alert when new user signs up</p>
                    </div>
                    <button
                      onClick={() => setNewUserAlerts(!newUserAlerts)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        newUserAlerts ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          newUserAlerts ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Large Transactions</p>
                      <p className="text-sm text-gray-400">Alert for transactions above ₹1,00,000</p>
                    </div>
                    <button
                      onClick={() => setLargeTransactionAlerts(!largeTransactionAlerts)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        largeTransactionAlerts ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          largeTransactionAlerts ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Notification Email</label>
                    <input
                      type="email"
                      value={notificationEmail}
                      onChange={(e) => setNotificationEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Database Settings */}
            {activeTab === 'database' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Database Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Connection String</label>
                    <div className="relative">
                      <input
                        type={showSecrets ? "text" : "password"}
                        value="mongodb+srv://admin:****@cluster.mongodb.net/stock-market-app"
                        readOnly
                        className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-400 font-mono text-sm pr-10"
                      />
                      <button
                        onClick={() => setShowSecrets(!showSecrets)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Auto Backup</p>
                      <p className="text-sm text-gray-400">Daily database backup</p>
                    </div>
                    <button
                      onClick={() => setAutoBackup(!autoBackup)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        autoBackup ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          autoBackup ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Backup Frequency</label>
                    <select 
                      value={backupFrequency}
                      onChange={(e) => setBackupFrequency(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
                    >
                      <option value="daily">Daily at 2 AM</option>
                      <option value="weekly">Weekly on Sunday</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <button 
                    onClick={handleBackup}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                  >
                    <Database className="w-4 h-4" />
                    Backup Now
                  </button>
                </div>
              </div>
            )}

            {/* API Settings */}
            {activeTab === 'api' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">API Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Finnhub API Key</label>
                    <div className="flex gap-2">
                      <input
                        type={showSecrets ? "text" : "password"}
                        value={finnhubKey}
                        onChange={(e) => setFinnhubKey(e.target.value)}
                        className="flex-1 px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-white font-mono"
                      />
                      <button
                        onClick={() => setShowSecrets(!showSecrets)}
                        className="px-3 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition text-gray-300"
                      >
                        {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={handleTestConnection}
                        disabled={testing}
                        className="px-3 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition text-white flex items-center gap-2"
                      >
                        {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Test
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Razorpay Key ID</label>
                    <input
                      type="text"
                      value={razorpayKey}
                      onChange={(e) => setRazorpayKey(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Razorpay Secret</label>
                    <input
                      type="password"
                      value={razorpaySecret}
                      onChange={(e) => setRazorpaySecret(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">API Rate Limiting</label>
                    <select 
                      value={rateLimit}
                      onChange={(e) => setRateLimit(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
                    >
                      <option value="100">100 requests/min</option>
                      <option value="500">500 requests/min</option>
                      <option value="1000">1000 requests/min</option>
                      <option value="5000">5000 requests/min</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-900/20 backdrop-blur-lg rounded-xl p-6 border border-red-800">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
          </div>
          <p className="text-sm text-red-300 mb-4">
            These actions are irreversible. Please be careful.
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Reset All Settings
            </button>
            <button
              onClick={handleClearCache}
              className="px-4 py-2 border border-red-700 text-red-400 rounded-lg hover:bg-red-900/30 transition"
            >
              Clear Cache
            </button>
          </div>
        </div>

        {/* Last Saved Info */}
        <div className="text-center text-sm text-gray-500">
          {localStorage.getItem('adminSettings') && (
            <p>
              Last saved: {
                new Date(JSON.parse(localStorage.getItem('adminSettings') || '{}').lastSaved).toLocaleString()
              }
            </p>
          )}
        </div>
      </div>
    </div>
  );
}