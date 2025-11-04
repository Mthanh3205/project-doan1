//Vocabulary
import Vocabulary from '../models/Vocabulary.js';

// Get all flashcards
export const getAllFlashcards = async (req, res) => {
  try {
    const allCards = await Vocabulary.findAll({
      order: [['card_id', 'ASC']],
    });

    if (!allCards || allCards.length === 0) {
      return res.status(404).json({ message: 'No flashcard in system' });
    }

    res.status(200).json(allCards);
  } catch (err) {
    console.error('Error query flashcards:', err);
    res.status(500).json({ error: 'Error server get all flashcards' });
  }
};

//Get flashcard deck_id
export const getFlashcardsByDeck = async (req, res) => {
  try {
    const deckId = parseInt(req.params.deckId, 10);

    if (isNaN(deckId)) {
      return res.status(400).json({ error: 'deckId no valid' });
    }

    const flashcards = await Vocabulary.findAll({
      where: { deck_id: deckId },
      order: [['card_id', 'ASC']],
    });

    if (!flashcards || flashcards.length === 0) {
      return res.status(404).json({ message: 'No find flashcard for topic' });
    }

    res.status(200).json(flashcards);
  } catch (err) {
    console.error('Error query flashcards - deck:', err);
    res.status(500).json({ error: 'Error server get flashcards - deck.' });
  }
};
