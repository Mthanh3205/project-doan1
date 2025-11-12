import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function StudyFavoriteFlashcard() {
  const { deckId } = useParams();
  const userId = 1;
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    axios
      .get(`https://project-doan1-backend.onrender.com/api/favorites/deck/${deckId}?user=${userId}`)
      .then((res) => setCards(res.data));
  }, [deckId]);

  if (!cards.length)
    return <p className="mt-20 text-center">Không có từ yêu thích trong chủ đề này.</p>;

  const card = cards[index];
  return (
    <div className="min-h-screen bg-[#121212] text-white dark:bg-white dark:text-black">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-16">
        <h1 className="mb-12 text-center text-4xl font-bold text-amber-500 dark:text-green-700">
          🌟 Học các từ yêu thích – Chủ đề {deckId}
        </h1>

        <div className="flex flex-col items-center">
          <div
            className="relative h-72 w-80 cursor-pointer [perspective:1000px]"
            onClick={() => setFlipped(!flipped)}
          >
            <div
              className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${
                flipped ? '[transform:rotateY(180deg)]' : ''
              }`}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1d1d1d] p-6 text-center [backface-visibility:hidden] dark:bg-white">
                <p className="mb-3 text-2xl font-bold text-amber-400 dark:text-green-700">
                  {card.front_text}
                </p>
                <p className="text-sm text-gray-400">(Nhấn để xem nghĩa)</p>
              </div>
              <div className="absolute inset-0 flex [transform:rotateY(180deg)] flex-col items-center justify-center bg-[#1d1d1d] p-6 text-center [backface-visibility:hidden] dark:bg-white">
                <p className="text-xl font-bold text-amber-400 dark:text-green-700">
                  {card.back_text}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex gap-6">
            <button
              onClick={() => {
                setFlipped(false);
                setIndex((prev) => (prev - 1 + cards.length) % cards.length);
              }}
              className="bg-amber-400 px-6 py-2 font-semibold text-stone-600 hover:scale-110 dark:bg-green-200"
            >
              Quay lại
            </button>
            <button
              onClick={() => {
                setFlipped(false);
                setIndex((prev) => (prev + 1) % cards.length);
              }}
              className="bg-stone-700 px-6 py-2 font-semibold text-white hover:scale-110"
            >
              Tiếp theo
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
