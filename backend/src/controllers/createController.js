//Create
import { Topics, Flashcard, User } from '../models/index.js';

// Hàm kiểm tra quyền sở hữu
const checkFlashcardOwnership = async (cardId, userId) => {
  try {
    const card = await Flashcard.findByPk(cardId);
    if (!card) return { error: 'Không tìm thấy từ vựng', status: 404 };

    const deck = await Topics.findByPk(card.deck_id);
    if (!deck) return { error: 'Không tìm thấy chủ đề', status: 404 };

    // Ép kiểu về số
    const currentUserId = Number(userId);

    // Admin (id=1) hoặc chủ sở hữu
    if (currentUserId !== 1 && deck.user_id !== currentUserId) {
      return { error: 'Bạn không có quyền sửa/xóa thẻ này.', status: 403 };
    }

    return { authorized: true };
  } catch (error) {
    return { error: 'Lỗi xác thực quyền: ' + error.message, status: 500 };
  }
};

// GET ALL DECKS
export const getAllDecks = async (req, res) => {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ message: 'Chưa đăng nhập' });

    const userId = Number(req.user.id); // Ép kiểu số
    console.log(`[GET] User ${userId} lấy danh sách chủ đề`);

    let queryOptions = {
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }],
    };

    // Nếu không phải Admin (1), chỉ lấy bài của user đó
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
      include: { model: Flashcard, as: 'flashcards' },
    });
    if (!deck) return res.status(404).json({ message: 'Không tìm thấy chủ đề' });
    res.status(200).json(deck);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE DECK (Đã fix lỗi không lưu)
export const createDeck = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Chưa đăng nhập' });

    const userId = Number(req.user.id); // Ép kiểu số

    if (!title) return res.status(400).json({ message: 'Tiêu đề là bắt buộc' });

    const newDeck = await Topics.create({
      title,
      description,
      user_id: userId,
    });

    console.log('=> Tạo Deck thành công:', newDeck.deck_id);
    res.status(201).json(newDeck);
  } catch (error) {
    console.error('Lỗi createDeck:', error);
    res.status(500).json({ message: error.message });
  }
};

// UPDATE DECK
export const updateDeck = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const deckId = req.params.id;
    let whereClause = { deck_id: deckId };

    if (userId !== 1) whereClause.user_id = userId;

    const [updated] = await Topics.update(req.body, { where: whereClause });

    if (updated) {
      const updatedDeck = await Topics.findByPk(deckId);
      res.status(200).json(updatedDeck);
    } else {
      res.status(403).json({ message: 'Không có quyền sửa hoặc chủ đề không tồn tại' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE DECK
export const deleteDeck = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const deckId = req.params.id;
    let whereClause = { deck_id: deckId };

    if (userId !== 1) whereClause.user_id = userId;

    const deck = await Topics.findOne({ where: whereClause });
    if (!deck) return res.status(403).json({ message: 'Không có quyền xóa' });

    // Xóa thẻ con trước
    await Flashcard.destroy({ where: { deck_id: deckId } });
    // Xóa Deck
    await Topics.destroy({ where: { deck_id: deckId } });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE FLASHCARD
export const createFlashcard = async (req, res) => {
  try {
    const { deck_id, front_text, back_text, pronunciation, example, image_url } = req.body;
    const userId = Number(req.user.id);

    const deck = await Topics.findByPk(deck_id);
    if (!deck) return res.status(404).json({ message: 'Chủ đề không tồn tại' });

    if (userId !== 1 && deck.user_id !== userId) {
      return res.status(403).json({ message: 'Không có quyền thêm vào chủ đề này' });
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
    const { authorized, error, status } = await checkFlashcardOwnership(req.params.id, req.user.id);
    if (!authorized) return res.status(status).json({ message: error });

    const [updated] = await Flashcard.update(req.body, { where: { card_id: req.params.id } });
    if (updated) {
      const card = await Flashcard.findByPk(req.params.id);
      res.status(200).json(card);
    } else {
      res.status(404).json({ message: 'Không tìm thấy thẻ' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE FLASHCARD
export const deleteFlashcard = async (req, res) => {
  try {
    const { authorized, error, status } = await checkFlashcardOwnership(req.params.id, req.user.id);
    if (!authorized) return res.status(status).json({ message: error });

    await Flashcard.destroy({ where: { card_id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
