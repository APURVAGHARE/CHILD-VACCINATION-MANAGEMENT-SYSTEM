import React, { useState, useEffect } from 'react';
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  MoonIcon,
  SunIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  CameraIcon,
  GlobeAltIcon,
  LanguageIcon,
  CalendarIcon,
  KeyIcon,
  LinkIcon,
  ArrowRightOnRectangleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // =============================
  // PROFILE STATE
  // =============================
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    avatar: null,
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    }
  });

  // =============================
  // NOTIFICATIONS STATE
  // =============================
  const [notifications, setNotifications] = useState({
    emailReminders: true,
    smsReminders: true,
    appNotifications: true,
    appointmentAlerts: true,
    vaccineDueAlerts: true,
    monthlyReports: false,
    promotionalEmails: false,
    labReportReady: true,
    prescriptionRefill: true,
    billingAlerts: true
  });

  // =============================
  // PREFERENCES STATE
  // =============================
  const [preferences, setPreferences] = useState({
    language: 'en',
    timeFormat: '12h',
    dateFormat: 'MM/DD/YYYY',
    weekStart: 'sunday',
    defaultView: 'dashboard',
    theme: 'light',
    fontSize: 'medium',
    compactView: false,
    autoSave: true
  });

  // =============================
  // SECURITY STATE
  // =============================
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [twoFactor, setTwoFactor] = useState({
    enabled: false,
    method: 'app', // 'app', 'sms', 'email'
    verified: false
  });

  const [sessions, setSessions] = useState([
    { id: 1, device: 'Chrome on Windows', location: 'Mumbai, India', lastActive: '2024-01-15T10:30:00', current: true },
    { id: 2, device: 'Safari on iPhone', location: 'Mumbai, India', lastActive: '2024-01-14T15:45:00', current: false },
    { id: 3, device: 'Firefox on Mac', location: 'Delhi, India', lastActive: '2024-01-13T09:20:00', current: false }
  ]);

  // =============================
  // CONNECTED APPS STATE
  // =============================
  const [connectedAccounts, setConnectedAccounts] = useState([
    { id: 1, name: 'Google Calendar', icon: '📅', connected: true, email: 'user@gmail.com', permissions: ['read_events', 'write_events'] },
    { id: 2, name: 'Apple Health', icon: '🍎', connected: false, permissions: [] },
    { id: 3, name: 'Facebook', icon: '📘', connected: false, permissions: [] },
    { id: 4, name: 'WhatsApp', icon: '💬', connected: true, email: '+91********89', permissions: ['send_notifications'] }
  ]);

  // =============================
  // PRIVACY STATE
  // =============================
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'private', // 'public', 'private', 'contacts'
    shareMedicalHistory: false,
    shareAppointments: true,
    sharePrescriptions: false,
    allowDataCollection: true,
    allowMarketingEmails: false
  });

  // =============================
  // DARK MODE EFFECT
  // =============================
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // =============================
  // LOAD USER PROFILE
  // =============================
  useEffect(() => {
    fetchProfile();
    fetchPreferences();
    fetchNotificationSettings();
    fetchSecuritySettings();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsFetching(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setProfile({
          fullName: data.user.full_name || "",
          email: data.user.email || "",
          phone: data.user.mobile || "",
          alternatePhone: data.user.phone || "",
          address: data.user.address || "",
          city: data.user.city || "",
          state: data.user.state || "",
          zipCode: data.user.zip || "",
          country: data.user.country || "India",
          avatar: data.user.avatar || null,
          dateOfBirth: data.user.dob || "",
          gender: data.user.gender || "",
          bloodGroup: data.user.blood_group || "",
          emergencyContact: data.user.emergency_contact || { name: '', phone: '', relation: '' }
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load profile");
    } finally {
      setIsFetching(false);
    }
  };

  const fetchPreferences = async () => {
    // Fetch user preferences from API
    // Mock implementation
  };

  const fetchNotificationSettings = async () => {
    // Fetch notification settings from API
    // Mock implementation
  };

  const fetchSecuritySettings = async () => {
    // Fetch security settings from API
    // Mock implementation
  };

  // =============================
  // PROFILE UPDATE
  // =============================
  const handleProfileUpdate = async () => {
    // Validation
    if (!profile.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(profile.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: profile.fullName,
          mobile: profile.phone,
          phone: profile.alternatePhone,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          zip: profile.zipCode,
          country: profile.country,
          dob: profile.dateOfBirth,
          gender: profile.gender,
          blood_group: profile.bloodGroup,
          emergency_contact: profile.emergencyContact
        })
      });

      const data = await res.json();
      setIsLoading(false);

      if (data.success) {
        toast.success("Profile updated successfully");
      } else {
        toast.error("Profile update failed");
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      toast.error("Server error");
    }
  };

  // =============================
  // PASSWORD CHANGE
  // =============================
  const handlePasswordChange = async () => {
    if (!password.current || !password.new || !password.confirm) {
      toast.error("All fields are required");
      return;
    }

    if (password.new !== password.confirm) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.new.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: password.current,
          newPassword: password.new
        })
      });

      const data = await res.json();
      setIsLoading(false);

      if (data.success) {
        toast.success("Password changed successfully");
        setPassword({ current: "", new: "", confirm: "" });
      } else {
        toast.error(data.error || "Password change failed");
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      toast.error("Server error");
    }
  };

  // =============================
  // NOTIFICATION HANDLER
  // =============================
  const handleNotificationChange = async (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    
    try {
      // API call to save notification preference
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/settings/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ [key]: !notifications[key] })
      });
      toast.success("Notification preference updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update preference");
    }
  };

  // =============================
  // PREFERENCES HANDLER
  // =============================
  const handlePreferenceChange = async (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/settings/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ [key]: value })
      });
      toast.success("Preference updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update preference");
    }
  };

  // =============================
  // AVATAR UPLOAD
  // =============================
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Handle avatar upload
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // =============================
  // TABS CONFIGURATION
  // =============================
  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'preferences', name: 'Preferences', icon: MoonIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'privacy', name: 'Privacy', icon: ExclamationTriangleIcon },
    { id: 'connected', name: 'Connected Apps', icon: DevicePhoneMobileIcon },
  ];

  // =============================
  // RENDER
  // =============================
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600"></div>
        <div className="relative px-8 py-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-primary-100">
            Manage your account preferences and notifications
          </p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 shadow-md text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
          >
            <tab.icon className="h-5 w-5 mr-2" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* PROFILE TAB - ENHANCED */}
      {activeTab === "profile" && (
        <div className="card space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Profile Information</h2>
            {isFetching && <ArrowPathIcon className="h-5 w-5 animate-spin text-primary-600" />}
          </div>

          {isFetching ? (
            <div className="flex justify-center py-8">
              <ArrowPathIcon className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : (
            <>
              {/* Avatar Section */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Profile" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      profile.fullName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-primary-700">
                    <CameraIcon className="h-4 w-4" />
                  </label>
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{profile.fullName}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
                </div>
              </div>

              {/* Profile Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="input-field"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    className="input-field bg-gray-100 dark:bg-gray-700"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="input-field"
                    placeholder="10-digit mobile number"
                    maxLength="10"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Alternate Phone</label>
                  <input
                    type="tel"
                    value={profile.alternatePhone}
                    onChange={(e) => setProfile({ ...profile, alternatePhone: e.target.value })}
                    className="input-field"
                    placeholder="Alternate contact number"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Gender</label>
                  <select
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2">Blood Group</label>
                  <select
                    value={profile.bloodGroup}
                    onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm mb-2">Address</label>
                  <input
                    type="text"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="input-field"
                    placeholder="Street address"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">City</label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    className="input-field"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">State</label>
                  <input
                    type="text"
                    value={profile.state}
                    onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                    className="input-field"
                    placeholder="State"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={profile.zipCode}
                    onChange={(e) => setProfile({ ...profile, zipCode: e.target.value })}
                    className="input-field"
                    placeholder="ZIP code"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Country</label>
                  <input
                    type="text"
                    value={profile.country}
                    onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                    className="input-field"
                    placeholder="Country"
                  />
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm mb-2">Contact Name</label>
                    <input
                      type="text"
                      value={profile.emergencyContact.name}
                      onChange={(e) => setProfile({
                        ...profile,
                        emergencyContact: { ...profile.emergencyContact, name: e.target.value }
                      })}
                      className="input-field"
                      placeholder="Emergency contact name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={profile.emergencyContact.phone}
                      onChange={(e) => setProfile({
                        ...profile,
                        emergencyContact: { ...profile.emergencyContact, phone: e.target.value }
                      })}
                      className="input-field"
                      placeholder="Emergency contact number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Relation</label>
                    <input
                      type="text"
                      value={profile.emergencyContact.relation}
                      onChange={(e) => setProfile({
                        ...profile,
                        emergencyContact: { ...profile.emergencyContact, relation: e.target.value }
                      })}
                      className="input-field"
                      placeholder="e.g., Spouse, Parent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleProfileUpdate}
                  disabled={isLoading}
                  className="btn-primary flex items-center"
                >
                  {isLoading ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* NOTIFICATIONS TAB */}
      {activeTab === "notifications" && (
        <div className="card space-y-6">
          <h2 className="text-xl font-semibold">Notification Preferences</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Choose how you want to receive notifications
          </p>
          
          <div className="space-y-4">
            {/* Email Notifications */}
            <div className="border-b pb-4">
              <h3 className="font-medium mb-3 flex items-center">
                <EnvelopeIcon className="h-5 w-5 mr-2 text-primary-600" />
                Email Notifications
              </h3>
              <div className="space-y-3 pl-7">
                {Object.entries(notifications)
                  .filter(([key]) => key.includes('email') || key === 'monthlyReports' || key === 'promotionalEmails')
                  .map(([key, value]) => (
                    <NotificationToggle
                      key={key}
                      label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      checked={value}
                      onChange={() => handleNotificationChange(key)}
                    />
                  ))}
              </div>
            </div>

            {/* SMS Notifications */}
            <div className="border-b pb-4">
              <h3 className="font-medium mb-3 flex items-center">
                <DevicePhoneMobileIcon className="h-5 w-5 mr-2 text-primary-600" />
                SMS Notifications
              </h3>
              <div className="space-y-3 pl-7">
                {Object.entries(notifications)
                  .filter(([key]) => key.includes('sms') || key === 'appointmentAlerts' || key === 'labReportReady')
                  .map(([key, value]) => (
                    <NotificationToggle
                      key={key}
                      label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      checked={value}
                      onChange={() => handleNotificationChange(key)}
                    />
                  ))}
              </div>
            </div>

            {/* In-App Notifications */}
            <div>
              <h3 className="font-medium mb-3 flex items-center">
                <BellIcon className="h-5 w-5 mr-2 text-primary-600" />
                In-App Notifications
              </h3>
              <div className="space-y-3 pl-7">
                {Object.entries(notifications)
                  .filter(([key]) => key.includes('app') || key === 'vaccineDueAlerts' || key === 'prescriptionRefill')
                  .map(([key, value]) => (
                    <NotificationToggle
                      key={key}
                      label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      checked={value}
                      onChange={() => handleNotificationChange(key)}
                    />
                  ))}
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mr-2" />
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Important medical alerts cannot be turned off for safety reasons.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PREFERENCES TAB */}
      {activeTab === "preferences" && (
        <div className="card space-y-6">
          <h2 className="text-xl font-semibold">Preferences</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Language */}
            <div>
              <label className="block text-sm mb-2 flex items-center">
                <LanguageIcon className="h-4 w-4 mr-2 text-primary-600" />
                Language
              </label>
              <select
                value={preferences.language}
                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                className="input-field"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="gu">ગુજરાતી (Gujarati)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="ta">தமிழ் (Tamil)</option>
              </select>
            </div>

            {/* Theme */}
            <div>
              <label className="block text-sm mb-2 flex items-center">
                {darkMode ? <MoonIcon className="h-4 w-4 mr-2" /> : <SunIcon className="h-4 w-4 mr-2" />}
                Theme
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setDarkMode(false);
                    handlePreferenceChange('theme', 'light');
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                    !darkMode 
                      ? 'bg-primary-600 text-white border-primary-600' 
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <SunIcon className="h-5 w-5 mx-auto" />
                  <span className="text-xs mt-1">Light</span>
                </button>
                <button
                  onClick={() => {
                    setDarkMode(true);
                    handlePreferenceChange('theme', 'dark');
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                    darkMode 
                      ? 'bg-primary-600 text-white border-primary-600' 
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <MoonIcon className="h-5 w-5 mx-auto" />
                  <span className="text-xs mt-1">Dark</span>
                </button>
              </div>
            </div>

            {/* Time Format */}
            <div>
              <label className="block text-sm mb-2 flex items-center">
                <ClockIcon className="h-4 w-4 mr-2 text-primary-600" />
                Time Format
              </label>
              <select
                value={preferences.timeFormat}
                onChange={(e) => handlePreferenceChange('timeFormat', e.target.value)}
                className="input-field"
              >
                <option value="12h">12-hour (12:00 PM)</option>
                <option value="24h">24-hour (14:00)</option>
              </select>
            </div>

            {/* Date Format */}
            <div>
              <label className="block text-sm mb-2 flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2 text-primary-600" />
                Date Format
              </label>
              <select
                value={preferences.dateFormat}
                onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                className="input-field"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
              </select>
            </div>

            {/* Week Start */}
            <div>
              <label className="block text-sm mb-2">Week Starts On</label>
              <select
                value={preferences.weekStart}
                onChange={(e) => handlePreferenceChange('weekStart', e.target.value)}
                className="input-field"
              >
                <option value="sunday">Sunday</option>
                <option value="monday">Monday</option>
              </select>
            </div>

            {/* Default View */}
            <div>
              <label className="block text-sm mb-2">Default Dashboard View</label>
              <select
                value={preferences.defaultView}
                onChange={(e) => handlePreferenceChange('defaultView', e.target.value)}
                className="input-field"
              >
                <option value="dashboard">Dashboard</option>
                <option value="appointments">Appointments</option>
                <option value="health-records">Health Records</option>
                <option value="prescriptions">Prescriptions</option>
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm mb-2">Font Size</label>
              <select
                value={preferences.fontSize}
                onChange={(e) => handlePreferenceChange('fontSize', e.target.value)}
                className="input-field"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>

          {/* Toggle Options */}
          <div className="space-y-4 border-t pt-6">
            <ToggleOption
              label="Compact View"
              description="Show more content with reduced spacing"
              checked={preferences.compactView}
              onChange={(checked) => handlePreferenceChange('compactView', checked)}
            />
            
            <ToggleOption
              label="Auto-save Forms"
              description="Automatically save form data as you type"
              checked={preferences.autoSave}
              onChange={(checked) => handlePreferenceChange('autoSave', checked)}
            />
          </div>
        </div>
      )}

      {/* SECURITY TAB */}
      {activeTab === "security" && (
        <div className="space-y-6">
          {/* Change Password */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <KeyIcon className="h-5 w-5 mr-2 text-primary-600" />
              Change Password
            </h2>
            
            <div className="space-y-4 max-w-md">
              <input
                type="password"
                placeholder="Current Password"
                value={password.current}
                onChange={(e) => setPassword({ ...password, current: e.target.value })}
                className="input-field"
              />
              <input
                type="password"
                placeholder="New Password"
                value={password.new}
                onChange={(e) => setPassword({ ...password, new: e.target.value })}
                className="input-field"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={password.confirm}
                onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                className="input-field"
              />
              
              {/* Password Strength Indicator */}
              {password.new && (
                <div className="space-y-2">
                  <div className="flex space-x-1">
                    {['Weak', 'Medium', 'Strong'].map((strength, index) => (
                      <div
                        key={strength}
                        className={`h-1 flex-1 rounded-full ${
                          index < getPasswordStrength(password.new)
                            ? 'bg-green-500'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Password must be at least 8 characters with mix of letters, numbers & symbols
                  </p>
                </div>
              )}

              <button
                onClick={handlePasswordChange}
                disabled={isLoading}
                className="btn-primary"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Two-Factor Authentication</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add an extra layer of security to your account
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={twoFactor.enabled}
                  onChange={() => setTwoFactor({ ...twoFactor, enabled: !twoFactor.enabled })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                              peer-focus:ring-primary-300 rounded-full peer 
                              peer-checked:after:translate-x-full peer-checked:after:border-white 
                              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                              after:bg-white after:border-gray-300 after:border after:rounded-full 
                              after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600">
                </div>
              </label>
            </div>

            {twoFactor.enabled && (
              <div className="mt-4 space-y-4">
                <select
                  value={twoFactor.method}
                  onChange={(e) => setTwoFactor({ ...twoFactor, method: e.target.value })}
                  className="input-field max-w-xs"
                >
                  <option value="app">Authenticator App</option>
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                </select>

                <button className="btn-secondary">
                  {twoFactor.verified ? 'Configure 2FA' : 'Verify & Enable'}
                </button>
              </div>
            )}
          </div>

          {/* Active Sessions */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Active Sessions</h2>
            
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {session.device}
                      {session.current && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Current
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {session.location} • Last active: {new Date(session.lastActive).toLocaleString()}
                    </p>
                  </div>
                  {!session.current && (
                    <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium">
              Sign out all other devices
            </button>
          </div>
        </div>
      )}

      {/* PRIVACY TAB */}
      {activeTab === "privacy" && (
        <div className="card space-y-6">
          <h2 className="text-xl font-semibold">Privacy Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Profile Visibility</label>
              <select
                value={privacy.profileVisibility}
                onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                className="input-field max-w-xs"
              >
                <option value="public">Public - Everyone can see</option>
                <option value="private">Private - Only me</option>
                <option value="contacts">Contacts - Only my doctors</option>
              </select>
            </div>

            <ToggleOption
              label="Share Medical History"
              description="Allow doctors to access your complete medical history"
              checked={privacy.shareMedicalHistory}
              onChange={(checked) => setPrivacy({ ...privacy, shareMedicalHistory: checked })}
            />

            <ToggleOption
              label="Share Appointments"
              description="Show your appointments to connected family members"
              checked={privacy.shareAppointments}
              onChange={(checked) => setPrivacy({ ...privacy, shareAppointments: checked })}
            />

            <ToggleOption
              label="Share Prescriptions"
              description="Allow pharmacies to access your prescriptions"
              checked={privacy.sharePrescriptions}
              onChange={(checked) => setPrivacy({ ...privacy, sharePrescriptions: checked })}
            />

            <ToggleOption
              label="Data Collection"
              description="Help us improve by collecting anonymous usage data"
              checked={privacy.allowDataCollection}
              onChange={(checked) => setPrivacy({ ...privacy, allowDataCollection: checked })}
            />

            <ToggleOption
              label="Marketing Emails"
              description="Receive updates about new features and offers"
              checked={privacy.allowMarketingEmails}
              onChange={(checked) => setPrivacy({ ...privacy, allowMarketingEmails: checked })}
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Download Your Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Get a copy of all your personal data stored in our system
            </p>
            <button className="btn-secondary">
              Request Data Export
            </button>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
            <button className="flex items-center text-red-600 hover:text-red-700 font-medium">
              <TrashIcon className="h-5 w-5 mr-2" />
              Delete Account
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Once you delete your account, there is no going back. Please be certain.
            </p>
          </div>
        </div>
      )}

      {/* CONNECTED APPS TAB */}
      {activeTab === "connected" && (
        <div className="card space-y-6">
          <h2 className="text-xl font-semibold flex items-center">
            <LinkIcon className="h-5 w-5 mr-2 text-primary-600" />
            Connected Accounts
          </h2>
          
          <div className="space-y-4">
            {connectedAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{account.icon}</span>
                  <div>
                    <p className="font-medium">{account.name}</p>
                    {account.email && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{account.email}</p>
                    )}
                    {account.connected && account.permissions.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Permissions: {account.permissions.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                
                {account.connected ? (
                  <button
                    onClick={() => handleDisconnectAccount(account.id)}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnectAccount(account.id)}
                    className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Connected apps can access your data based on their permissions. 
              Review and manage access regularly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const NotificationToggle = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm">{label}</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                    peer-focus:ring-primary-300 rounded-full peer 
                    peer-checked:after:translate-x-full peer-checked:after:border-white 
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                    after:bg-white after:border-gray-300 after:border after:rounded-full 
                    after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600">
      </div>
    </label>
  </div>
);

const ToggleOption = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <p className="font-medium">{label}</p>
      {description && <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>}
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                    peer-focus:ring-primary-300 rounded-full peer 
                    peer-checked:after:translate-x-full peer-checked:after:border-white 
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                    after:bg-white after:border-gray-300 after:border after:rounded-full 
                    after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600">
      </div>
    </label>
  </div>
);

// Helper function for password strength
const getPasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
};

export default Settings;