//Chat
import dotenv from 'dotenv';
dotenv.config();

export const chatRoleplay = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'Server thiếu GEMINI_API_KEY' });

    // Nhận thêm tham số 'level' từ frontend
    const { userMessage, history, targetWords, topicTitle, level = 'beginner' } = req.body;

    // CẤU HÌNH CẤP ĐỘ
    let levelInstruction = '';
    if (level === 'beginner') {
      levelInstruction =
        'Dùng câu đơn giản, ngắn gọn, từ vựng thông dụng (A1-A2). Tốc độ chậm rãi.';
    } else {
      levelInstruction =
        'Dùng câu phức, đa dạng, idioms tự nhiên (B1-B2). Tốc độ như người bản xứ.';
    }

    // SYSTEM PROMPT (KỊCH BẢN CHO AI)
    const systemPrompt = `
      [VAI TRÒ]
      Bạn là một nhân vật trong tình huống thực tế liên quan đến chủ đề: "${topicTitle}".
      TUYỆT ĐỐI KHÔNG nhận mình là AI. Hãy nhập vai hoàn toàn.
      
      [MỤC TIÊU]
      Giúp người dùng luyện tập danh sách từ vựng: [${targetWords.join(', ')}].
      
      [QUY TẮC TRÒ CHUYỆN]
      1. ${levelInstruction}
      2. Cố gắng lồng ghép 1-2 từ trong danh sách từ vựng vào câu trả lời của bạn một cách tự nhiên.
      3. Luôn kết thúc bằng một câu hỏi mở để duy trì hội thoại.
      4. Giới hạn độ dài: Dưới 50 từ.

      [CƠ CHẾ PHẢN HỒI & SỬA LỖI]
      Bước 1: Trả lời hội thoại bình thường (nhập vai).
      Bước 2: Xuống dòng. Nếu người dùng dùng từ đúng, hãy khen (VD: <Check/> Good job using 'apple'!).
      Bước 3: Nếu người dùng sai ngữ pháp hoặc dùng từ chưa hay, hãy sửa lỗi nhẹ nhàng trong ngoặc đơn.
      
      Ví dụ định dạng trả lời:
      "Here is your steak. Do you want some **sauce** with it?"
      (<Check/> Good job! Sửa lỗi nhỏ: "I want eat" -> "I want to eat")

      [YÊU CẦU TRẢ LỜI]
      1. Trả lời hội thoại tự nhiên.
      2. Sửa lỗi ngữ pháp nếu có (trong ngoặc đơn).
      
      [QUAN TRỌNG - GỢI Ý TRẢ LỜI]
      Ở cuối cùng của phản hồi, hãy đưa ra 3 gợi ý ngắn gọn (dưới 10 từ) bằng tiếng Anh để người dùng có thể dùng để trả lời lại bạn.
      Hãy đặt chúng trong dấu ngoặc vuông, ngăn cách bởi dấu gạch đứng.
      Ví dụ định dạng: 
      "Hello there! [Hi, nice to meet you | Hello, how are you? | Good morning]"
    `;

    const processedHistory = history
      .filter((msg) => msg && msg.content && msg.content.trim() !== '')
      .slice(-6)
      .map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

    // Thêm tin nhắn mới nhất kèm System Prompt để AI luôn nhớ nhiệm vụ
    processedHistory.push({
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nUser: ${userMessage}` }],
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: processedHistory }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini Error:', JSON.stringify(data));
      throw new Error(data.error?.message || 'Lỗi API AI');
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText) throw new Error('AI không phản hồi.');

    res.json({ reply: replyText });
  } catch (error) {
    console.error('Chat Controller Error:', error);
    res.status(500).json({ message: 'Lỗi: ' + error.message });
  }
};
