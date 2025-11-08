export default function AdminSettings() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Cài đặt</h1>
      <div className="max-w-2xl rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <form>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium" htmlFor="siteName">
              Tên Trang web
            </label>
            <input
              type="text"
              id="siteName"
              className="w-full rounded-md border p-2 dark:border-gray-700 dark:bg-gray-900"
              defaultValue="Flashcard App"
            />
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium" htmlFor="adminEmail">
              Email Quản trị
            </label>
            <input
              type="email"
              id="adminEmail"
              className="w-full rounded-md border p-2 dark:border-gray-700 dark:bg-gray-900"
              defaultValue="ad@admin.com"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Lưu thay đổi
          </button>
        </form>
      </div>
    </div>
  );
}
