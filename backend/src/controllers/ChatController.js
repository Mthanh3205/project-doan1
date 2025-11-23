import dotenv from 'dotenv';
dotenv.config();

export const chatRoleplay = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'Server thiếu GEMINI_API_KEY' });

    const { userMessage, history, targetWords, topicTitle, level = 'beginner' } = req.body;

    // Cấu hình cấp độ
    let levelInstruction =
      level === 'beginner'
        ? 'Dùng câu đơn giản, ngắn gọn (A1-A2). Tốc độ chậm.'
        : 'Dùng câu phức, idioms tự nhiên (B1-B2).';

    // --- SYSTEM PROMPT (KẾT HỢP GỢI Ý + DỊCH) ---
    const systemPrompt = `
      [VAI TRÒ]
      Bạn là một nhân vật trong tình huống: "${topicTitle}". TUYỆT ĐỐI KHÔNG nhận mình là AI.
      Mục tiêu: Giúp người dùng luyện tập từ vựng: [${targetWords.join(', ')}].
      
      [QUY TẮC TRÒ CHUYỆN]
      1. ${levelInstruction}
      2. Cố gắng lồng ghép 1-2 từ trong danh sách từ vựng vào câu trả lời.
      3. Luôn kết thúc bằng một câu hỏi mở.
      4. Giới hạn độ dài: Dưới 60 từ.

      [YÊU CẦU VỀ ĐỊNH DẠNG TRẢ LỜI (JSON)]
      Bạn BẮT BUỘC phải trả về duy nhất một chuỗi JSON hợp lệ (không markdown, không code block) theo mẫu sau:
      {
        "english": "Câu trả lời nhập vai của bạn bằng tiếng Anh.",
        "vietnamese": "Dịch câu trả lời trên sang tiếng Việt tự nhiên.",
        "correction": "Nếu người dùng sai ngữ pháp, hãy sửa lại ở đây (ví dụ: 'I wants -> I want'). Nếu đúng thì để null.",
        "suggestions": ["Gợi ý trả lời ngắn 1 (Tiếng Anh)", "Gợi ý trả lời ngắn 2 (Tiếng Anh)", "Gợi ý trả lời ngắn 3 (Tiếng Anh)"]
      }
    `;

    // Xử lý lịch sử chat (Lọc tin nhắn rỗng)
    const processedHistory = history
      .filter((msg) => msg && msg.content)
      .slice(-10) // Lấy 10 tin gần nhất
      .map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }], // Chỉ gửi phần tiếng Anh lên cho AI hiểu
      }));

    // Thêm tin nhắn mới
    processedHistory.push({
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nUser nói: ${userMessage}` }],
    });

    // Gọi API Gemini 2.5 (Bản mới nhất bạn đang dùng ổn)
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

    // Trả về chuỗi JSON gốc để Frontend tự xử lý
    res.json({ reply: replyText });
  } catch (error) {
    console.error('Chat Controller Error:', error);
    res.status(500).json({ message: 'Lỗi: ' + error.message });
  }
};
