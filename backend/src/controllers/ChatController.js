import dotenv from 'dotenv';
dotenv.config();

export const chatRoleplay = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'Server thiếu GEMINI_API_KEY' });

    const { userMessage, history, targetWords, topicTitle } = req.body;

    // 1. Chuẩn bị Prompt
    const systemPrompt = `
      Bạn là AI đóng vai (Roleplay). Chủ đề: "${topicTitle || 'Giao tiếp'}".
      Từ vựng: [${targetWords ? targetWords.join(', ') : ''}].
      Quy tắc: Đóng vai phù hợp, trả lời ngắn gọn (dưới 50 từ), sửa lỗi ngữ pháp nếu có.
    `;

    // 2. XỬ LÝ & LỌC LỊCH SỬ CHAT (QUAN TRỌNG - FIX LỖI TẠI ĐÂY)
    // Chỉ lấy những tin nhắn có nội dung thực sự (không null, không rỗng)
    const validHistory = history.filter((msg) => msg && msg.content && msg.content.trim() !== '');

    const contents = validHistory.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }], // Đảm bảo text luôn có giá trị
    }));

    // 3. Thêm tin nhắn mới nhất của user kèm system prompt
    contents.push({
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nUser nói: ${userMessage}` }],
    });

    // 4. Gọi API Google
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: contents }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Lỗi Google API Chi tiết:', JSON.stringify(data, null, 2));
      throw new Error(data.error?.message || 'Lỗi Google API');
    }

    // Kiểm tra xem Google có trả về text không
    if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
      throw new Error('Google không trả về nội dung (Blocked/Empty response)');
    }

    const replyText = data.candidates[0].content.parts[0].text;
    res.json({ reply: replyText });
  } catch (error) {
    console.error('Chat Controller Error:', error);
    res.status(500).json({ message: 'Lỗi: ' + error.message });
  }
};
