import dotenv from 'dotenv';
dotenv.config();

export const chatRoleplay = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'Server thiếu GEMINI_API_KEY' });

    const { userMessage, history, targetWords, topicTitle, level = 'beginner' } = req.body;

    let levelInstruction =
      level === 'beginner'
        ? 'Dùng câu cực kỳ đơn giản, ngắn gọn (A1). Tốc độ chậm.'
        : 'Dùng câu tự nhiên, idioms (B1-B2).';

    // PROMPT
    const systemPrompt = `
      [VAI TRÒ TUYỆT ĐỐI]
      Bạn là nhân vật trong tình huống: "${topicTitle}".
      NHIỆM VỤ DUY NHẤT: Khiến người dùng nói ra các từ trong danh sách: [${targetWords.join(
        ', '
      )}].
      
      [CHIẾN THUẬT HỘI THOẠI - BẮT BUỘC TUÂN THỦ]
      1. ${levelInstruction}
      2. KHÔNG tán gẫu lan man. Nếu người dùng nói chuyện không liên quan, hãy LÁI câu chuyện quay lại để dùng từ vựng ngay lập tức.
      3. TẠO TÌNH HUỐNG (CÁI BẪY): Hãy đặt câu hỏi hoặc tạo ngữ cảnh ép buộc người dùng phải dùng từ mục tiêu để trả lời.
         - Ví dụ từ "Apple": Đừng hỏi "Do you like fruit?". Hãy hỏi "I have an Orange and an Apple. Which one do you want?" (Ép chọn).
         - Ví dụ từ "Bye": Đừng hỏi "Anything else?". Hãy nói "I have to rush to a meeting now!" (Ép chào tạm biệt).
      4. Đừng liệt kê từ vựng ra, hãy để người dùng tự nghĩ (hoặc dùng gợi ý của bạn).

      [YÊU CẦU ĐỊNH DẠNG JSON]
      Trả về duy nhất chuỗi JSON (không markdown):
      {
        "english": "Câu trả lời của bạn (đã lái về đúng mục đích).",
        "vietnamese": "Dịch câu trên sang tiếng Việt.",
        "correction": "Sửa lỗi ngữ pháp (nếu có, không thì để null).",
        "suggestions": [
            "Gợi ý 1 (BẮT BUỘC chứa 1 từ trong danh sách mục tiêu)",
            "Gợi ý 2 (BẮT BUỘC chứa 1 từ trong danh sách mục tiêu)",
            "Gợi ý 3 (Câu trả lời ngắn gọn khác)"
        ]
      }
    `;

    // Xử lý lịch sử
    const processedHistory = history
      .filter((msg) => msg && msg.content && msg.role !== 'system')
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
    console.error('Chat Controller Error:', error);
    res.status(500).json({ message: 'Lỗi: ' + error.message });
  }
};
