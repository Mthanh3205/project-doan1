import dotenv from 'dotenv';
import AiSession from '../models/AiSession.js';
dotenv.config();

export const chatRoleplay = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'Server thiếu GEMINI_API_KEY' });

    const { userMessage, history, targetWords, topicTitle, level = 'beginner' } = req.body;

    //  CẤU HÌNH CẤP ĐỘ
    let levelInstruction = '';
    if (level === 'beginner') {
      levelInstruction =
        'Dùng từ vựng đơn giản (A1-A2) nhưng ngữ điệu phải TỰ NHIÊN như bạn bè. Không được nói chuyện như người máy.';
    } else {
      levelInstruction = 'Dùng câu phức, tiếng lóng (slang), idioms tự nhiên (B1-B2).';
    }

    // SYSTEM PROMPT
    const systemPrompt = `
      [VAI TRÒ]
      Bạn là một nhân vật thực tế trong chủ đề: "${topicTitle}".
      Mục tiêu: Khiến người dùng nói ra các từ: [${targetWords.join(', ')}].
      
      [QUY TẮC HỘI THOẠI - BẮT BUỘC]
      1. ${levelInstruction}
      2. TRÁNH LẶP LẠI: Tuyệt đối KHÔNG lặp lại cấu trúc câu hỏi.
      3. CẤM XIN PHÉP:
         - KHÔNG nói: "Is that okay?", "Is that good?", "Can I ask you?".
         - KHÔNG nói: "I will give you a word now".
         - HÃY đi thẳng vào vấn đề. Ví dụ thay vì hỏi "Can I ask?", hãy hỏi luôn "What is your favorite color?".
      4. PHẢN XẠ THÔNG MINH:
         - Nếu người dùng trả lời ngắn (Yes/No/Ok), hãy hỏi thêm câu hỏi mở (Why, What, How...) để kéo dài cuộc trò chuyện.
         - Hãy tỏ ra ngạc nhiên, vui vẻ hoặc tò mò tùy theo ngữ cảnh.

      [YÊU CẦU ĐỊNH DẠNG JSON]
      Trả về duy nhất chuỗi JSON hợp lệ (không markdown):
      {
        "english": "Câu trả lời tự nhiên của bạn.",
        "vietnamese": "Dịch sang tiếng Việt.",
        "correction": "Sửa lỗi ngữ pháp (nếu có, không thì để null).",
        "suggestions": ["Gợi ý 1", "Gợi ý 2", "Gợi ý 3"]
      }
    `;

    // Xử lý lịch sử
    const processedHistory = history
      .filter((msg) => msg && msg.content)
      .slice(-10)
      .map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

    processedHistory.push({
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nUser nói: "${userMessage}"` }],
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: processedHistory }),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error?.message || 'Lỗi Google API');

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText) throw new Error('AI phản hồi rỗng');

    res.json({ reply: replyText });
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ message: 'Lỗi: ' + error.message });
  }
};

export const endSession = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    // Lấy thông tin từ Frontend
    // history: Toàn bộ đoạn chat từ đầu đến cuối
    const { history, topicTitle } = req.body;
    const userId = req.user.id;

    // Tạo Prompt nhờ AI chấm điểm
    const reviewPrompt = `
      Dưới đây là đoạn hội thoại luyện tiếng Anh chủ đề "${topicTitle}".
      User đang đóng vai một nhân vật để luyện tập.

      [NỘI DUNG HỘI THOẠI]
      ${history.map((m) => `${m.role}: ${m.content}`).join('\n')}

      [YÊU CẦU CHẤM ĐIỂM]
      Hãy đóng vai một giám khảo IELTS. Chấm điểm trên thang 100 dựa theo 3 tiêu chí cụ thể sau:
      
      1. **Từ vựng (40đ):** Người dùng có sử dụng được các từ vựng khó hoặc từ vựng liên quan đến chủ đề không?
      2. **Ngữ pháp (30đ):** Cấu trúc câu có đúng không? Có lỗi sai cơ bản không?
      3. **Phản xạ & Ngữ cảnh (30đ):** Trả lời có hợp lý với vai diễn không? Có tự nhiên không?

      Hãy cộng tổng điểm lại và trả về JSON duy nhất:
      {
        "score": (Tổng điểm),
        "feedback": "Nhận xét chi tiết bằng tiếng Việt. Khen ngợi điểm mạnh và chỉ rõ điểm cần cải thiện.",
        "mistakes": [
           "Lỗi 1: [Câu sai] -> [Sửa lại] (Giải thích ngắn)",
           "Lỗi 2: [Câu sai] -> [Sửa lại] (Giải thích ngắn)"
        ],
        "best_words": ["3 từ vựng hoặc cụm từ hay nhất mà user đã dùng"]
      }
    `;

    // Gọi Google AI để chấm điểm
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: reviewPrompt }] }] }),
    });

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) throw new Error('AI không thể chấm điểm.');

    const cleanJson = aiText.replace(/```json|```/g, '').trim();
    const report = JSON.parse(cleanJson);

    //  Lưu vào Database
    await AiSession.create({
      user_id: userId,
      topic_title: topicTitle,
      messages: history,
      score: report.score,
      feedback: report.feedback,
      report_card: report,
    });

    res.json({ success: true, report });
  } catch (error) {
    console.error('End Session Error:', error);
    res.status(500).json({ message: 'Lỗi chấm điểm: ' + error.message });
  }
};

// LẤY LỊCH SỬ NGƯỜI DÙNG
export const getUserHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const history = await AiSession.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      //limit: 20, lấy 20 bản ghi mới nhất
      attributes: ['id', 'topic_title', 'score', 'created_at', 'report_card'],
    });

    res.json({ success: true, data: history });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi lấy lịch sử' });
  }
};
//DELETE
export const deleteSession = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID phiên học từ URL
    const userId = req.user.id; // Lấy ID người dùng đang đăng nhập

    // Xóa phiên học
    const deleted = await AiSession.destroy({
      where: {
        id: id,
        user_id: userId,
      },
    });

    if (deleted) {
      res.json({ success: true, message: 'Đã xóa thành công' });
    } else {
      res.status(404).json({ success: false, message: 'Không tìm thấy hoặc không có quyền xóa' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
