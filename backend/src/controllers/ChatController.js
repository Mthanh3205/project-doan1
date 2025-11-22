import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

// Cấu hình OpenAI (hoặc thay bằng Gemini SDK)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Nhớ thêm key vào file .env
});

export const chatRoleplay = async (req, res) => {
  try {
    const { userMessage, history, targetWords, topicTitle } = req.body;

    // 1. TẠO SYSTEM PROMPT (Cực kỳ quan trọng)
    // Đây là lệnh để biến AI thành nhân vật bạn muốn
    const systemPrompt = `
      Bạn là một trợ lý học tiếng Anh AI. 
      Chế độ hiện tại: ROLEPLAY (Nhập vai).
      
      Bối cảnh: Người dùng đang học bộ từ vựng chủ đề: "${topicTitle}".
      Danh sách từ cần luyện: [${targetWords.join(', ')}].
      
      Nhiệm vụ của bạn:
      1. Đóng vai một nhân vật phù hợp với chủ đề (Ví dụ: Chủ đề "Nhà hàng" -> Bạn là Bồi bàn. "Du lịch" -> Bạn là Hướng dẫn viên).
      2. Trò chuyện tự nhiên, ngắn gọn (dưới 50 từ) để người dùng dễ trả lời.
      3. KHUYẾN KHÍCH người dùng sử dụng các từ trong danh sách.
      4. Nếu người dùng sai ngữ pháp nghiêm trọng, hãy sửa lỗi khéo léo ở cuối câu (trong ngoặc đơn).
      5. Đừng chỉ làm một giáo viên, hãy nhập vai thật sâu (Acting).
    `;

    // 2. Gửi yêu cầu đến AI
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...history, // Lịch sử chat cũ để AI nhớ ngữ cảnh
        { role: 'user', content: userMessage },
      ],
      model: 'gpt-3.5-turbo', // Hoặc gpt-4o-mini cho rẻ
    });

    const aiReply = completion.choices[0].message.content;

    res.json({ reply: aiReply });
  } catch (error) {
    console.error('Lỗi AI:', error);
    res.status(500).json({ message: 'AI đang bận, thử lại sau nhé!' });
  }
};
