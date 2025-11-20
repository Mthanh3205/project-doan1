import React, { useState, useCallback, useEffect } from 'react';
import { Check, X, Keyboard, ArrowRightLeft, RefreshCw } from 'lucide-react';
import axios from 'axios';

function TypingMode({ card, index, nextCard, userId }) {
  // Translate
  const [typingDirection, setTypingDirection] = useState('vi-en');

  const [userInput, setUserInput] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setUserInput('');
    setIsChecked(false);
    setIsCorrect(false);
    setShowAnswer(false);
    setMessage('');
  }, [index, card, typingDirection]);

  // Hàm chuẩn hóa chuỗi
  const normalize = (text) => (text || '').toLowerCase().trim();

  // Xác định câu hỏi và câu trả lời
  const questionText = typingDirection === 'vi-en' ? card.front_text : card.back_text;
  const correctAnswer = typingDirection === 'vi-en' ? card.back_text : card.front_text;

  // HÀM KIỂM TRA ĐÁP ÁN
  const checkAnswer = useCallback(async () => {
    if (!userInput) {
      setMessage('Vui lòng nhập câu trả lời.');
      return;
    }

    const normalizedInput = normalize(userInput);
    const normalizedCorrect = normalize(correctAnswer);

    setIsChecked(true);
    if (normalizedInput === normalizedCorrect) {
      setIsCorrect(true);
      setMessage('Chính xác!');

      // Gọi API
      try {
        await axios.post('https://project-doan1-backend.onrender.com/api/progress/mark', {
          userId: userId,
          cardId: card.card_id,
          deckId: card.deck_id,
          mode: 'typing',
        });
      } catch (err) {
        console.error('Lỗi khi lưu tiến trình typing:', err);
      }
    } else {
      setIsCorrect(false);
      setMessage('Chưa chính xác.');
    }
  }, [userInput, correctAnswer, userId, card]);

  // HÀM CHUYỂN THẺ
  const handleNext = () => {
    nextCard();
  };

  // XỬ LÝ PHÍM TẮT
  const handleKeyDown = useCallback(
    (event) => {
      if (
        event.target.tagName === 'TEXTAREA' ||
        (event.target.tagName === 'INPUT' && event.target !== document.activeElement)
      ) {
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        if (!isChecked) {
          checkAnswer();
        } else {
          handleNext();
        }
      }
    },
    [isChecked, checkAnswer, handleNext]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="relative flex flex-col items-center justify-center bg-white/5 p-8 backdrop-blur-xl lg:col-span-2 dark:bg-white/40">
      {/* Header */}
      <div className="mb-8 flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
        <h2 className="flex items-center gap-3 text-2xl font-bold text-amber-500 dark:text-green-700">
          <Keyboard className="h-8 w-8" />
          <span>Typing Mode</span>
        </h2>

        {/* Switch Direction */}
        <div className="flex items-center bg-black/20 p-1 backdrop-blur-sm dark:bg-white/50">
          <button
            onClick={() => setTypingDirection('vi-en')}
            className={`px-4 py-1.5 text-sm font-medium transition-all ${
              typingDirection === 'vi-en'
                ? 'bg-amber-500 text-white '
                : 'text-gray-400 hover:text-white dark:text-gray-600 dark:hover:text-black'
            }`}
          >
            Việt &rarr; Anh
          </button>
          <button
            onClick={() => setTypingDirection('en-vi')}
            className={`px-4 py-1.5 text-sm font-medium transition-all ${
              typingDirection === 'en-vi'
                ? 'bg-amber-500 text-white '
                : 'text-gray-400 hover:text-white dark:text-gray-600 dark:hover:text-black'
            }`}
          >
            Anh &rarr; Việt
          </button>
        </div>
      </div>

      {/* Question Card */}
      <div className="w-full max-w-xl bg-[#121212] p-10 text-center backdrop-blur-sm dark:from-white/60">
        <p className="mb-4 text-sm font-medium tracking-wider text-gray-400 uppercase dark:text-gray-600">
          {typingDirection === 'vi-en' ? 'Translate to English' : 'Dịch sang Tiếng Việt'}
        </p>
        <h3 className="text-4xl font-black text-white dark:text-gray-900">{questionText}</h3>
      </div>

      {/* Input Area */}
      <div className="mt-8 w-full max-w-xl">
        <div className="relative">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Nhập câu trả lời của bạn..."
            autoFocus
            disabled={isChecked && isCorrect}
            className={`w-full bg-black/20 px-6 py-4 text-xl text-white placeholder-gray-500 backdrop-blur-md transition-all focus:ring-2 focus:outline-none dark:bg-white/50 dark:text-black dark:placeholder-gray-500 ${
              isChecked
                ? isCorrect
                  ? 'border-green-500/50 bg-green-500/10 focus:ring-green-500/20'
                  : 'border-red-500/50 bg-red-500/10 focus:ring-red-500/20'
                : 'border-transparent focus:border-amber-500/50 focus:bg-black/40 focus:ring-amber-500/20 dark:focus:bg-white/80'
            }`}
          />
          {isChecked && (
            <div className="absolute top-1/2 right-4 -translate-y-1/2">
              {isCorrect ? <Check className="text-green-500" /> : <X className="text-red-500" />}
            </div>
          )}
        </div>
      </div>

      {/* Feedback & Actions */}
      <div className="mt-8 min-h-[80px] w-full max-w-xl text-center">
        {message && (
          <div
            className={`mb-4 flex items-center justify-center gap-2 text-lg font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}
          >
            {message}
          </div>
        )}

        {!isChecked ? (
          <button
            onClick={checkAnswer}
            className="w-50 rounded-full border bg-[#121212] py-3.5 font-bold text-white transition-all hover:bg-amber-500 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-green-500 dark:hover:text-white"
          >
            Kiểm tra (Enter)
          </button>
        ) : (
          <div className="flex gap-4">
            {!isCorrect && (
              <button
                onClick={() => setShowAnswer(true)}
                className="flex-1 bg-white/5 py-3.5 font-semibold text-gray-300 hover:bg-white/10 hover:text-white dark:text-gray-600 dark:hover:bg-gray-100"
              >
                Xem đáp án
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 py-3.5 font-bold text-white transition-all hover:-translate-y-0.5 dark:from-green-500 dark:to-teal-600"
            >
              Tiếp theo (Enter)
            </button>
          </div>
        )}

        {/* Show Answer Result */}
        <div
          className={`mt-4 overflow-hidden transition-all duration-500 ${showAnswer && !isCorrect ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <p className="text-stone-400 dark:text-stone-500">Đáp án đúng là:</p>
          <p className="text-xl font-bold text-amber-400 underline decoration-amber-500/50 underline-offset-4 dark:text-green-600">
            {correctAnswer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default TypingMode;
