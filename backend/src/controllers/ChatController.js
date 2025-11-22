import dotenv from 'dotenv';
dotenv.config();

export const chatRoleplay = async (req, res) => {
  try {
    // 1. Lấy API Key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Server thiếu GEMINI_API_KEY' });
    }

    const { userMessage, history, targetWords, topicTitle } = req.body;

    // 2. Chuẩn bị Prompt
    const systemPrompt = `
      Bạn là AI đóng vai (Roleplay). Chủ đề: "${topicTitle || 'Giao tiếp'}".
      Từ vựng: [${targetWords ? targetWords.join(', ') : ''}].
      Quy tắc: Đóng vai phù hợp, trả lời ngắn gọn (dưới 50 từ), sửa lỗi ngữ pháp nếu có.
    `;

    // Ghép lịch sử chat để AI hiểu ngữ cảnh
    // Lưu ý: Google API dùng format { role: "user" | "model", parts: [{ text: "..." }] }
    const contents = history.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Thêm tin nhắn hiện tại vào cuối
    contents.push({
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nUser nói: ${userMessage}` }],
    });

    // 3. GỌI TRỰC TIẾP API CỦA GOOGLE (Không qua thư viện)
    // Dùng model gemini-1.5-flash cho nhanh
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: contents,
      }),
    });

    const data = await response.json();

    // 4. Xử lý kết quả trả về
    if (!response.ok) {
      console.error('Lỗi Google API:', JSON.stringify(data, null, 2));
      throw new Error(data.error?.message || 'Lỗi khi gọi Google API');
    }

    const replyText = data.candidates[0].content.parts[0].text;

    res.json({ reply: replyText });
  } catch (error) {
    console.error('Chat Controller Error:', error);
    res.status(500).json({ message: 'Lỗi: ' + error.message });
  }
};
