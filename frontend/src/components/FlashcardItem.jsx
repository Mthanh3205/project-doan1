import React, { useState, useEffect } from 'react';

export default function FlashcardItem({
  card,
  isEditing,
  onEditClick,
  onCancel,
  onSave,
  onDelete,
}) {
  // State (trạng thái) để lưu dữ liệu của form chỉnh sửa
  const [formData, setFormData] = useState({
    front_text: card.front_text,
    back_text: card.back_text,
    example: card.example,
    pronunciation: card.pronunciation,
  });

  // Cập nhật lại form data nếu 'card' prop thay đổi
  useEffect(() => {
    setFormData({
      front_text: card.front_text,
      back_text: card.back_text,
      example: card.example,
      pronunciation: card.pronunciation || '',
    });
  }, [card]);

  // Xử lý khi gõ vào ô input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý khi nhấn nút "Lưu"
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(card.card_id, formData); // Gọi hàm onSave được truyền từ cha
  };

  // GIAO DIỆN KHI CHỈNH SỬA
  if (isEditing) {
    return (
      <form
        onSubmit={handleSubmit}
        className="mx-3 rounded-md border bg-[#1d1d1d] p-4 text-zinc-300 shadow-sm dark:border-none dark:bg-white dark:text-stone-600"
      >
        <div className="mb-2">
          <label className="text-sm font-medium">Front:</label>
          <input
            type="text"
            name="front_text"
            value={formData.front_text}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-500 px-2 py-1 outline-none dark:border-stone-200"
          />
        </div>
        <div className="mb-2">
          <label className="text-sm font-medium">Back:</label>
          <input
            type="text"
            name="back_text"
            value={formData.back_text}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-500 px-2 py-1 outline-none dark:border-stone-200"
          />
        </div>
        <div className="mb-2">
          <label className="text-sm font-medium">Pronunciation:</label>
          <input
            type="text"
            name="pronunciation"
            value={formData.pronunciation}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-500 px-2 py-1 outline-none dark:border-stone-200"
          />
        </div>
        <div className="mb-2">
          <label className="text-sm font-medium">Example:</label>
          <textarea
            name="example"
            value={formData.example}
            onChange={handleChange}
            rows="2"
            className="mt-1 block w-full rounded-md border border-gray-500 px-2 py-1 outline-none dark:border-stone-200"
          ></textarea>
        </div>
        <div className="mt-4 space-x-2">
          <button
            type="submit"
            className="rounded-md bg-amber-400 px-3 py-1 text-sm text-stone-600 transition-all hover:scale-105 hover:bg-black hover:text-white dark:bg-green-200 dark:text-stone-600 dark:hover:bg-green-400 dark:hover:text-white"
          >
            Lưu
          </button>
          <button
            type="button"
            onClick={onCancel} // Gọi hàm onCancel được truyền từ cha
            className="rounded-md bg-gray-600 px-3 py-1 text-sm text-white transition-all hover:scale-105 hover:bg-black"
          >
            Hủy
          </button>
        </div>
      </form>
    );
  }

  // GIAO DIỆN KHI CHỈ HIỂN THỊ (Mặc định)
  return (
    <div className="mx-5 rounded-md bg-[#121212] p-4 text-zinc-300 shadow-sm dark:border-none dark:bg-green-100 dark:text-stone-600">
      <p>
        <strong>Front:</strong> {card.front_text}
      </p>
      <p>
        <strong>Back:</strong> {card.back_text}
      </p>
      {card.pronunciation && (
        <p>
          <strong>Pronunciation:</strong> {card.pronunciation}
        </p>
      )}
      <p>
        <strong>Example:</strong> {card.example}
      </p>
      <div className="mt-2 space-x-3">
        {/* Nút "Chỉnh sửa" sẽ kích hoạt onEditClick */}
        <button onClick={onEditClick} className="text-sm text-amber-400 hover:underline">
          Chỉnh sửa
        </button>
        {/* Nút "Xóa" sẽ kích hoạt onDelete */}
        <button
          onClick={() => {
            if (window.confirm(`Bạn có chắc muốn xóa từ "${card.front_text}"?`)) {
              onDelete(card.card_id);
            }
          }}
          className="text-sm text-red-500 hover:underline"
        >
          Xóa
        </button>
      </div>
    </div>
  );
}
