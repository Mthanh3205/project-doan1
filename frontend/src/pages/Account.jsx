import React, { useState, useEffect } from 'react';
import { Settings, Eye, HelpCircle, Home } from 'lucide-react';
import ThemeToggle from '@/components/themeToggle';

const Account = () => {
  const defaultAvatar = '/avt.jpg'; // ảnh mặc định trong public/

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    schoolName: '',
    companyName: '',
    bio: '',
  });

  const [userInfo, setUserInfo] = useState({
    name: '',
    avatar: null,
    isLoggedIn: false,
  });

  // fetch data user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserInfo({
        name: parsedUser.name,
        avatar: parsedUser.picture || '/avt.jpg',
        isLoggedIn: true,
      });

      setProfileData((prev) => ({
        ...prev,
        firstName: parsedUser.name.split(' ')[0] || '',
        lastName: parsedUser.name.split(' ')[1] || '',
        email: parsedUser.email || '',
      }));
    }
  }, []);

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!res.ok) throw new Error('Failed to update profile');
      const data = await res.json();
      console.log('Profile updated:', data);

      // Đồng bộ state sau khi save
      setProfileData({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        schoolName: data.schoolName || '',
        companyName: data.companyName || '',
        bio: data.bio || '',
      });
      setUserInfo((prev) => ({
        ...prev,
        name: data.firstName + ' ' + data.lastName,
        avatar: data.avatar || prev.avatar || defaultAvatar,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#121212] bg-gradient-to-br dark:from-amber-100 dark:via-white dark:to-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white dark:bg-green-100">
        {/* Header */}
        <div className="border-b border-slate-600 p-4 dark:border-stone-200">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg">
              <a href="/">
                <Home className="size-7 cursor-pointer rounded-lg p-1 text-gray-100 transition hover:ring-2 hover:ring-[#00ffff] hover:ring-offset-2 hover:ring-offset-gray-900 dark:text-stone-800" />
              </a>
            </div>
            <Settings className="size-7 cursor-pointer rounded-lg p-1 text-gray-100 transition hover:ring-2 hover:ring-[#00ffff] hover:ring-offset-2 hover:ring-offset-gray-900 dark:text-stone-500" />
            <ThemeToggle />
          </div>
        </div>

        {/* User greeting */}
        <div className="border-b border-slate-600 p-4 dark:border-stone-200">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 overflow-hidden rounded-full">
              <img
                src={
                  userInfo.avatar?.startsWith('/uploads')
                    ? `${userInfo.avatar}`
                    : userInfo.avatar || '/avt.jpg'
                }
                alt="Profile"
                className="h-16 w-16 rounded-full object-cover"
                onError={(e) => (e.target.src = '/avt.jpg')}
              />
            </div>
            <span className="text-sm font-medium dark:text-stone-800">
              Hi, {userInfo.name || `${profileData.firstName} ${profileData.lastName}` || 'User'}!
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4">
          <div className="px-4 py-2 text-sm font-medium tracking-wider uppercase dark:text-gray-500">
            Account Overview
          </div>
          <div className="mt-2 space-y-1">
            <a href="#" className="flex items-center px-4 py-2 text-sm dark:text-gray-500">
              Profile Info
            </a>
            <a
              href="#"
              className="flex items-center px-4 py-2 text-sm hover:bg-slate-600 hover:text-white dark:text-gray-500 dark:hover:bg-white"
            >
              Account Settings
            </a>
            <a
              href="#"
              className="flex items-center px-4 py-2 text-sm hover:bg-slate-600 hover:text-white dark:text-gray-500 dark:hover:bg-white"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Public Profile
            </a>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-2xl font-semibold text-gray-100 dark:text-stone-800">
            Account Info
          </h1>

          <div className="rounded-4xl bg-[#1d1d1d] p-8 shadow-sm dark:bg-white">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Profile Avatar */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-100 dark:text-stone-700">
                    Profile Avatar
                  </label>
                  <div className="h-16 w-16 overflow-hidden rounded-full">
                    <img
                      src={
                        userInfo.avatar?.startsWith('/uploads')
                          ? `${userInfo.avatar}`
                          : userInfo.avatar || '/avt.jpg'
                      }
                      alt="Profile"
                      className="h-16 w-16 rounded-full object-cover"
                      onError={(e) => (e.target.src = '/avt.jpg')}
                    />
                  </div>
                </div>

                {/* First Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-100 dark:text-stone-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-stone-400 outline-none focus:border-transparent"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-100 dark:text-stone-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-stone-400 outline-none focus:border-transparent"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-100 dark:text-stone-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-stone-400 outline-none focus:border-transparent"
                  />
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  className="h-10 w-30 rounded-full border border-amber-400 bg-[#121212] font-semibold text-white shadow-lg transition-all duration-300 hover:scale-115 hover:bg-amber-400 hover:text-stone-600 hover:shadow-xl"
                >
                  SAVE
                </button>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* School Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-100 dark:text-stone-700">
                    School Name
                  </label>
                  <input
                    type="text"
                    value={profileData.schoolName}
                    onChange={(e) => handleInputChange('schoolName', e.target.value)}
                    placeholder="e.g. NYU"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-stone-600 placeholder-stone-400 outline-none focus:border-transparent dark:placeholder:text-stone-600"
                  />
                </div>

                {/* Company Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-100 dark:text-stone-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={profileData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="e.g. HBO"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-stone-600 placeholder-stone-400 outline-none focus:border-transparent dark:placeholder:text-stone-600"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-100 dark:text-stone-700">
                    Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="e.g. My bio"
                    rows={6}
                    className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-gray-300 placeholder-stone-400 outline-none focus:border-transparent dark:placeholder:text-stone-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Help Button */}
        <div className="fixed right-8 bottom-8">
          <button className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg transition-colors duration-200 hover:bg-teal-700 hover:ring-1">
            <HelpCircle className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;
