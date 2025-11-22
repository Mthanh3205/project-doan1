import React, { useState, useEffect } from 'react';
import {
  Settings,
  Home,
  Camera,
  User,
  Mail,
  Book,
  Briefcase,
  GraduationCap,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Star,
  Menu,
  X,
  Activity,
  MessageCircleMore,
  Bell,
  LogOut, // Thêm icon LogOut nếu cần
} from 'lucide-react';
import FeedbackModal from '../components/FeedbackModal';

const InputField = ({
  label,
  icon: Icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled,
}) => (
  <div className="group space-y-2">
    <label className="text-xs font-bold tracking-wider text-gray-400 uppercase transition-colors group-focus-within:text-teal-400 dark:text-gray-500 dark:group-focus-within:text-teal-600">
      {label}
    </label>
    <div className="relative transition-all duration-300 focus-within:-translate-y-0.5">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <Icon className="h-5 w-5 text-gray-500 transition-colors group-focus-within:text-teal-500 dark:text-gray-400" />
      </div>
      {type === 'textarea' ? (
        <textarea
          value={value || ''}
          onChange={onChange}
          rows={4}
          className="block w-full border border-gray-700 bg-gray-800/50 p-3 pl-12 text-sm font-medium text-white backdrop-blur-sm transition-all outline-none placeholder:text-gray-500 focus:border-teal-500 focus:bg-gray-800 focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-200 dark:bg-gray-50/50 dark:text-gray-900 dark:placeholder:text-gray-400 dark:focus:bg-white"
          placeholder={placeholder}
          disabled={disabled}
        />
      ) : (
        <input
          type={type}
          value={value || ''}
          onChange={onChange}
          className="block w-full border border-gray-700 bg-gray-800/50 p-3 pl-12 text-sm font-medium text-white backdrop-blur-sm transition-all outline-none placeholder:text-gray-500 focus:border-teal-500 focus:bg-gray-800 focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-200 dark:bg-gray-50/50 dark:text-gray-900 dark:placeholder:text-gray-400 dark:focus:bg-white"
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
    </div>
  </div>
);

const Account = () => {
  const defaultAvatar = '/avt.jpg';
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    schoolName: '',
    companyName: '',
    bio: '',
    avatar: null,
  });

  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewAvatar(objectUrl);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const token = sessionStorage.getItem('token');
      if (!token) throw new Error('Phiên đăng nhập hết hạn.');

      const dataToSend = new FormData();
      dataToSend.append('firstName', formData.firstName);
      dataToSend.append('lastName', formData.lastName);
      dataToSend.append('schoolName', formData.schoolName);
      dataToSend.append('companyName', formData.companyName);
      dataToSend.append('bio', formData.bio);

      if (imageFile) {
        dataToSend.append('avatar', imageFile);
      }

      const res = await fetch('https://project-doan1-backend.onrender.com/api/user/update', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: dataToSend,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Không thể cập nhật.');
      }

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
        avatar: data.avatar || prev.avatar,
      }));
      setImageFile(null);

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
    if (avt.startsWith('http') || avt.startsWith('blob')) return avt;
    return `https://project-doan1-backend.onrender.com${avt}`;
  };

  return (
    <div className="flex min-h-screen bg-[#121212] bg-gradient-to-br from-[#121212] via-black to-zinc-900 font-sans transition-colors duration-500 dark:from-stone-50 dark:via-white dark:to-amber-50">
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reviewType="website"
      />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/*  SIDEBAR  */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex min-h-screen w-72 flex-col border-r border-white/10 bg-[#121212]/95 transition-transform duration-300 ease-in-out dark:border-stone-200/60 dark:bg-white/95 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:sticky md:top-0 md:translate-x-0 md:bg-white/5 md:dark:bg-white/60`}
      >
        {/* HEADER & PROFILE*/}
        <div className="px-6 py-8">
          <div className="mb-8 flex h-10 shrink-0 items-center justify-between">
            <div className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-white dark:text-gray-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                <Settings size={22} />
              </div>
              <span>Settings</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="rounded-full p-1 text-gray-400 hover:bg-white/10 hover:text-white md:hidden dark:text-gray-500 dark:hover:bg-black/5 dark:hover:text-black"
            >
              <X size={24} />
            </button>
          </div>

          {/* Widget Profile */}
          <div className="border border-white/5 bg-white/5 p-4 text-center dark:border-white/50 dark:bg-white/40 dark:shadow-lg dark:shadow-stone-200/50">
            <div className="relative mx-auto h-16 w-16">
              <img
                src={getAvatarSrc()}
                alt="User"
                className="h-full w-full rounded-full object-cover ring-2 ring-white/10 dark:ring-white"
              />
              <span className="absolute right-0 bottom-0 h-4 w-4 rounded-full border-2 border-[#121212] bg-emerald-500 dark:border-white"></span>
            </div>
            <h3 className="mt-3 truncate text-sm font-bold text-gray-200 dark:text-gray-800">
              {formData.firstName} {formData.lastName}
            </h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-500">Member</p>
          </div>
        </div>

        <nav className="scrollbar-hide flex-1 space-y-2 overflow-y-auto px-6">
          <div className="pb-2 text-xs font-bold text-gray-400 uppercase">Menu</div>
          <div onClick={() => setIsSidebarOpen(false)} className="space-y-1">
            <NavItem href="#" icon={User} label="Thông tin cá nhân" active />
            <NavItem href="/favorites" icon={Star} label="Yêu thích" />
            <NavItem href="/progress" icon={Activity} label="Tiến trình" />

            <div
              onClick={() => setIsModalOpen(true)}
              className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-gray-400 transition-all duration-200 hover:bg-white/5 hover:text-white dark:text-gray-500 dark:hover:bg-gray-100/50 dark:hover:text-gray-900"
            >
              <MessageCircleMore
                size={20}
                className="text-gray-500 transition-colors group-hover:text-gray-300 dark:text-gray-400 dark:group-hover:text-gray-600"
              />
              Đánh giá & Góp ý
            </div>

            <NavItem href="#" icon={Bell} label="Thông báo" />
          </div>
        </nav>

        <div className="sticky bottom-0 mt-auto border-t border-white/10 bg-[#121212]/50 p-4 backdrop-blur-md dark:border-gray-200/60 dark:bg-white/50">
          <div onClick={() => setIsSidebarOpen(false)}>
            <NavItem href="/" icon={Home} label="Về trang chủ" />
          </div>
        </div>
      </aside>

      {/*  Main Content  */}
      <main className="flex-1 p-6 md:p-10">
        <div className="fixed -top-20 right-0 -z-10 h-96 w-96 rounded-full bg-amber-400/10 blur-[100px]"></div>
        <div className="fixed bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-blue-400/10 blur-[100px]"></div>

        <div className="mx-auto max-w-5xl">
          <header className="mb-10 flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 md:hidden dark:bg-black/5 dark:text-gray-800 dark:hover:bg-black/10"
            >
              <Menu size={24} />
            </button>

            <div className="flex-1">
              <h1 className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent md:text-4xl dark:from-gray-900 dark:to-gray-600">
                Hồ sơ của bạn
              </h1>
              <p className="mt-2 text-base text-gray-400 md:text-lg dark:text-gray-500">
                Quản lý thông tin cá nhân và hiển thị công khai.
              </p>
            </div>
          </header>

          {status.message && (
            <div
              className={`animate-fade-in-down mb-6 flex items-center gap-3 rounded-xl border p-4 font-medium shadow-lg backdrop-blur-md ${
                status.type === 'success'
                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 dark:border-emerald-200 dark:bg-emerald-50/80 dark:text-emerald-700'
                  : 'border-red-500/20 bg-red-500/10 text-red-400 dark:border-red-200 dark:bg-red-50/80 dark:text-red-700'
              }`}
            >
              {status.type === 'success' ? (
                <div className="rounded-full bg-emerald-500/20 p-1 text-emerald-600 dark:bg-emerald-100">
                  <CheckCircle size={20} />
                </div>
              ) : (
                <div className="rounded-full bg-red-500/20 p-1 text-red-600 dark:bg-red-100">
                  <AlertCircle size={20} />
                </div>
              )}
              {status.message}
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-12">
            {/* Cột Avatar */}
            <div className="lg:col-span-4">
              <div className="sticky top-10 flex flex-col items-center border border-white/5 bg-white/5 p-8 text-center backdrop-blur-xl dark:border-white/60 dark:bg-white/40 dark:shadow-2xl dark:shadow-stone-200/50">
                <div className="group relative mb-6 inline-block">
                  <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-white/10 bg-gray-800 shadow-2xl transition-transform duration-500 group-hover:scale-105 dark:border-white dark:bg-gray-100">
                    <img src={getAvatarSrc()} className="h-full w-full object-cover" alt="Avatar" />
                  </div>
                  <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                    <Camera className="text-white drop-shadow-lg" size={32} />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                  <div className="absolute right-2 bottom-2 rounded-full bg-[#1e1e1e] p-2 text-amber-500 shadow-lg dark:bg-white">
                    <Sparkles size={16} fill="currentColor" />
                  </div>
                </div>

                <h2 className="text-xl font-bold text-white dark:text-gray-900">
                  {formData.firstName} {formData.lastName}
                </h2>

                <div className="mt-6 w-full border border-blue-500/20 bg-[#1d1d1d] p-4 text-left dark:border-blue-100/50 dark:bg-blue-50/50">
                  <p className="text-xs font-bold text-blue-400 uppercase dark:text-blue-600">
                    Pro Tip
                  </p>
                  <p className="mt-1 text-xs text-blue-200/70 dark:text-blue-800/70">
                    Ảnh hồ sơ chuyên nghiệp giúp tăng độ tin cậy của tài khoản lên 40%.
                  </p>
                </div>
              </div>
            </div>

            {/* Cột Form */}
            <div className="lg:col-span-8">
              <div className="border border-white/5 bg-white/5 p-8 backdrop-blur-xl dark:border-white/60 dark:bg-white/40 dark:shadow-2xl dark:shadow-stone-200/50">
                <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4 dark:border-gray-200/60">
                  <h3 className="text-lg font-bold text-white dark:text-gray-900">
                    Thông tin chi tiết
                  </h3>
                  <span className="text-xs font-medium text-gray-400">Lần sửa cuối: Vừa xong</span>
                </div>

                <div className="space-y-8">
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

                  <InputField
                    label="Địa chỉ Email"
                    icon={Mail}
                    value={formData.email}
                    disabled={true}
                  />

                  <div className="grid gap-6 md:grid-cols-2">
                    <InputField
                      label="Trường học"
                      icon={GraduationCap}
                      value={formData.schoolName}
                      onChange={(e) => handleInputChange('schoolName', e.target.value)}
                      placeholder="VD: ĐH Bách Khoa TP.HCM"
                    />
                    <InputField
                      label="Nơi làm việc"
                      icon={Briefcase}
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="VD: Google, FPT..."
                    />
                  </div>

                  <InputField
                    label="Giới thiệu (Bio)"
                    type="textarea"
                    icon={FileText}
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Hãy viết đôi lời thú vị về bản thân bạn..."
                  />
                </div>

                <div className="mt-10 flex justify-end gap-4 border-t border-white/10 pt-6 dark:border-gray-200/60">
                  <button
                    className="px-6 py-3 text-sm font-semibold text-gray-200 transition-colors hover:bg-white/10 hover:text-white dark:text-gray-500 dark:hover:bg-gray-100/50 dark:hover:text-gray-900"
                    onClick={() => window.location.reload()}
                  >
                    Hủy bỏ
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="group relative flex items-center gap-2 overflow-hidden bg-gradient-to-r from-amber-400 to-orange-500 px-8 py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-amber-500/50 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"></div>
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Đang xử lý...
                      </>
                    ) : (
                      <>Lưu thay đổi</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ href, icon: Icon, label, active }) => (
  <a
    href={href}
    className={`group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-all duration-200 ${
      active
        ? 'bg-amber-500/20 text-amber-400 dark:bg-amber-100 dark:text-amber-700'
        : 'text-gray-400 hover:bg-white/5 hover:text-white dark:text-gray-500 dark:hover:bg-gray-100/50 dark:hover:text-gray-900'
    }`}
  >
    <Icon
      size={20}
      className={`transition-colors ${
        active
          ? 'text-amber-400 dark:text-amber-600'
          : 'text-gray-500 group-hover:text-gray-300 dark:text-gray-400 dark:group-hover:text-gray-600'
      }`}
    />
    {label}
  </a>
);

export default Account;
