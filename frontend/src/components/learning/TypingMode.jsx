import React, { useState, useCallback, useEffect } from 'react';
import { Check, X, ArrowRight, Keyboard, ArrowRightLeft } from 'lucide-react';

function TypingMode({ card, index, nextCard }) {
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

  // Xác định câu hỏi và câu trả lời dựa trên chiều dịch
  const questionText = typingDirection === 'vi-en' ? card.front_text : card.back_text;
  const correctAnswer = typingDirection === 'vi-en' ? card.back_text : card.front_text;

  // HÀM KIỂM TRA ĐÁP ÁN
  const checkAnswer = () => {
    if (!userInput) {
      setMessage('Vui lòng nhập câu trả lời.');
      return;
    }

    const normalizedInput = normalize(userInput);
    const normalizedCorrect = normalize(correctAnswer);

    setIsChecked(true);
    if (normalizedInput === normalizedCorrect) {
      setIsCorrect(true);
      setMessage('Chính xác! Ghi nhớ tốt.');
    } else {
      setIsCorrect(false);
      setMessage('Chưa chính xác. Thử lại hoặc xem đáp án.');
    }
  };

  // HÀM CHUYỂN THẺ
  const handleNext = () => {
    nextCard();
  };

  //XỬ LÝ PHÍM TẮT
  const handleKeyDown = useCallback(
    (event) => {
      // Bỏ qua nếu đang gõ trong input/textarea
      if (event.target.tagName === 'TEXTAREA' || event.target.tagName === 'INPUT') {
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

  // Gắn listener cho phím Enter
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col items-center justify-center lg:col-span-2">
      <h2 className="mb-4 text-3xl font-extrabold text-amber-600 dark:text-green-700">
        Chế độ Điền từ <Keyboard className="ml-2 inline" size={28} />
      </h2>

      {/* Nút chuyển chiều dịch*/}
      <div className="mb-6 flex rounded-full bg-stone-200 p-1 dark:bg-gray-700">
        <button
          onClick={() => setTypingDirection('vi-en')}
          className={`rounded-full px-4 py-1 text-sm font-semibold transition-colors ${
            typingDirection === 'vi-en'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-gray-600 hover:bg-stone-300 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Việt &rarr; Anh
        </button>
        <button
          onClick={() => setTypingDirection('en-vi')}
          className={`rounded-full px-4 py-1 text-sm font-semibold transition-colors ${
            typingDirection === 'en-vi'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-gray-600 hover:bg-stone-300 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Anh &rarr; Việt
        </button>
      </div>

      {/*Cập nhật để hiển thị câu hỏi động*/}
      <div className="w-full max-w-lg rounded-xl bg-amber-50 p-8 text-center shadow-lg dark:bg-gray-100">
        <p className="mb-2 text-gray-500">
          {typingDirection === 'vi-en' ? 'Dịch sang Tiếng Anh:' : 'Dịch sang Tiếng Việt:'}
        </p>
        <h3 className="text-4xl font-black text-gray-900">{questionText}</h3>
      </div>

      <div className="mt-8 w-full max-w-lg">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Nhập đáp án tại đây..."
          disabled={isChecked && isCorrect}
          className={`w-full rounded-xl border-4 p-4 text-xl transition-colors focus:outline-none dark:bg-white dark:text-gray-900 ${
            isChecked
              ? isCorrect
                ? 'border-green-500 bg-green-50'
                : 'border-red-500 bg-red-50'
              : 'border-stone-300 focus:border-amber-400 dark:border-gray-300'
          }`}
        />
      </div>

      <div className="mt-6 flex w-full max-w-lg justify-between gap-4">
        {!isChecked && (
          <button
            onClick={checkAnswer}
            className="flex-1 rounded-full bg-indigo-600 py-3 text-lg font-semibold text-white shadow-md transition-all hover:bg-indigo-700"
          >
            Kiểm tra (Enter)
          </button>
        )}

        {isChecked && (
          <>
            {!isCorrect && (
              <button
                onClick={() => setShowAnswer(true)}
                className="w-1/3 rounded-full bg-stone-500 py-3 text-lg font-semibold text-white shadow-md transition-all hover:bg-stone-600"
              >
                Xem đáp án
              </button>
            )}
            <button
              onClick={handleNext}
              className={`rounded-full py-3 text-lg font-semibold text-white shadow-lg transition-all ${
                isCorrect
                  ? 'flex-1 bg-green-600 hover:bg-green-700'
                  : 'w-2/3 bg-amber-600 hover:bg-amber-700'
              }`}
            >
              Tiếp theo <ArrowRight className="ml-1 inline" size={20} />
            </button>
          </>
        )}
      </div>

      <div className="mt-6 min-h-[50px] w-full max-w-lg text-center">
        {message && (
          <p className={`text-xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {message}{' '}
            {isCorrect ? (
              <Check className="inline" size={24} />
            ) : (
              <X className="inline" size={24} />
            )}
          </p>
        )}
        {showAnswer && !isCorrect && (
          <p className="mt-2 text-xl font-medium text-stone-700 dark:text-stone-700">
            Đáp án đúng: <span className="font-bold underline">{correctAnswer}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default TypingMode;
