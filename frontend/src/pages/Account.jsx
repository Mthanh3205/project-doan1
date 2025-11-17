import React, { useState, useEffect } from 'react';
import {
  Settings,
  Home,
  Camera,
  User,
  Mail,
  Briefcase,
  GraduationCap,
  FileText,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

const InputField = ({
  label,
  icon: Icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled,
}) => (
  <div className="group relative">
    <label className="mb-1.5 block text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
      {label}
    </label>
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-teal-500" />
      </div>
      {type === 'textarea' ? (
        <textarea
          value={value || ''}
          onChange={onChange}
          rows={4}
          className="block w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 transition-all outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          placeholder={placeholder}
          disabled={disabled}
        />
      ) : (
        <input
          type={type}
          value={value || ''}
          onChange={onChange}
          className="block w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 transition-all outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
    </div>
  </div>
);

const Account = () => {
  const defaultAvatar = '/avt.jpg';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    schoolName: '',
    companyName: '',
    bio: '',
    avatar: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [previewAvatar, setPreviewAvatar] = useState(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        const splitName = parsedUser.name ? parsedUser.name.split(' ') : ['', ''];
        const initialFirstName = parsedUser.firstName || splitName[0] || '';
        const initialLastName = parsedUser.lastName || splitName.slice(1).join(' ') || '';

        setFormData({
          firstName: initialFirstName,
          lastName: initialLastName,
          email: parsedUser.email || '',

          schoolName: parsedUser.schoolName || '',
          companyName: parsedUser.companyName || '',
          bio: parsedUser.bio || '',

          avatar: parsedUser.picture || parsedUser.avatar || defaultAvatar,
        });
      } catch (e) {
        console.error('Lỗi parse user data', e);
      }
    }
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (status.message) setStatus({ type: '', message: '' });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewAvatar(objectUrl);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const token = sessionStorage.getItem('token');

      if (!token) {
        console.warn('Chưa có token!');
      }

      const res = await fetch('https://project-doan1-backend.onrender.com/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Gửi kèm token
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Không thể cập nhật. Vui lòng thử lại.');

      const data = await res.json();

      const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
      const updatedUser = {
        ...currentUser,
        firstName: data.firstName,
        lastName: data.lastName,
        name: data.name || `${data.firstName} ${data.lastName}`,
        schoolName: data.schoolName,
        companyName: data.companyName,
        bio: data.bio,
        picture: data.avatar || currentUser.picture,
      };

      sessionStorage.setItem('user', JSON.stringify(updatedUser));

      setFormData((prev) => ({
        ...prev,
        firstName: data.firstName,
        lastName: data.lastName,
        schoolName: data.schoolName,
        companyName: data.companyName,
        bio: data.bio,
        avatar: data.avatar,
      }));

      setStatus({ type: 'success', message: 'Đã lưu thay đổi thành công!' });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err.message || 'Lỗi kết nối server.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getAvatarSrc = () => {
    if (previewAvatar) return previewAvatar;

    const avt = formData.avatar;
    if (!avt) return defaultAvatar;
    if (avt.startsWith('http')) return avt;

    return `https://project-doan1-backend.onrender.com${avt}`;
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans dark:bg-[#0a0a0a]">
      {/* Sidebar (Ẩn trên mobile) */}
      <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white p-5 md:flex dark:border-gray-800 dark:bg-black">
        <div className="mb-8 flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-white">
          <Settings className="text-teal-500" />
          <span>MySettings</span>
        </div>

        <div className="mb-6 text-center">
          <img
            src={getAvatarSrc()}
            alt="User"
            className="mx-auto h-16 w-16 rounded-full object-cover ring-2 ring-gray-100"
          />
          <h3 className="mt-3 truncate text-sm font-semibold text-gray-900 dark:text-white">
            {formData.firstName} {formData.lastName}
          </h3>
        </div>

        <nav className="space-y-1">
          <a
            href="#"
            className="flex items-center gap-3 rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700 dark:bg-teal-500/10 dark:text-teal-400"
          >
            <User size={18} /> Thông tin cá nhân
          </a>
          <a
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <Home size={18} /> Trang chủ
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Hồ sơ cá nhân</h1>
          <p className="mb-8 text-sm text-gray-500">
            Quản lý thông tin hiển thị của bạn trên hệ thống.
          </p>

          {/* Thông báo */}
          {status.message && (
            <div
              className={`mb-6 flex items-center gap-2 rounded-lg p-4 text-sm font-medium ${status.type === 'success' ? 'border border-green-200 bg-green-50 text-green-700' : 'border border-red-200 bg-red-50 text-red-700'}`}
            >
              {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              {status.message}
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cột trái: Avatar */}
            <div className="h-fit rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-[#121212]">
              <div className="group relative mx-auto inline-block">
                <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-md dark:border-gray-700">
                  <img src={getAvatarSrc()} className="h-full w-full object-cover" alt="Avatar" />
                </div>
                <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 opacity-0 transition-all group-hover:opacity-100">
                  <Camera className="text-white" size={24} />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <p className="mt-4 text-xs text-gray-500">Cho phép định dạng: JPG, PNG (Max 5MB)</p>
            </div>

            {/* Cột phải: Form nhập liệu */}
            <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-gray-800 dark:bg-[#121212]">
              <div className="grid gap-6 md:grid-cols-2">
                <InputField
                  label="Họ (First Name)"
                  icon={User}
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
                <InputField
                  label="Tên (Last Name)"
                  icon={User}
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              </div>

              <InputField label="Email" icon={Mail} value={formData.email} disabled={true} />

              <div className="grid gap-6 md:grid-cols-2">
                <InputField
                  label="Trường học"
                  icon={GraduationCap}
                  value={formData.schoolName}
                  onChange={(e) => handleInputChange('schoolName', e.target.value)}
                  placeholder="VD: ĐH Bách Khoa"
                />
                <InputField
                  label="Công ty / Nơi làm việc"
                  icon={Briefcase}
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="VD: FPT Software"
                />
              </div>

              <InputField
                label="Giới thiệu ngắn (Bio)"
                type="textarea"
                icon={FileText}
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Một chút về bản thân bạn..."
              />

              <div className="flex justify-end border-t border-gray-100 pt-4 dark:border-gray-700">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-teal-700 disabled:opacity-70"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Account;
