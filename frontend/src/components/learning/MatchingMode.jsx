import React, { useState, useEffect, useCallback } from 'react';
import { Puzzle, Check, RefreshCw, ChevronsRight, Sparkles } from 'lucide-react';
import axios from 'axios';

// Hàm hỗ trợ lấy ngẫu nhiên
function getRandomElements(arr, n) {
  let result = [...arr];
  if (n > result.length) n = result.length;

  // Fisher-Yates Shuffle
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result.slice(0, n);
}

// Hàm hỗ trợ xáo trộn mảng
function shuffleArray(array) {
  let newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

const MIN_LEVEL = 1;

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

  useEffect(() => {
    if (flashcards && flashcards.length > 0) initGame();
  }, [flashcards, initGame]);

  useEffect(() => {
    const checkMatch = async () => {
      if (selectedWord && selectedDef) {
        setIsMismatch(false);
        if (selectedWord.pairId === selectedDef.pairId) {
          setMatchedPairIds((prev) => [...prev, selectedWord.pairId]);
          try {
            await axios.post('https://project-doan1-backend.onrender.com/api/progress/mark', {
              userId: userId,
              cardId: selectedWord.pairId,
              deckId: selectedWord.deck_id,
              mode: 'matching',
            });
          } catch (err) {
            console.error(err);
          }
          setSelectedWord(null);
          setSelectedDef(null);
        } else {
          setIsMismatch(true);
          setTimeout(() => {
            setSelectedWord(null);
            setSelectedDef(null);
            setIsMismatch(false);
          }, 800);
        }
      }
    };
    checkMatch();
  }, [selectedWord, selectedDef, userId]);

  useEffect(() => {
    if (matchedPairIds.length > 0 && matchedPairIds.length === currentLevel) {
      setGameWon(true);
      if (currentLevel === flashcards.length) setIsMasterWin(true);
    }
  }, [matchedPairIds, currentLevel, flashcards.length]);

  const handleNextLevel = useCallback(() => {
    if (isMasterWin) setCurrentLevel(MIN_LEVEL);
    else setCurrentLevel((prev) => prev + 1);
  }, [isMasterWin]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && gameWon) {
        event.preventDefault();
        handleNextLevel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameWon, handleNextLevel]);

  const handleWordClick = (word) => {
    if (isMismatch || selectedWord || gameWon) return;
    setSelectedWord({ index: word.index, pairId: word.pairId, deck_id: word.deck_id });
  };

  const handleDefClick = (def) => {
    if (isMismatch || selectedDef || gameWon) return;
    setSelectedDef({ index: def.index, pairId: def.pairId, deck_id: def.deck_id });
  };

  const getCardClass = (card, type) => {
    const isSelected =
      (type === 'word' && selectedWord?.index === card.index) ||
      (type === 'def' && selectedDef?.index === card.index);
    const isMatched = matchedPairIds.includes(card.pairId);

    let base =
      'relative flex h-24 items-center justify-center p-4 text-center text-sm font-bold transition-all duration-300 cursor-pointer ';

    if (isMatched) {
      return (
        base +
        ' bg-green-500/10 text-green-500/50 scale-90 grayscale opacity-60 pointer-events-none'
      );
    }
    if (isSelected) {
      if (isMismatch) {
        return base + 'bg-red-500 text-white animate-shake scale-105 z-10';
      }
      return base + ' bg-amber-500 text-white scale-105 z-10 dark:bg-green-600 ';
    }
    return (
      base +
      ' bg-white/5 hover:bg-white/10 hover:-translate-y-1 text-gray-300 hover:text-white dark:bg-white/50 dark:text-gray-800 dark:hover:bg-white'
    );
  };

  if (!flashcards || flashcards.length === 0) {
    return <div className="text-center text-gray-500">Chưa có dữ liệu.</div>;
  }

  return (
    <div className="relative flex w-full flex-col items-center justify-center bg-white/5 p-8 backdrop-blur-xl lg:col-span-2 dark:bg-white/40">
      {/* Decor */}
      <div className="absolute top-1/2 -left-10 h-24 w-24 -translate-y-1/2 bg-purple-500/20 blur-3xl"></div>

      {/* Header */}
      <div className="mb-8 flex w-full items-center justify-between">
        <h2 className="flex items-center gap-3 text-2xl font-bold text-amber-500 dark:text-green-700">
          <Puzzle className="h-8 w-8" />
          <span>Matching</span>
        </h2>
        <div className="bg-black/20 px-4 py-1 font-mono text-sm text-gray-300 dark:bg-white/50 dark:text-gray-800">
          Level: <span className="font-bold text-amber-500">{currentLevel}</span> /{' '}
          {flashcards.length}
        </div>
      </div>

      {/* Grid Area */}
      <div className="grid w-full max-w-3xl grid-cols-2 gap-4 md:gap-6">
        {/*TỪ VỰNG */}
        <div className="flex flex-col gap-3">
          {words.map((word) => (
            <div
              key={`word-${word.index}`}
              onClick={() => handleWordClick(word)}
              className={getCardClass(word, 'word')}
            >
              {word.text}
            </div>
          ))}
        </div>

        {/*NGHĨA */}
        <div className="flex flex-col gap-3">
          {definitions.map((def) => (
            <div
              key={`def-${def.index}`}
              onClick={() => handleDefClick(def)}
              className={getCardClass(def, 'def')}
            >
              {def.text}
            </div>
          ))}
        </div>
      </div>

      {/* Win State Overlay */}
      {gameWon && (
        <div className="animate-in fade-in zoom-in absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 p-6 backdrop-blur-md duration-300 dark:bg-white/90">
          <div className="mb-6 bg-transparent p-4">
            <Sparkles className="h-12 w-12 text-white" />
          </div>
          <h3 className="mb-2 text-3xl font-black text-white dark:text-gray-900">
            {isMasterWin ? 'MASTERED!' : 'LEVEL COMPLETE!'}
          </h3>
          <p className="mb-8 text-gray-300 dark:text-gray-600">
            Bạn đã ghép đúng tất cả các thẻ. <br />
            <span className="mt-2 inline-block text-sm text-gray-500">
              (Nhấn Enter để tiếp tục)
            </span>
          </p>

          <button
            onClick={handleNextLevel}
            className="flex items-center gap-2 rounded-full bg-[#1d1d1d] px-8 py-3 font-bold text-white transition-transform hover:scale-105 dark:from-green-500 dark:to-teal-600"
          >
            {isMasterWin ? (
              <>
                {' '}
                <RefreshCw size={20} /> Chơi lại từ đầu{' '}
              </>
            ) : (
              <>
                {' '}
                Màn tiếp theo <ChevronsRight size={20} />{' '}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
