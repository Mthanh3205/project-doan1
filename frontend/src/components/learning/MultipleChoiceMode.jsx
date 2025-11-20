import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, HelpCircle, ChevronRight } from 'lucide-react';
import axios from 'axios';

/**
 * Hàm hỗ trợ: Lấy N phần tử ngẫu nhiên
 */
function getRandomElements(arr, n) {
  let result = new Array(arr.length);
  let len = arr.length;
  for (let i = 0; i < len; i++) {
    result[i] = arr[i];
  }
  if (n > len) n = len;
  let end = len - 1;
  while (n-- > 0) {
    let x = Math.floor(Math.random() * (end + 1));
    [result[x], result[end]] = [result[end], result[x]];
    end--;
  }
  return result.slice(end + 1);
}

export default function MultipleChoiceMode({ card, flashcards, index, nextCard, userId }) {
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [direction, setDirection] = useState('vi-en');

  const questionText = direction === 'vi-en' ? card.front_text : card.back_text;
  const correctAnswer = direction === 'vi-en' ? card.back_text : card.front_text;

  useEffect(() => {
    setSelectedAnswer(null);
    setIsChecked(false);
    const distractorPool = flashcards
      .filter((f) => f.card_id !== card.card_id)
      .map((f) => (direction === 'vi-en' ? f.back_text : f.front_text));
    const incorrectAnswers = getRandomElements(distractorPool, 3);
    const allOptions = [...incorrectAnswers, correctAnswer];
    allOptions.sort(() => 0.5 - Math.random());
    setOptions(allOptions);
  }, [card, flashcards, index, direction, correctAnswer]);

  const handleSelectAnswer = async (option) => {
    if (isChecked) return;
    setIsChecked(true);
    setSelectedAnswer(option);
    if (option === correctAnswer) {
      try {
        await axios.post('https://project-doan1-backend.onrender.com/api/progress/mark', {
          userId: userId,
          cardId: card.card_id,
          deckId: card.deck_id,
          mode: 'quiz',
        });
      } catch (err) {
        console.error('Lỗi lưu progress:', err);
      }
    }
  };

  const handleNext = () => {
    nextCard();
  };

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter' && isChecked) {
        event.preventDefault();
        handleNext();
      }
    },
    [isChecked, handleNext]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const getButtonClass = (option) => {
    // Base style
    let base =
      'relative flex items-center justify-center p-6 text-lg font-semibold transition-all duration-200 ';

    if (!isChecked) {
      return (
        base +
        ' bg-white/5 hover:bg-white/10 hover:-translate-y-1 text-gray-200 cursor-pointer dark:bg-white/50 dark:text-gray-800 '
      );
    }

    const isCorrect = option === correctAnswer;
    const isSelected = option === selectedAnswer;

    if (isCorrect) {
      return (
        base +
        ' bg-green-500/20 text-green-400 scale-105 z-10 dark:bg-green-100 dark:text-green-800'
      );
    }
    if (isSelected && !isCorrect) {
      return base + 'bg-red-500/10 text-red-400 opacity-80 dark:bg-red-100 dark:text-red-800';
    }
    return base + ' bg-black/20 text-gray-600 opacity-40 scale-95 blur-[1px]';
  };

  return (
    <div className="relative flex flex-col items-center justify-center bg-white/5 p-8 backdrop-blur-xl lg:col-span-2 dark:bg-white/40">
      {/* Header */}
      <div className="mb-8 flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
        <h2 className="flex items-center gap-3 text-2xl font-bold text-amber-500 dark:text-green-700">
          <HelpCircle className="h-8 w-8" />
          <span>Quiz Mode</span>
        </h2>
        <div className="flex items-center bg-black/20 p-1 backdrop-blur-sm dark:bg-white/50">
          <button
            onClick={() => setDirection('vi-en')}
            className={`px-4 py-1 text-sm font-medium transition-all ${direction === 'vi-en' ? 'bg-amber-500 text-white' : 'text-gray-400'}`}
          >
            Việt &rarr; Anh
          </button>
          <button
            onClick={() => setDirection('en-vi')}
            className={`px-4 py-1 text-sm font-medium transition-all ${direction === 'en-vi' ? 'bg-amber-500 text-white' : 'text-gray-400'}`}
          >
            Anh &rarr; Việt
          </button>
        </div>
      </div>

      {/* Question */}
      <div className="mb-8 w-full max-w-2xl text-center">
        <h3 className="text-4xl font-black text-white dark:text-gray-900">{questionText}</h3>
        <p className="mt-2 text-sm text-gray-400 dark:text-gray-600">Chọn đáp án đúng bên dưới</p>
      </div>

      {/* Options Grid */}
      <div className="grid w-full max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
        {options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectAnswer(option)}
            disabled={isChecked}
            className={getButtonClass(option)}
          >
            {option}
            {/* Status Icon */}
            {isChecked && option === correctAnswer && (
              <Check className="absolute right-4 text-green-500" />
            )}
            {isChecked && option === selectedAnswer && option !== correctAnswer && (
              <X className="absolute right-4 text-red-500" />
            )}
          </button>
        ))}
      </div>

      {/* Footer Feedback */}
      <div
        className={`mt-8 flex w-full max-w-2xl flex-col items-center transition-all duration-500 ${isChecked ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
      >
        <button
          onClick={handleNext}
          className="w-50 rounded-full border bg-[#121212] py-4 font-bold text-white transition-all hover:scale-[1.02] dark:from-green-500 dark:to-teal-600"
        >
          Tiếp theo
        </button>
      </div>
    </div>
  );
}
