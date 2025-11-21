import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Twitter,
  Linkedin,
  Facebook,
  Youtube,
  Instagram,
  Smartphone,
  Headphones,
  ShoppingBag,
  Star,
  Snowflake,
  Mail,
  Phone,
  MapPin,
  Pencil,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import FeedbackModal from './FeedbackModal';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const handleReviewClick = () => {
    const token = sessionStorage.getItem('accessToken');

    // Debug xem token có thực sự rỗng không
    console.log('Token check:', token);

    // Kiểm tra kỹ: nếu token không có, hoặc là chuỗi "undefined" (lỗi do lưu sai)
    if (!token || token === 'undefined') {
      const confirmLogin = window.confirm('Bạn cần đăng nhập để gửi đánh giá. Đăng nhập ngay?');

      // SỬA LỖI Ở ĐÂY: Dùng biến confirmLogin, không phải window.confirmLogin
      if (confirmLogin) {
        navigate('/Auth');
      }
      return; // Dừng hàm, không cho mở Modal
    }

    setIsModalOpen(true);
  };

  const infomation = [
    { name: 'Về chúng tôi', href: '#' },
    { name: 'Tin tức', href: '#' },
    { name: 'Đội ngũ giáo viên', href: '#' },
    { name: 'Khóa học', href: '#' },
    { name: 'Bảng xếp hạng', href: '#' },
  ];

  const support = [
    { name: 'Hỗ trợ / FAQ', href: '#' },
    { name: 'Liên hệ', href: '#' },
    { name: 'Cộng đồng', href: '#' },
    { name: 'Báo lỗi', href: '#' },
    { name: 'Gửi đánh giá', icon: <Pencil className="h-4 w-4" />, isButton: true },
  ];

  const socialIcons = [
    {
      Icon: Facebook,
      href: 'https://www.facebook.com/share/1A2Q2YZxps/',
      label: 'Facebook',
    },
    { Icon: Youtube, href: '#', label: 'YouTube' },
    {
      Icon: () => (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      href: '#',
      label: 'Instagram',
    },
    {
      Icon: () => (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 112.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
        </svg>
      ),
      href: 'https://www.tiktok.com/@flnguoitot?_t=ZS-90bPFMSvY4Q&_r=1',
      label: 'TikTok',
    },
  ];

  return (
    <footer className="bg-black py-16 text-gray-300 shadow-lg dark:bg-green-100">
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reviewType="website"
      />
      <div className="my-6 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="mb-12 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {/* Key Links */}
          <div>
            {/* Logo */}
            <Link to="/" className="group flex shrink-0 items-center gap-2">
              <div className="relative">
                <Snowflake className="h-10 w-10 text-amber-500 transition-transform duration-700 ease-in-out group-hover:rotate-180" />
                <div className="absolute inset-0 animate-pulse bg-amber-500/20 blur-md" />
              </div>
              <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-2xl font-bold whitespace-nowrap text-transparent italic md:text-3xl">
                Flashcard
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-stone-200">
              Nền tảng học từ vựng thông minh giúp bạn ghi nhớ kiến thức lâu dài và hiệu quả hơn.
            </p>
            {/* Contact Info */}
            <div className="mt-4 space-y-3 border-t border-gray-800/50 pt-2">
              <div className="flex items-center gap-3 text-sm text-gray-400 transition-colors hover:text-amber-500">
                <Mail className="h-4 w-4 shrink-0 text-amber-500" />
                <span>doanminhthanh205@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400 transition-colors hover:text-amber-500">
                <Phone className="h-4 w-4 shrink-0 text-amber-500" />
                <span>(+84) 963 145 061</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400 transition-colors hover:text-amber-500">
                <MapPin className="h-4 w-4 shrink-0 text-amber-500" />
                <span>ĐH Kỹ Thuật - Công Nghệ Cần Thơ</span>
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div>
            <h3 className="mb-6 text-lg font-semibold text-white dark:text-amber-500">Thông tin</h3>
            <ul className="space-y-2">
              {infomation.map((subject, index) => (
                <li key={index}>
                  <a
                    href={subject.href}
                    className="relative inline-block h-9 w-full rounded-2xl bg-[#1d1d1d] text-base text-white transition-all duration-300 hover:translate-x-1 hover:bg-white hover:text-gray-900 hover:after:w-full dark:bg-white dark:text-stone-600 dark:hover:bg-green-500 dark:hover:text-white"
                  >
                    <span className="relative z-10 flex h-full items-center pl-3">
                      {subject.name}
                    </span>
                    <div className="absolute inset-0 -z-10 scale-0 rounded bg-blue-500/20 transition-transform duration-300 group-hover:scale-100"></div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* support */}
          <div>
            <h3 className="mb-6 text-lg font-semibold text-white dark:text-amber-500">
              Hỗ trợ & Cộng đồng
            </h3>
            <ul className="space-y-2">
              {support.map((item, index) => (
                <li key={index}>
                  {item.isButton ? (
                    <button
                      onClick={handleReviewClick}
                      className="relative inline-block h-9 w-full cursor-pointer rounded-2xl bg-[#1d1d1d] text-left text-base text-white transition-all hover:bg-white hover:text-black"
                    >
                      <span className="relative z-10 flex h-full items-center gap-2 pl-3">
                        {item.icon} {item.name}
                      </span>
                    </button>
                  ) : (
                    <a
                      href={item.href}
                      className="relative inline-block h-9 w-full rounded-2xl bg-[#1d1d1d] text-base text-white transition-all duration-300 hover:translate-x-1 hover:bg-white hover:text-gray-900 hover:after:w-full dark:bg-white dark:text-stone-600 dark:hover:bg-green-500 dark:hover:text-white"
                    >
                      <span className="relative z-10 flex h-full items-center pl-3">
                        {item.name}
                      </span>
                      <div className="absolute inset-0 -z-10 scale-0 rounded bg-blue-500/20 transition-transform duration-300 group-hover:scale-100"></div>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Find Us & QR Code */}
          <div>
            <h3 className="mb-6 text-lg font-semibold text-white dark:text-amber-500">
              Tìm kiếm về chúng tôi!
            </h3>

            {/* Social Icons */}
            <div className="mb-8 flex flex-wrap gap-3">
              {socialIcons.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="group flex h-10 w-10 items-center justify-center rounded-lg bg-[#1d1d1d] text-base text-gray-300 transition-all duration-300 hover:scale-110 hover:bg-slate-700 hover:text-white hover:shadow-lg dark:bg-white dark:text-stone-600 dark:hover:bg-green-300"
                  aria-label={social.label}
                >
                  <social.Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                </a>
              ))}
            </div>

            {/* QR Code */}
            <div className="animate-float mx-auto mb-2 flex items-center bg-transparent">
              <div className="flex h-28 w-28 items-center justify-center rounded-sm bg-white">
                <QRCodeCanvas
                  value="https://www.facebook.com/share/1BaukMr6d6/"
                  size={96} // size
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H" // mức sửa lỗi cao nhất (H = High) - vẫn có thể được quét ngay cả khi bị mờ, xước, hay che mất một phần.
                  includeMargin={false} // bỏ khoảng trắng ngoài viền QR
                />
              </div>
            </div>

            <p className="mb-2 text-sm text-gray-400">Quét mã để tải app!</p>
            {/* App Store Buttons */}
            <div className="space-y-2">
              <a
                href="#"
                className="group flex items-center rounded-xl bg-[#1d1d1d] px-4 py-3 text-white transition-all duration-300 hover:scale-105 hover:bg-gray-800 dark:bg-white dark:text-stone-600 dark:hover:bg-green-300"
              >
                <div className="mr-3">
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs">Download on the</div>
                  <div className="-mt-1 text-sm font-semibold">App Store</div>
                </div>
              </a>

              <a
                href="#"
                className="group flex items-center rounded-xl bg-[#1d1d1d] px-4 py-3 text-white transition-all duration-300 hover:scale-105 hover:bg-gray-800 dark:bg-white dark:text-stone-600 dark:hover:bg-green-300"
              >
                <div className="mr-3">
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs">GET IT ON</div>
                  <div className="-mt-1 text-sm font-semibold">Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>
        {/* Bottom section */}
        <div className="my-6 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
        <div className="pt-2">
          <div className="space-y-2 text-center">
            <p className="text-sm text-gray-400">
              FlashCard giúp bạn đạt được mục tiêu nhanh hơn, thông qua thói quen học tập tốt hơn.
            </p>
            <p className="text-sm text-gray-500">
              © 2025 Student Project.
              <a
                href="#"
                className="ml-1 text-blue-400 transition-colors duration-300 hover:text-blue-300"
              >
                Điều khoản và Điều kiện.
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
