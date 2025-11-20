//Create
import { Topics, Flashcard, UserProgress, sequelize } from '../models/index.js';

const checkFlashcardOwnership = async (cardId, userId) => {
  try {
    //Tìm flashcard bằng card_id
    const card = await Flashcard.findByPk(cardId);

    if (!card) {
      return { error: 'Không tìm thấy từ vựng', status: 404 };
    }

    // Dùng deck_id từ flashcard để tìm chủ đề
    const deck = await Topics.findByPk(card.deck_id);

    if (!deck) {
      return { error: 'Không tìm thấy chủ đề chứa từ vựng này', status: 404 };
    }

    // So sánh user_id của chủ đề với user_id từ token
    if (deck.user_id !== userId) {
      return { error: 'Bạn không có quyền thực hiện hành động này.', status: 403 };
    }

    return { authorized: true };
  } catch (error) {
    return { error: 'Lỗi server khi xác thực quyền', status: 500 };
  }
};

//Get all topics
export const getAllDecks = async (req, res) => {
  try {
    const userId = req.user.id;
    const decks = await Topics.findAll({
      where: { user_id: userId }, // Chỉ lấy deck của user này
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(decks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Get all flashcard
export const getDeckById = async (req, res) => {
  try {
    const deck = await Topics.findByPk(req.params.id, {
      include: {
        model: Flashcard,
        as: 'flashcards', //alias
      },
    });
    if (!deck) {
      return res.status(404).json({ message: 'No find topic' });
    }
    res.status(200).json(deck);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Create topic
export const createDeck = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;
    const newDeck = await Topics.create({
      title: title,
      description: description,
      user_id: userId,
    });
    res.status(201).json(newDeck);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Update topic
export const updateDeck = async (req, res) => {
  try {
    const [updated] = await Topics.update(req.body, {
      where: { deck_id: req.params.id, user_id: req.user.id },
    });
    if (updated) {
      const updatedDeck = await Topics.findByPk(req.params.id);
      res.status(200).json(updatedDeck);
    } else {
      res.status(404).json({ message: 'No find topic' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Delete topic and flashcard
export const deleteDeck = async (req, res) => {
  try {
    const deck = await Topics.findOne({
      where: { deck_id: req.params.id, user_id: req.user.id },
    });

    if (!deck) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa chủ đề này.' });
    }

    await Flashcard.destroy({
      where: { deck_id: req.params.id },
    });

    const deleted = await Topics.destroy({
      where: { deck_id: req.params.id },
    });

    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'No find topic' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//CRUD vocabulary

//Create
export const createFlashcard = async (req, res) => {
  try {
    const { deck_id, front_text, back_text, pronunciation, example, image_url } = req.body;
    const userId = req.user.id;

    const deck = await Topics.findOne({
      where: {
        deck_id: deck_id,
        user_id: userId,
      },
    });

    if (!deck) {
      return res.status(403).json({ message: 'Lỗi: Bạn không có quyền thêm vào chủ đề này.' });
    }

    const newCard = await Flashcard.create({
      deck_id,
      front_text,
      back_text,
      pronunciation,
      example,
      image_url,
    });

    res.status(201).json(newCard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Update
export const updateFlashcard = async (req, res) => {
  try {
    const userId = req.user.id;
    const cardId = req.params.id;

    const { authorized, error, status } = await checkFlashcardOwnership(cardId, userId);

    if (!authorized) {
      return res.status(status).json({ message: error });
    }

    const [updated] = await Flashcard.update(req.body, {
      where: { card_id: cardId },
    });

    if (updated) {
      const updatedCard = await Flashcard.findByPk(cardId);
      res.status(200).json(updatedCard);
    } else {
      res.status(404).json({ message: 'No find vocabulary' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Delete
export const deleteFlashcard = async (req, res) => {
  try {
    const userId = req.user.id;
    const cardId = req.params.id;

    const { authorized, error, status } = await checkFlashcardOwnership(cardId, userId);

    if (!authorized) {
      return res.status(status).json({ message: error });
    }

    const deleted = await Flashcard.destroy({
      where: { card_id: cardId },
    });

    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'No find vocabulary' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
