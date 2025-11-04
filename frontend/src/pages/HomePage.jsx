import React from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FlashcardPreview from '@/components/FlashcardPreview';

const HomePage = () => {
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
            <motion.h1
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-extrabold text-orange-500 md:text-6xl"
            >
              Học Từ Vựng Cùng{' '}
              <span className="relative inline-block before:absolute before:-inset-2 before:block before:-skew-y-3 before:bg-pink-500">
                <span className="relative text-white">Flashcard</span>
              </span>
            </motion.h1>
            <p className="mt-6 max-w-2xl text-lg text-gray-300 dark:text-gray-800">
              Ghi nhớ từ vựng tiếng Anh hiệu quả bằng phương pháp lặp lại ngắt quãng (Spaced
              Repetition).
            </p>
            <div className="mt-8 flex gap-4">
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
                  title: 'Ghi nhớ hiệu quả',
                  desc: 'Áp dụng thuật toán SRS giúp bạn học nhanh, nhớ lâu.',
                },
                {
                  title: 'Kho từ phong phú',
                  desc: 'Từ vựng được chia theo cấp độ CEFR và chủ đề đa dạng.',
                },
                {
                  title: 'Học mọi lúc mọi nơi',
                  desc: 'Đồng bộ dữ liệu qua tài khoản, học trên mọi thiết bị.',
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-[#1d1d1d] p-6 text-center shadow-lg transition-all duration-300 hover:-translate-y-2 dark:bg-transparent"
                >
                  <h3 className="mb-3 text-xl font-semibold text-amber-400">{f.title}</h3>
                  <p className="text-gray-300 dark:text-black">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>
          <div className="h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

          {/* Preview flashcards */}
          <section className="dark:white px-6 py-16 text-center">
            <h2 className="mb-10 text-3xl font-bold text-amber-600">Xem thử Flashcards</h2>
            <div className="flex flex-wrap justify-center gap-6">
              <FlashcardPreview word="Apple" meaning="Quả táo" />
              <FlashcardPreview word="Beautiful" meaning="Xinh đẹp" />
              <FlashcardPreview word="Journey" meaning="Hành trình" />
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
