//Create
import Topics from './Topics.js';
import Flashcard from './Flashcard.js';

// Một chủ đề (Deck/Topic) có nhiều Flashcard
Topics.hasMany(Flashcard, {
  foreignKey: 'deck_id',
  as: 'flashcards', // alias to include
});

// Một Flashcard thuộc về một chủ đề (Deck/Topic)
Flashcard.belongsTo(Topics, {
  foreignKey: 'deck_id',
});

// Export các model
export { Topics, Flashcard };
