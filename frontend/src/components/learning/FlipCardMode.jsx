import React from 'react';
import { Star } from 'lucide-react';

export default function FlipCardMode({
  card,
  nextCard,
  prevCard,
  flipCard,
  flipped,
  toggleFavorite,
  favorites,
}) {
  return (
    <div className="overflow-hidden bg-[#1d1d1d] shadow-lg lg:col-span-2 dark:bg-white">
      <section className="relative px-8 py-16 text-center">
        {/* NÚT YÊU THÍCH */}
        <button
          onClick={() => toggleFavorite(card.card_id)}
          className="absolute top-6 right-6 z-20 p-2 transition-all hover:scale-110"
        >
          <Star
            className={`h-7 w-7 ${
              favorites.includes(card.card_id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
            }`}
          />
        </button>

        <h2 className="mb-8 text-3xl font-extrabold text-amber-600 dark:text-green-700">
          Chế độ Lật Thẻ
        </h2>

        {/* THẺ LẬT */}
        <div
          className="relative mx-auto h-72 w-80 cursor-pointer [perspective:1000px]"
          onClick={flipCard} // Lật thẻ khi click
        >
          <div
            className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${
              flipped ? '[transform:rotateY(180deg)]' : '' // Class chính tạo hiệu ứng lật
            }`}
          >
            {/* MẶT TRƯỚC */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#121212] bg-gradient-to-br p-6 text-center text-white shadow-lg [backface-visibility:hidden] dark:border-none dark:bg-white dark:from-amber-100 dark:via-white dark:to-gray-100 dark:text-gray-900">
              <p className="mb-3 text-2xl font-bold text-amber-400 dark:text-green-700">
                {card.front_text || 'Không có dữ liệu'}
              </p>
              {card.pronunciation && (
                <p className="mb-2 text-gray-400 dark:text-gray-600">{card.pronunciation}</p>
              )}
              <p className="text-sm text-gray-500">(Nhấn phím Cách hoặc click để xem nghĩa)</p>
            </div>

            {/* MẶT SAU */}
            <div className="absolute inset-0 flex [transform:rotateY(180deg)] flex-col items-center justify-center bg-[#121212] bg-gradient-to-br p-6 text-center text-white shadow-lg [backface-visibility:hidden] dark:border-none dark:bg-white dark:from-amber-100 dark:via-white dark:to-gray-100 dark:text-gray-900">
              <p className="mb-2 text-xl font-bold text-amber-400 dark:text-green-700">
                {card.back_text || 'Chưa có nghĩa'}
              </p>
              {card.example && (
                <p className="mt-2 text-sm text-gray-600 italic">“{card.example}”</p>
              )}
              {card.image_url && (
                <img src={card.image_url} alt="flashcard" className="mt-3 w-full object-cover" />
              )}
              <p className="mt-3 text-xs text-gray-400">(Nhấn phím Cách hoặc click để quay lại)</p>
            </div>
          </div>
        </div>
        {/* KẾT THÚC THẺ LẬT */}

        {/* NÚT ĐIỀU HƯỚNG */}
        <div className="mt-10 flex justify-center gap-6">
          <button
            onClick={prevCard}
            className="bg-amber-400 px-6 py-2 font-semibold text-stone-600 transition-all hover:scale-110 dark:bg-green-200"
          >
            &larr; Quay lại
          </button>
          <button
            onClick={nextCard}
            className="bg-stone-700 px-6 py-2 font-semibold text-white transition-all hover:scale-110"
          >
            Tiếp theo &rarr;
          </button>
        </div>
      </section>
    </div>
  );
}
