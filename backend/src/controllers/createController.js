//Create
import { Topics, Flashcard } from '../models/CreateVoc.js';

//Get all topics
export const getAllDecks = async (req, res) => {
  try {
    const decks = await Topics.findAll({
      order: [['created_at', 'DESC']],
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
    // 1. Lấy title, description từ frontend
    const { title, description } = req.body;

    // 2. Lấy user_id MÀ BACKEND ĐÃ XÁC THỰC ở Bước 5
    const userId = req.user.id;

    // 3. Tạo CSDL với ID đúng
    const newDeck = await Topics.create({
      title: title,
      description: description,
      user_id: userId, // <-- Đây là ID thật, đã được xác thực
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
      where: { deck_id: req.params.id },
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
    //first delete flashcard
    await Flashcard.destroy({
      where: { deck_id: req.params.id },
    });

    //delete topic
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
// Thay thế hàm createFlashcard cũ bằng hàm này

//Create
export const createFlashcard = async (req, res) => {
  try {
    // 1. Lấy dữ liệu từ frontend (front_text, back_text,...)
    const { deck_id, front_text, back_text, pronunciation, example, image_url } = req.body;

    // 2. Lấy user_id từ Token (đã được middleware xác thực)
    const userId = req.user.id;

    // 3. KIỂM TRA QUYỀN: Kiểm tra xem chủ đề (deck) này có thuộc về user này không
    const deck = await Topics.findOne({
      where: {
        deck_id: deck_id, // Chủ đề mà user muốn thêm card vào
        user_id: userId, // Phải là chủ đề của user này
      },
    });

    // 4. Nếu không tìm thấy (deck không tồn tại HOẶC không phải của user này)
    if (!deck) {
      return res.status(403).json({ message: 'Lỗi: Bạn không có quyền thêm vào chủ đề này.' });
    }

    // 5. Nếu có quyền, tạo flashcard
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
    const [updated] = await Flashcard.update(req.body, {
      where: { card_id: req.params.id },
    });
    if (updated) {
      const updatedCard = await Flashcard.findByPk(req.params.id);
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
    const deleted = await Flashcard.destroy({
      where: { card_id: req.params.id },
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
