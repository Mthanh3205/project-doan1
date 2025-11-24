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
    const userId = req.user.id; // Lấy từ Token (qua middleware)

    // Tạo Prompt nhờ AI chấm điểm
    const reviewPrompt = `
      Dưới đây là đoạn hội thoại luyện tiếng Anh giữa người dùng và AI về chủ đề "${topicTitle}".
      
      [HỘI THOẠI]
      ${history.map((m) => `${m.role}: ${m.content}`).join('\n')}

      [YÊU CẦU CHẤM ĐIỂM]
      Hãy đóng vai một giáo viên IELTS khó tính. Phân tích đoạn hội thoại trên và trả về kết quả JSON theo mẫu sau:
      {
        "score": (Số nguyên 0-100 dựa trên độ chính xác và sự tự nhiên),
        "feedback": "Nhận xét tổng quan ngắn gọn (tiếng Việt) về điểm mạnh và điểm yếu.",
        "mistakes": ["Lỗi sai 1 (kèm sửa lỗi)", "Lỗi sai 2", "Lỗi sai 3"],
        "best_words": ["Từ vựng hay 1", "Từ vựng hay 2", "Từ vựng hay 3"]
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

    //  Lưu vào Database (Lưu lịch sử VIP)
    await AiSession.create({
      user_id: userId,
      topic_title: topicTitle,
      messages: history,
      score: report.score,
      feedback: report.feedback,
    });

    res.json({ success: true, report });
  } catch (error) {
    console.error('End Session Error:', error);
    res.status(500).json({ message: 'Lỗi chấm điểm: ' + error.message });
  }
};
