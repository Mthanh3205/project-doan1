import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function StudyFavorite() {
  const [flashcards, setFlashcards] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const userId = 1;

  useEffect(() => {
    const fetchFav = async () => {
      const res = await axios.get(
        `https://project-doan1-backend.onrender.com/api/favorites/${userId}`
      );
      setFlashcards(res.data);
    };
    fetchFav();
  }, []);

  const nextCard = () => {
    setFlipped(false);
    setIndex((prev) => (prev + 1) % flashcards.length);
  };
  const prevCard = () => {
    setFlipped(false);
    setIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  if (!flashcards.length)
    return <p className="mt-20 text-center text-gray-500">Không có từ yêu thích nào.</p>;

  const card = flashcards[index];

  return (
    <div className="min-h-screen bg-[#121212] text-white dark:bg-white dark:text-gray-900">
      <Header />
      <main className="mx-auto max-w-4xl py-16 text-center">
        <h1 className="mb-10 text-4xl font-bold text-amber-400">Học từ yêu thích</h1>
        <div
          onClick={() => setFlipped(!flipped)}
          className="relative mx-auto h-72 w-80 cursor-pointer [perspective:1000px]"
        >
          <div
            className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${
              flipped ? '[transform:rotateY(180deg)]' : ''
            }`}
          >
            {/* Front */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1d1d1d] p-6 text-white shadow-lg [backface-visibility:hidden] dark:bg-green-100 dark:text-gray-900">
              <h2 className="text-2xl font-bold text-amber-400">{card.front_text}</h2>
              <p className="mt-2 text-gray-400">{card.pronunciation}</p>
              <p className="mt-3 text-sm text-gray-500">(Nhấn để xem nghĩa)</p>
            </div>

            {/* Back */}
            <div className="absolute inset-0 flex [transform:rotateY(180deg)] flex-col items-center justify-center bg-[#1d1d1d] p-6 text-white shadow-lg [backface-visibility:hidden] dark:bg-green-100 dark:text-gray-900">
              <p className="text-xl font-semibold text-amber-400">{card.back_text}</p>
              <p className="mt-2 text-gray-400 italic">“{card.example}”</p>
              <p className="mt-3 text-sm text-gray-500">(Nhấn để quay lại)</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-6">
          <button
            onClick={prevCard}
            className="bg-amber-400 px-6 py-2 font-semibold text-black transition-all hover:scale-110"
          >
            Quay lại
          </button>
          <button
            onClick={nextCard}
            className="bg-stone-700 px-6 py-2 font-semibold text-white transition-all hover:scale-110"
          >
            Tiếp theo
          </button>
        </div>

        <p className="mt-4 text-sm text-gray-400">
          Thẻ {index + 1} / {flashcards.length}
        </p>
      </main>
      <Footer />
    </div>
  );
}
