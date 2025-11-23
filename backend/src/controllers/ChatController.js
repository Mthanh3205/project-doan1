import dotenv from 'dotenv';
dotenv.config();

export const chatRoleplay = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'Server thiếu GEMINI_API_KEY' });

    const { userMessage, history, targetWords, topicTitle, level = 'beginner' } = req.body;

    let levelInstruction =
      level === 'beginner'
        ? 'Dùng câu đơn giản, ngắn gọn (A1-A2). Tốc độ chậm.'
        : 'Dùng câu phức, idioms tự nhiên (B1-B2).';

    //  SYSTEM PROMPT
    const systemPrompt = `
      [VAI TRÒ]
      Bạn là nhân vật trong tình huống: "${topicTitle}". 
      Mục tiêu DUY NHẤT: Giúp người dùng luyện tập danh sách từ vựng: [${targetWords.join(', ')}].
      
      [QUY TẮC TRÒ CHUYỆN - QUAN TRỌNG]
      1. ${levelInstruction}
      2. KIỂM SOÁT HỘI THOẠI: Nếu người dùng nói chuyện lạc đề (không liên quan đến từ vựng mục tiêu), hãy khéo léo lái câu chuyện quay lại để sử dụng các từ vựng đó.
      3. TẠO TÌNH HUỐNG: Hãy đặt câu hỏi hoặc tạo ngữ cảnh để người dùng BẮT BUỘC phải dùng từ trong danh sách để trả lời.
         - Ví dụ: Nếu từ vựng là "Bye", hãy giả vờ bạn đang vội và muốn chào tạm biệt.
         - Ví dụ: Nếu từ vựng là "Thanks", hãy tặng người dùng một món quà ảo.
      4. Giới hạn độ dài: Dưới 60 từ.

      [YÊU CẦU VỀ ĐỊNH DẠNG TRẢ LỜI (JSON)]
      Bạn BẮT BUỘC phải trả về duy nhất một chuỗi JSON hợp lệ (không markdown) theo mẫu sau:
      {
        "english": "Câu trả lời của bạn (đã lái về đúng chủ đề).",
        "vietnamese": "Dịch câu trên sang tiếng Việt.",
        "correction": "Sửa lỗi ngữ pháp (nếu có, không thì để null).",
        "suggestions": ["Gợi ý 1 (Chứa từ vựng mục tiêu)", "Gợi ý 2 (Chứa từ vựng mục tiêu)", "Gợi ý 3"]
      }
    `;

    const processedHistory = history
      .filter((msg) => msg && msg.content)
      .slice(-10)
      .map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

    processedHistory.push({
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nUser nói: ${userMessage}` }],
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
