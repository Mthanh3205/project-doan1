import { Topics, Flashcard, User } from '../models/index.js';

const checkFlashcardOwnership = async (cardId, userId) => {
  try {
    const card = await Flashcard.findByPk(cardId);
    if (!card) {
      return { error: 'Không tìm thấy từ vựng', status: 404 };
    }

    const deck = await Topics.findByPk(card.deck_id);
    if (!deck) {
      return { error: 'Không tìm thấy chủ đề chứa từ vựng này', status: 404 };
    }

    // Admin (id=1) hoặc chủ sở hữu mới được phép
    if (userId !== 1 && deck.user_id !== userId) {
      return { error: 'Bạn không có quyền thực hiện hành động này.', status: 403 };
    }

    return { authorized: true };
  } catch (error) {
    return { error: 'Lỗi server khi xác thực quyền', status: 500 };
  }
};

// GET ALL DECKS

export const getAllDecks = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: User info missing' });
    }

    const userId = Number(req.user.id);

    let queryOptions = {
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email'],
        },
      ],
    };

    if (userId !== 1) {
      queryOptions.where = { user_id: userId };
    }

    const decks = await Topics.findAll(queryOptions);
    res.status(200).json(decks);
  } catch (error) {
    console.error('Lỗi getAllDecks:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET DECK BY ID
export const getDeckById = async (req, res) => {
  try {
    const deck = await Topics.findByPk(req.params.id, {
      include: {
        model: Flashcard,
        as: 'flashcards',
      },
    });

    if (!deck) {
      return res.status(404).json({ message: 'Không tìm thấy chủ đề' });
    }

    // ĐÃ XÓA CHECK QUYỀN Ở ĐÂY ĐỂ AI CŨNG CÓ THỂ VÀO HỌC

    res.status(200).json(deck);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE DECK
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

// UPDATE DECK
export const updateDeck = async (req, res) => {
  try {
    const userId = req.user.id;
    const deckId = req.params.id;

    let whereClause = { deck_id: deckId };

    // Nếu không phải Admin, chỉ được sửa bài của mình
    if (userId !== 1) {
      whereClause.user_id = userId;
    }

    const [updated] = await Topics.update(req.body, {
      where: whereClause,
    });

    if (updated) {
      const updatedDeck = await Topics.findByPk(deckId);
      res.status(200).json(updatedDeck);
    } else {
      res.status(403).json({ message: 'Không tìm thấy chủ đề hoặc bạn không có quyền sửa.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE DECK
export const deleteDeck = async (req, res) => {
  try {
    const userId = req.user.id;
    const deckId = req.params.id;

    let whereClause = { deck_id: deckId };

    // Nếu không phải Admin, chỉ được xóa bài của mình
    if (userId !== 1) {
      whereClause.user_id = userId;
    }

    const deck = await Topics.findOne({ where: whereClause });

    if (!deck) {
      return res
        .status(403)
        .json({ message: 'Bạn không có quyền xóa chủ đề này hoặc chủ đề không tồn tại.' });
    }

    // Xóa hết Flashcard con trước
    await Flashcard.destroy({
      where: { deck_id: deckId },
    });

    // Xóa Topic
    await Topics.destroy({
      where: { deck_id: deckId },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE FLASHCARD
export const createFlashcard = async (req, res) => {
  try {
    const { deck_id, front_text, back_text, pronunciation, example, image_url } = req.body;
    const userId = req.user.id;

    const deck = await Topics.findByPk(deck_id);

    if (!deck) {
      return res.status(404).json({ message: 'Chủ đề không tồn tại' });
    }

    // Admin hoặc chủ sở hữu mới được thêm thẻ
    if (userId !== 1 && deck.user_id !== userId) {
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

// UPDATE FLASHCARD
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
      res.status(404).json({ message: 'Không tìm thấy từ vựng' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE FLASHCARD
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
      res.status(404).json({ message: 'Không tìm thấy từ vựng' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
