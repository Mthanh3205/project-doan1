import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
dotenv.config();

export const chatRoleplay = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'Server thiếu GEMINI_API_KEY' });

    const genAI = new GoogleGenerativeAI(apiKey);

    const { userMessage, history, targetWords, topicTitle } = req.body;

    const systemPrompt = `
      Bạn là AI đóng vai (Roleplay). Chủ đề: "${topicTitle || 'Giao tiếp'}".
      Từ vựng: [${targetWords ? targetWords.join(', ') : ''}].
      Quy tắc: Đóng vai phù hợp, trả lời ngắn gọn (dưới 50 từ), sửa lỗi ngữ pháp nếu có.
    `;

    const validHistory = history.filter((msg) => msg && msg.content && msg.content.trim() !== '');

    const contents = validHistory.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    contents.push({
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nUser nói: ${userMessage}` }],
    });

    // ⭐ DÙNG SDK MỚI - Model mới (không có prefix models/)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    const result = await model.generateContent({ contents });

    const replyText = result.response.text();

    res.json({ reply: replyText });
  } catch (error) {
    console.error('Chat Controller Error:', error);
    res.status(500).json({ message: 'Lỗi: ' + error.message });
  }
};
