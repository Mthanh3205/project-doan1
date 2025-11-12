import { useState } from 'react';

export default function FlashcardPreview({ word, meaning }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="perspective h-32 w-48 cursor-pointer" onClick={() => setFlipped(!flipped)}>
      <div
        className={`transform-style-preserve-3d relative h-full w-full transition-transform duration-1000 ${
          flipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Mặt trước */}
        <div className="absolute inset-0 flex h-50 items-center justify-center bg-[#1d1d1d] text-xl font-semibold text-white shadow-lg backface-hidden dark:bg-green-100 dark:text-amber-500">
          {word}
        </div>

        {/* Mặt sau */}
        <div className="absolute inset-0 flex h-50 rotate-y-180 items-center justify-center bg-[#1d1d1d] text-xl font-semibold text-white shadow-lg backface-hidden dark:bg-green-100 dark:text-amber-500">
          {meaning}
        </div>
      </div>
    </div>
  );
}
