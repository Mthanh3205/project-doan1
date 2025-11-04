import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import FlashcardPreview from '@/components/FlashcardPreview';

const Test = () => {
  return (
    <div>
      {/* Preview flashcards */}
      <section className="dark:white px-6 py-16 text-center">
        <h2 className="mb-10 text-3xl font-bold text-amber-600">Xem thử Flashcards</h2>
        <div className="flex flex-wrap justify-center gap-6">
          <FlashcardPreview word="Apple" meaning="Quả táo" />
          <FlashcardPreview word="Beautiful" meaning="Xinh đẹp" />
          <FlashcardPreview word="Journey" meaning="Hành trình" />
        </div>
      </section>
    </div>
  );
};

export default Test;
