import React from 'react';
import { Star, ArrowLeft, ArrowRight, Book, RotateCw } from 'lucide-react';

export default function FlipCardMode({
  card,
  nextCard,
  prevCard,
  flipCard,
  flipped,
  toggleFavorite,
  favorites,
  isChanging,
}) {
  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden bg-[#1d1d1d] p-8 backdrop-blur-xl lg:col-span-2 dark:bg-white/40">
      {/* Decoration Background */}
      <div className="absolute h-32 w-32 bg-[#121212]"></div>
      <div className="absolute h-32 w-32 bg-[#1d1d1d]"></div>

      <div className="relative w-full text-center">
        {/* Header Section */}
        <div className="mb-10 flex items-center justify-between px-4">
          <h2 className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-2xl font-extrabold tracking-wide text-transparent dark:from-green-600 dark:to-teal-600">
            <Book className="h-8 w-8" />
            <span>FLIP CARD</span>
          </h2>
          <button
            onClick={() => toggleFavorite(card.card_id)}
            className="group relative p-3 transition-all hover:scale-110 hover:bg-amber-500/20"
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                favorites.includes(card.card_id)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-400 group-hover:text-amber-400'
              }`}
            />
          </button>
        </div>

        {/* CARD CONTAINER */}
        <div
          className="group mx-auto h-80 w-full max-w-md cursor-pointer [perspective:1000px]"
          onClick={flipCard}
        >
          <div
            className={`relative h-full w-full [transform-style:preserve-3d] ${
              flipped ? '[transform:rotateY(180deg)]' : ''
            } ${isChanging ? 'duration-0' : 'duration-700'}`}
          >
            {/* --- FRONT FACE --- */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#121212] p-8 shadow-xl [backface-visibility:hidden] dark:from-white dark:to-stone-100">
              <span className="mb-4 bg-white/5 px-3 py-1 text-xs font-medium tracking-widest text-gray-500 uppercase dark:bg-black/5">
                Term
              </span>
              <p className="text-4xl font-black text-white dark:text-gray-800">
                {card.front_text || '...'}
              </p>
              {card.pronunciation && (
                <p className="mt-4 text-xl text-amber-400/80 italic dark:text-green-600">
                  /{card.pronunciation}/
                </p>
              )}
              <div className="absolute bottom-6 flex animate-pulse items-center gap-2 text-xs text-gray-500">
                <RotateCw size={14} /> Click để lật
              </div>
            </div>

            {/* --- BACK FACE --- */}
            <div className="absolute inset-0 flex [transform:rotateY(180deg)] flex-col items-center justify-center bg-[#121212] p-8 shadow-xl [backface-visibility:hidden] dark:from-stone-50 dark:to-white">
              <span className="mb-4 bg-amber-500/10 px-3 py-1 text-xs font-medium tracking-widest text-amber-500 uppercase dark:bg-green-100 dark:text-green-700">
                Definition
              </span>
              <p className="text-4xl font-bold text-white dark:text-green-700">
                {card.back_text || '...'}
              </p>
              {card.example && (
                <div className="mt-6 bg-white/5 p-3 text-gray-300 italic dark:bg-black/5 dark:text-gray-600">
                  "{card.example}"
                </div>
              )}
              {card.image_url && (
                <img src={card.image_url} alt="visual" className="mt-4 h-24 w-24 object-cover" />
              )}
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="mt-12 flex items-center justify-center gap-6">
          <button
            onClick={prevCard}
            className="group flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 font-semibold text-white transition-all hover:-translate-x-1 hover:bg-white/20 active:scale-95 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-gray-300"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Trước</span>
          </button>

          <button
            onClick={nextCard}
            className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 font-bold text-white transition-all hover:translate-x-1 active:scale-95 dark:from-green-500 dark:to-teal-600"
          >
            <span className="hidden sm:inline">Tiếp theo</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
