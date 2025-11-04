//Study
import Cards from '../models/Cards.js';

const getAllFlashcards = async (req, res) => {
  try {
    const allCards = await Cards.findAll();

    return res.json(allCards);
  } catch (err) {
    console.error('Error query flashcards', err);
    return res.status(500).json({ error: 'Error server' });
  }
};
export default {
  getAllFlashcards,
};
