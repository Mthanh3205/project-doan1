import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FlashcardPreview from '@/components/FlashcardPreview';
import { Zap, Layers, Smartphone, Users, BookOpen, Repeat, Star } from 'lucide-react';
//ảnh

import pic4 from '../assets/pic4.webp';
import pic6 from '../assets/pic6.png';

const HomePage = () => {
  const [stats, setStats] = useState([
    { id: 'users', num: '0', label: 'Người dùng', icon: <Users className="h-6 w-6" /> },
    { id: 'vocabs', num: '0', label: 'Bộ từ vựng', icon: <BookOpen className="h-6 w-6" /> },
    { id: 'reviews', num: '0', label: 'Lượt ôn tập', icon: <Repeat className="h-6 w-6" /> },
    { id: 'rating', num: '0', label: 'Đánh giá', icon: <Star className="h-6 w-6" /> },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('https://project-doan1-backend.onrender.com/api/statistics');
        const result = await response.json();

        if (result.success) {
          const data = result.data;

          setStats((prevStats) => [
            {
              ...prevStats[0],
              num: data.users.toLocaleString() + '+',
            },
            {
              ...prevStats[1],
              num: data.topics.toLocaleString() + '+',
            },
            {
              ...prevStats[2],
              num: (data.reviews / 1000).toFixed(1) + 'k+',
            },
            {
              ...prevStats[3],
              num: data.rating + '/5',
            },
          ]);
        }
      } catch (error) {
        console.error('Không thể lấy dữ liệu thống kê:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex-wrap bg-[#121212] bg-gradient-to-br text-2xl text-white md:text-lg lg:text-xl xl:text-2xl dark:from-amber-100 dark:via-white dark:to-gray-100">
      <div className="sticky top-0 z-50 shadow-md">
        {/* Header */}
        <Header />
      </div>

      {/* Content1 */}
      <div className="container-content flex-wrap pt-6 text-2xl md:text-lg lg:text-xl xl:text-2xl">
        <div className="min-h-screen">
          {/* Hero Section */}
          <section className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="w-full text-center md:w-full md:text-center">
              <motion.h1
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl leading-normal font-extrabold text-orange-500 md:text-6xl"
              >
                Học Từ Vựng Cùng{' '}
                <span className="relative inline-block before:absolute before:-inset-x-2 before:inset-y-1 before:block before:-skew-y-3 before:bg-pink-500">
                  <span className="relative z-10 text-white">Flashcard</span>
                </span>
              </motion.h1>

              <p className="my-12 mt-6 flex w-full items-center justify-center text-center text-lg text-gray-300 dark:text-gray-800">
                Ghi nhớ từ vựng tiếng Anh hiệu quả bằng phương pháp lặp lại ngắt quãng (Spaced
                Repetition).
              </p>

              <div className="mt-10 flex w-full flex-col items-center justify-center gap-6 md:mt-12 md:flex-row">
                <motion.img
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  src={pic6}
                  alt="Học tập minh họa"
                  className="w-full max-w-sm rounded-xl object-cover drop-shadow-2xl md:w-1/2 lg:max-w-lg"
                />
                <motion.img
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  src={pic4}
                  alt="Học tập minh họa"
                  className="w-full max-w-sm rounded-xl object-cover drop-shadow-2xl md:w-1/2 lg:max-w-lg"
                />
              </div>
              <div className="mt-8 flex justify-center gap-4">
                <a
                  href="/test"
                  className="rounded-full border px-6 py-3 font-semibold transition-all duration-300 hover:scale-105 hover:bg-amber-500 dark:bg-gray-900 dark:text-white dark:hover:bg-white dark:hover:text-black"
                >
                  Bắt đầu học ngay
                </a>
                <a
                  href="/courses"
                  className="rounded-full border px-6 py-3 font-semibold transition-all duration-300 hover:scale-105 hover:bg-amber-500 dark:bg-gray-900 dark:text-white dark:hover:bg-white dark:hover:text-black"
                >
                  Xem các khóa học
                </a>
              </div>
            </div>
          </section>

          <div className="h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
          {/* Features */}
          <section className="dark:white bg-gradient-to-b from-black via-white/20 to-black px-6 py-16 dark:from-transparent dark:via-transparent dark:to-transparent">
            <h2 className="mb-10 text-center text-3xl font-bold text-amber-600">
              Tại sao chọn Flashcard?
            </h2>
            <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
              {[
                {
                  icon: <Zap className="text-amber-500" />,
                  title: 'Ghi nhớ hiệu quả',
                  desc: 'Áp dụng thuật toán SRS giúp bạn học nhanh, nhớ lâu.',
                },
                {
                  icon: <Layers className="text-amber-500" />,
                  title: 'Kho từ phong phú',
                  desc: 'Từ vựng được chia theo cấp độ CEFR và chủ đề đa dạng.',
                },
                {
                  icon: <Smartphone className="text-amber-500" />,
                  title: 'Học mọi lúc mọi nơi',
                  desc: 'Đồng bộ dữ liệu qua tài khoản, học trên mọi thiết bị.',
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="bg-[#1d1d1d] p-6 text-center shadow-lg transition-all duration-300 hover:-translate-y-2 dark:bg-transparent"
                >
                  <h3 className="mb-3 inline-flex gap-2 text-xl font-semibold text-amber-400">
                    {f.icon}
                    {f.title}
                  </h3>
                  <p className="text-gray-300 dark:text-black">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>
          <div className="h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

          {/* Preview flashcards */}
          <section className="dark:white px-6 py-16 text-center">
            <h2 className="mb-10 text-3xl font-bold text-amber-600">Flashcards</h2>
            <div className="flex flex-col items-center justify-center space-y-6 md:flex-row md:space-y-0 md:space-x-6">
              <FlashcardPreview word="Apple" meaning="Quả táo" />
              <FlashcardPreview word="Beautiful" meaning="Xinh đẹp" />
              <FlashcardPreview word="Journey" meaning="Hành trình" />
            </div>
          </section>

          {/* Thống kê */}
          <section className="relative overflow-hidden border-y border-amber-500/20 bg-[#121212] py-16">
            {/* Hiệu ứng nền trang trí mờ ảo */}
            <div className="absolute top-0 left-1/4 -z-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl"></div>
            <div className="absolute right-1/4 bottom-0 -z-10 h-64 w-64 rounded-full bg-pink-500/10 blur-3xl"></div>

            <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative flex flex-col items-center justify-center p-4"
                >
                  {/* Icon với hiệu ứng nền sáng lên khi hover */}
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white">
                    {stat.icon}
                  </div>

                  {/* Số liệu với Gradient Text */}
                  <div className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text font-extrabold text-transparent md:text-3xl">
                    {stat.num}
                  </div>

                  {/* Label */}
                  <div className="mt-2 text-xs font-medium tracking-wider text-gray-500 uppercase transition-colors group-hover:text-amber-500 dark:text-gray-400">
                    {stat.label}
                  </div>

                  {/* Đường gạch chân trang trí nhỏ */}
                  <div className="mt-4 h-1 w-0 rounded-full bg-amber-500 transition-all duration-300 group-hover:w-12"></div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Đánh giá */}
          <section className="px-6 pt-16">
            <h2 className="mb-10 text-center text-3xl font-bold text-amber-500">
              Học viên nói gì về Flashcard?
            </h2>
            <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
              {[
                {
                  name: 'Minh Tú',
                  role: 'Sinh viên',
                  text: 'Nhờ Flashcard mà mình đã qua môn Tiếng Anh B1 một cách dễ dàng. Giao diện rất dễ dùng!',
                },
                {
                  name: 'Hoàng Nam',
                  role: 'Developer',
                  text: 'Thuật toán lặp lại ngắt quãng cực kỳ hiệu quả. Mình nhớ từ vựng lâu hơn hẳn.',
                },
                {
                  name: 'Lan Anh',
                  role: 'IELTS 7.0',
                  text: 'Kho từ vựng phong phú, có cả phát âm chuẩn. Rất đáng để trải nghiệm.',
                },
              ].map((user, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-800 bg-[#1d1d1d] p-6 shadow-lg"
                >
                  <div className="mb-4 flex items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 to-pink-500 font-bold text-white">
                      {user.name[0]}
                    </div>
                    <div className="ml-3">
                      <h4 className="font-bold text-white">{user.name}</h4>
                      <span className="text-xs text-gray-400">{user.role}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 italic">"{user.text}"</p>
                </div>
              ))}
            </div>
          </section>

          {/* Call to action */}
          <section className="py-16 text-center text-amber-400 dark:text-gray-900">
            <h2 className="mb-4 text-3xl font-bold">Sẵn sàng bắt đầu?</h2>
            <p className="mb-6 text-lg">
              Đăng ký ngay để truy cập kho học liệu và luyện tập flashcard miễn phí.
            </p>
            <a
              href="/Auth"
              className="rounded-full border px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-amber-500 dark:bg-gray-900 dark:hover:bg-white dark:hover:text-black"
            >
              Đăng ký ngay
            </a>
          </section>
        </div>
      </div>

      <div className=" ">
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
