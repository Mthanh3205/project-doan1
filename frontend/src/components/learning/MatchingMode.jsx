import React, { useState, useEffect, useCallback } from 'react';
import { Puzzle, Check, X, RefreshCw, ChevronsRight } from 'lucide-react';
import axios from 'axios';

// --- Hàm hỗ trợ lấy ngẫu nhiên ---
function getRandomElements(arr, n) {
  let result = new Array(arr.length);
  let len = arr.length;
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

// --- Hàm hỗ trợ xáo trộn mảng ---
function shuffleArray(array) {
  let newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

const MIN_LEVEL = 1; // Bắt đầu từ 1 cặp

export default function MatchingMode({ flashcards, userId }) {
  const [currentLevel, setCurrentLevel] = useState(MIN_LEVEL);

  const [words, setWords] = useState([]);
  const [definitions, setDefinitions] = useState([]);

  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedDef, setSelectedDef] = useState(null);

  const [matchedPairIds, setMatchedPairIds] = useState([]);
  const [isMismatch, setIsMismatch] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [isMasterWin, setIsMasterWin] = useState(false);

  // Hàm khởi tạo game
  const initGame = useCallback(() => {
    setGameWon(false);
    setIsMasterWin(false);
    setSelectedWord(null);
    setSelectedDef(null);
    setMatchedPairIds([]);
    setIsMismatch(false);

    const randomCards = getRandomElements(flashcards, currentLevel);
    const wordList = [];
    const defList = [];

    randomCards.forEach((card, index) => {
      wordList.push({
        pairId: card.card_id,
        text: card.front_text,
        index: index,
        deck_id: card.deck_id,
      });
      defList.push({
        pairId: card.card_id,
        text: card.back_text,
        index: index,
        deck_id: card.deck_id,
      });
    });

    setWords(wordList);
    setDefinitions(shuffleArray(defList));
  }, [flashcards, currentLevel]);

  // Chạy khi `flashcards` được tải, hoặc khi `currentLevel` thay đổi
  useEffect(() => {
    if (flashcards && flashcards.length > 0) {
      initGame();
    }
  }, [flashcards, initGame]);

  // Xử lý logic chọn
  useEffect(() => {
    const checkMatch = async () => {
      // Thêm 'async'
      if (selectedWord && selectedDef) {
        setIsMismatch(false);
        // NẾU ĐÚNG
        if (selectedWord.pairId === selectedDef.pairId) {
          setMatchedPairIds((prev) => [...prev, selectedWord.pairId]);

          // --- GỌI API LƯU TIẾN TRÌNH ---
          try {
            await axios.post('https://project-doan1-backend.onrender.com/api/progress/mark', {
              userId: userId,
              cardId: selectedWord.pairId, // card_id
              deckId: selectedWord.deck_id, // deck_id đã lưu
              mode: 'matching',
            });
          } catch (err) {
            console.error('Lỗi khi lưu tiến trình matching:', err);
          }
          // --- KẾT THÚC API ---

          setSelectedWord(null);
          setSelectedDef(null);
        }
        // NẾU SAI
        else {
          setIsMismatch(true);
          setTimeout(() => {
            setSelectedWord(null);
            setSelectedDef(null);
            setIsMismatch(false);
          }, 800);
        }
      }
    };
    checkMatch(); // Gọi hàm async
  }, [selectedWord, selectedDef, userId]);

  // Xử lý khi thắng
  useEffect(() => {
    if (matchedPairIds.length > 0 && matchedPairIds.length === currentLevel) {
      setGameWon(true);
      if (currentLevel === flashcards.length) {
        setIsMasterWin(true);
      }
    }
  }, [matchedPairIds, currentLevel, flashcards.length]);

  // Xử lý click
  const handleWordClick = (word) => {
    if (isMismatch || selectedWord || gameWon) return;
    setSelectedWord({ index: word.index, pairId: word.pairId, deck_id: word.deck_id });
  };

  const handleDefClick = (def) => {
    if (isMismatch || selectedDef || gameWon) return;
    setSelectedDef({ index: def.index, pairId: def.pairId, deck_id: def.deck_id });
  };

  // Hàm qua màn hoặc chơi lại
  const handleNextLevel = () => {
    if (isMasterWin) {
      setCurrentLevel(MIN_LEVEL);
    } else {
      setCurrentLevel((prev) => prev + 1);
    }
  };

  // Hàm lấy class CSS
  const getCardClass = (card, type) => {
    const isSelected =
      (type === 'word' && selectedWord?.index === card.index) ||
      (type === 'def' && selectedDef?.index === card.index);
    const isMatched = matchedPairIds.includes(card.pairId);

    if (isMatched) {
      return 'bg-green-700/30 text-green-400 opacity-50 cursor-not-allowed border-green-700';
    }
    if (isSelected && isMismatch) {
      return 'bg-red-500 text-white scale-105 shadow-lg animate-pulse';
    }
    if (isSelected) {
      return 'bg-amber-500 text-white scale-105 shadow-lg dark:bg-green-600';
    }
    return 'bg-[#1d1d1d] text-white hover:bg-gray-700 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-300';
  };

  // Xử lý trường hợp không có thẻ nào
  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center lg:col-span-2">
        <h2 className="mb-4 text-3xl font-extrabold text-amber-600 dark:text-green-700">
          Chế độ Ghép Nối <Puzzle className="ml-2 inline" size={28} />
        </h2>
        <p className="text-center text-gray-400">Chủ đề này không có từ vựng nào để chơi.</p>
      </div>
    );
  }

  // Giao diện chính
  return (
    <div className="flex w-full flex-col items-center justify-center lg:col-span-2">
      <h2 className="mb-4 text-3xl font-extrabold text-amber-600 dark:text-green-700">
        Chế độ Ghép Nối <Puzzle className="ml-2 inline" size={28} />
      </h2>

      <p className="-mt-2 mb-6 text-xl font-bold text-gray-400 dark:text-gray-500">
        Màn {currentLevel} / {flashcards.length}
      </p>

      <div className="grid w-full max-w-2xl grid-cols-2 gap-4">
        {/* CỘT 1: TỪ VỰNG */}
        <div className="flex flex-col gap-3">
          {words.map((word) => (
            <button
              key={`word-${word.index}`}
              onClick={() => handleWordClick(word)}
              disabled={isMismatch || matchedPairIds.includes(word.pairId) || gameWon}
              className={`flex h-20 items-center justify-center rounded-xl border border-transparent p-3 text-center font-semibold shadow-md transition-all duration-300 ${getCardClass(
                word,
                'word'
              )}`}
            >
              {word.text}
            </button>
          ))}
        </div>

        {/* CỘT 2: NGHĨA */}
        <div className="flex flex-col gap-3">
          {definitions.map((def) => (
            <button
              key={`def-${def.index}`}
              onClick={() => handleDefClick(def)}
              disabled={isMismatch || matchedPairIds.includes(def.pairId) || gameWon}
              className={`flex h-20 items-center justify-center rounded-xl border border-transparent p-3 text-center font-semibold shadow-md transition-all duration-300 ${getCardClass(
                def,
                'def'
              )}`}
            >
              {def.text}
            </button>
          ))}
        </div>
      </div>

      {/* Vùng thông báo và nút bấm */}
      <div className="mt-8 min-h-[50px] w-full max-w-lg text-center">
        {gameWon && (
          <div className="animate-fade-in">
            {isMasterWin ? (
              <p className="text-2xl font-bold text-green-500">
                <Check className="inline" size={28} /> Chúc mừng! Bạn đã hoàn tất chủ đề!
              </p>
            ) : (
              <p className="text-2xl font-bold text-green-500">
                <Check className="inline" size={28} /> Hoàn thành màn {currentLevel}!
              </p>
            )}

            <button
              onClick={handleNextLevel}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border py-3 text-lg font-semibold text-zinc-100 transition-all duration-300 hover:scale-105 hover:bg-amber-500 dark:bg-gray-900 dark:text-white dark:hover:bg-white dark:hover:text-black"
            >
              {isMasterWin ? (
                <>
                  <RefreshCw size={20} />
                  Chơi lại từ đầu
                </>
              ) : (
                <>
                  Màn tiếp theo
                  <ChevronsRight size={20} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
