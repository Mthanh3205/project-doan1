import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

// Khởi tạo Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const chatRoleplay = async (req, res) => {
  try {
    const { userMessage, history, targetWords, topicTitle } = req.body;

    // Chọn model (gemini-1.5-flash cho nhanh và free)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Tạo prompt
    const systemPrompt = `
      Bạn là một trợ lý học tiếng Anh AI. Chế độ: ROLEPLAY.
      Bối cảnh: Chủ đề "${topicTitle}".
      Từ vựng cần luyện: [${targetWords ? targetWords.join(', ') : ''}].
      
      Nhiệm vụ:
      1. Đóng vai nhân vật phù hợp chủ đề.
      2. Trả lời ngắn gọn (dưới 50 từ).
      3. Khuyến khích dùng từ vựng trên.
      4. Sửa lỗi ngữ pháp nếu cần (trong ngoặc đơn).
      
      Lịch sử chat:
      ${history.map((msg) => `${msg.role}: ${msg.content}`).join('\n')}
      
      User nói: "${userMessage}"
    `;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error('Lỗi AI:', error);
    res.status(500).json({ message: 'AI đang bận, thử lại sau nhé!' });
  }
};
