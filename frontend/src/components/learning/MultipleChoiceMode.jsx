import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, ArrowRight, HelpCircle, ArrowRightLeft } from 'lucide-react';
import axios from 'axios';

/**
 * Hàm hỗ trợ: Lấy N phần tử ngẫu nhiên từ một mảng
 * (Sử dụng thuật toán Fisher-Yates shuffle)
 */
function getRandomElements(arr, n) {
  let result = new Array(arr.length);
  let len = arr.length;
  let taken = new Array(len);

  // Sao chép mảng
  for (let i = 0; i < len; i++) {
    result[i] = arr[i];
  }

  if (n > len) {
    n = len;
  }

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

  // HÀM TẠO CÂU HỎI

  useEffect(() => {
    setSelectedAnswer(null);
    setIsChecked(false);

    const distractorPool = flashcards

      .filter((f) => f.card_id !== card.card_id)

      .map((f) => (direction === 'vi-en' ? f.back_text : f.front_text));

    const incorrectAnswers = getRandomElements(distractorPool, 3);

    const allOptions = [...incorrectAnswers, correctAnswer];
    // Xáo trộn đơn giản
    allOptions.sort(() => 0.5 - Math.random());

    setOptions(allOptions);
  }, [card, flashcards, index, direction, correctAnswer]);

  // HÀM XỬ LÝ KHI CHỌN ĐÁP ÁN
  const handleSelectAnswer = async (option) => {
    // Thêm 'async'
    if (isChecked) return;
    setIsChecked(true);
    setSelectedAnswer(option);

    // KIỂM TRA ĐÚNG VÀ GỌI API
    if (option === correctAnswer) {
      try {
        await axios.post('https://project-doan1-backend.onrender.com/api/progress/mark', {
          userId: userId,
          cardId: card.card_id,
          deckId: card.deck_id, // Đảm bảo API trả về 'deck_id' trong object 'card'
          mode: 'quiz',
        });
      } catch (err) {
        console.error('Lỗi khi lưu tiến trình quiz:', err);
      }
    }
    // --- KẾT THÚC GỌI API ---
  };

  // HÀM XỬ LÝ CHUYỂN THẺ
  const handleNext = () => {
    nextCard();
    // useEffect ở trên sẽ tự động chạy lại để tạo câu hỏi mới
  };

  // HÀM XỬ LÝ PHÍM TẮT (Enter để qua thẻ tiếp)
  const handleKeyDown = useCallback(
    (event) => {
      if (event.target.tagName === 'TEXTAREA' || event.target.tagName === 'INPUT') {
        return;
      }
      // Chỉ cho phép "Enter" khi đã trả lời
      if (event.key === 'Enter' && isChecked) {
        event.preventDefault();
        handleNext();
      }
    },
    [isChecked, handleNext] // handleNext đã được bọc trong useCallback của component cha
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // LOGIC TÔ MÀU CHO CÁC NÚT LỰA CHỌN
  const getButtonClass = (option) => {
    // Nếu chưa trả lời
    if (!isChecked) {
      return 'bg-white dark:bg-gray-100 border-stone-300 dark:border-gray-300 hover:bg-amber-50 dark:hover:bg-amber-50';
    }

    // Nếu đã trả lời
    const isCorrect = option === correctAnswer;
    const isSelected = option === selectedAnswer;

    if (isCorrect) {
      // Luôn tô xanh lá cho đáp án đúng
      return 'bg-white dark:bg-gray-900 dark:text-zinc-200 border-green-500 text-stone-800 shadow-md';
    }
    if (isSelected && !isCorrect) {
      // Tô đỏ cho đáp án sai mà người dùng đã chọn
      return 'bg-red-100 border-red-500 text-red-800 line-through opacity-70';
    }
    // Tô xám mờ cho các đáp án sai khác
    return 'bg-stone-100 border-stone-300 text-stone-500 opacity-60';
  };

  return (
    <div className="flex flex-col items-center justify-center lg:col-span-2">
      <h2 className="mb-4 text-3xl font-extrabold text-amber-600 dark:text-green-700">
        Chế độ Chọn Từ <HelpCircle className="ml-2 inline" size={28} />
      </h2>

      {/* Nút chuyển chiều dịch */}
      <div className="mb-6 flex bg-stone-200 p-1">
        <button
          onClick={() => setDirection('vi-en')}
          className={`px-4 py-1 text-sm font-semibold transition-colors ${
            direction === 'vi-en'
              ? 'bg-[#1d1d1d] text-white shadow'
              : 'text-gray-600 hover:bg-stone-300 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Việt &rarr; Anh
        </button>
        <button
          onClick={() => setDirection('en-vi')}
          className={`px-4 py-1 text-sm font-semibold transition-colors ${
            direction === 'en-vi'
              ? 'bg-[#1d1d1d] text-white shadow'
              : 'text-gray-600 hover:bg-stone-300 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Anh &rarr; Việt
        </button>
      </div>

      {/* HỘP CÂU HỎI */}
      <div className="w-full max-w-lg bg-[#1d1d1d] p-8 text-center shadow-lg dark:bg-green-100">
        <p className="mb-2 text-gray-300 dark:text-stone-700">
          {direction === 'vi-en' ? 'Nghĩa của từ này là gì?' : 'Từ nào có nghĩa là:'}
        </p>
        <h3 className="text-4xl font-black text-white dark:text-gray-900">{questionText}</h3>
      </div>

      {/* LƯỚI CÁC LỰA CHỌN */}
      <div className="mt-8 grid w-full max-w-lg grid-cols-1 gap-4 md:grid-cols-2">
        {options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectAnswer(option)}
            disabled={isChecked}
            className={`bg-[#1d1d1d] p-5 text-center text-xl font-semibold shadow-md transition-all dark:bg-gray-100 ${getButtonClass(
              option
            )}`}
          >
            {option || '(Trống)'}
          </button>
        ))}
      </div>

      {/* VÙNG PHẢN HỒI VÀ NÚT TIẾP THEO */}
      <div className="mt-6 min-h-[50px] w-full max-w-lg text-center">
        {isChecked && (
          <>
            {/* Thông báo Đúng/Sai */}
            {selectedAnswer === correctAnswer ? (
              <p className="text-xl font-bold text-green-600">
                <Check className="inline" size={24} /> Chính xác!
              </p>
            ) : (
              <p className="text-xl font-bold text-red-600">
                <X className="inline" size={24} /> Chưa đúng.
              </p>
            )}

            {/* Nút "Tiếp theo" */}
            <button
              onClick={handleNext}
              className="mt-4 w-full border py-3 text-lg font-semibold text-zinc-100 transition-all duration-300 hover:scale-105 hover:bg-amber-500 dark:bg-gray-900 dark:text-white dark:hover:bg-white dark:hover:text-black"
            >
              Tiếp theo
            </button>
          </>
        )}
      </div>
    </div>
  );
}
