// controllers/createController.js
import { Topics, Flashcard, User } from '../models/index.js';

// Helper check quyền sở hữu (giữ nguyên hoặc cập nhật nếu cần admin can thiệp sâu hơn)
const checkFlashcardOwnership = async (cardId, userId) => {
  try {
    const card = await Flashcard.findByPk(cardId);
    if (!card) return { error: 'Không tìm thấy từ vựng', status: 404 };

    const deck = await Topics.findByPk(card.deck_id);
    if (!deck) return { error: 'Không tìm thấy chủ đề', status: 404 };

    // Admin (id=1) luôn có quyền, hoặc chủ sở hữu
    if (userId !== 1 && deck.user_id !== userId) {
      return { error: 'Bạn không có quyền thực hiện hành động này.', status: 403 };
    }

    return { authorized: true };
  } catch (error) {
    return { error: 'Lỗi server', status: 500 };
  }
};

// --- GET ALL DECKS (ĐÃ SỬA LOGIC ADMIN) ---
export const getAllDecks = async (req, res) => {
  try {
    const userId = req.user.id;

    // Cấu hình query cơ bản
    let queryOptions = {
      order: [['createdAt', 'DESC']], // Chú ý: createdAt viết hoa chữ A theo mặc định Sequelize
      include: [
        {
          model: User,
          as: 'author', // Phải khớp với alias trong models/index.js
          attributes: ['id', 'name', 'email'], // Chỉ lấy thông tin cần thiết
        },
      ],
    };

    // Nếu KHÔNG phải Admin (id = 1), chỉ lấy bài của chính mình
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

// Get Deck By ID
export const getDeckById = async (req, res) => {
  try {
    const deck = await Topics.findByPk(req.params.id, {
      include: { model: Flashcard, as: 'flashcards' },
    });
    if (!deck) return res.status(404).json({ message: 'Không tìm thấy chủ đề' });

    // Bảo mật: Nếu không phải admin và không phải chủ sở hữu thì không cho xem chi tiết (tùy chọn)
    if (req.user.id !== 1 && deck.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập chủ đề này' });
    }

    res.status(200).json(deck);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Deck
export const createDeck = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;
    const newDeck = await Topics.create({
      title,
      description,
      user_id: userId,
    });
    res.status(201).json(newDeck);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Deck
export const updateDeck = async (req, res) => {
  try {
    const userId = req.user.id;
    const deckId = req.params.id;

    let whereClause = { deck_id: deckId };
    if (userId !== 1) whereClause.user_id = userId; // Admin được sửa tất cả

    const [updated] = await Topics.update(req.body, { where: whereClause });

    if (updated) {
      const updatedDeck = await Topics.findByPk(deckId);
      res.status(200).json(updatedDeck);
    } else {
      res.status(404).json({ message: 'Không tìm thấy chủ đề hoặc bạn không có quyền' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- DELETE DECK (ĐÃ SỬA CHO ADMIN) ---
export const deleteDeck = async (req, res) => {
  try {
    const userId = req.user.id;
    const deckId = req.params.id;

    let whereClause = { deck_id: deckId };

    // Nếu không phải Admin, thêm điều kiện user_id
    if (userId !== 1) {
      whereClause.user_id = userId;
    }

    const deck = await Topics.findOne({ where: whereClause });

    if (!deck) {
      return res
        .status(403)
        .json({ message: 'Bạn không có quyền xóa chủ đề này hoặc chủ đề không tồn tại.' });
    }

    // Xóa các flashcard con trước
    await Flashcard.destroy({ where: { deck_id: deckId } });
    // Xóa chủ đề
    await Topics.destroy({ where: { deck_id: deckId } });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- FLASHCARD CRUD ---

export const createFlashcard = async (req, res) => {
  try {
    const { deck_id, front_text, back_text, pronunciation, example, image_url } = req.body;
    const userId = req.user.id;

    // Kiểm tra quyền chủ đề
    const deck = await Topics.findByPk(deck_id);
    if (!deck) return res.status(404).json({ message: 'Chủ đề không tồn tại' });

    if (userId !== 1 && deck.user_id !== userId) {
      return res.status(403).json({ message: 'Bạn không có quyền thêm vào chủ đề này.' });
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

export const updateFlashcard = async (req, res) => {
  try {
    const userId = req.user.id;
    const cardId = req.params.id;

    const { authorized, error, status } = await checkFlashcardOwnership(cardId, userId);
    if (!authorized) return res.status(status).json({ message: error });

    const [updated] = await Flashcard.update(req.body, { where: { card_id: cardId } });
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

export const deleteFlashcard = async (req, res) => {
  try {
    const userId = req.user.id;
    const cardId = req.params.id;

    const { authorized, error, status } = await checkFlashcardOwnership(cardId, userId);
    if (!authorized) return res.status(status).json({ message: error });

    await Flashcard.destroy({ where: { card_id: cardId } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
