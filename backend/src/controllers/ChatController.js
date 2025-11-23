import dotenv from 'dotenv';
dotenv.config();

export const chatRoleplay = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Server thiếu GEMINI_API_KEY' });
    }

    const { userMessage, history, targetWords, topicTitle } = req.body;

    const systemPrompt = `
      Bạn là một trợ lý AI đóng vai (Roleplay) để giúp người dùng học tiếng Anh.
      - Chủ đề: "${topicTitle || 'Giao tiếp tự do'}".
      - Từ vựng mục tiêu cần luyện: [${targetWords ? targetWords.join(', ') : ''}].
      
      YÊU CẦU QUAN TRỌNG:
      1. Đóng vai một nhân vật phù hợp với chủ đề này.
      2. Trả lời ngắn gọn, tự nhiên (dưới 60 từ).
      3. Khéo léo khuyến khích người dùng sử dụng các từ vựng mục tiêu.
      4. Nếu người dùng mắc lỗi ngữ pháp, hãy phản hồi bình thường, sau đó thêm dòng sửa lỗi ở cuối cùng trong ngoặc đơn. Ví dụ: (Sửa lỗi: ...)
    `;

    const contents = history
      .filter((msg) => msg && msg.content && msg.content.trim() !== '')
      .map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

    contents.push({
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nNgười dùng nói: ${userMessage}` }],
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: contents }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Lỗi Google API:', JSON.stringify(data, null, 2));

      throw new Error(data.error?.message || 'Lỗi không xác định từ Google AI');
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText) {
      throw new Error('AI không trả lời (Phản hồi rỗng).');
    }

    res.json({ reply: replyText });
  } catch (error) {
    console.error('Chat Controller Error:', error);
    res.status(500).json({ message: 'Lỗi Server: ' + error.message });
  }
};
