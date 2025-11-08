import { useEffect } from 'react';

const AutoLogout = () => {
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Xóa token/session frontend
      localStorage.removeItem('token');

      // Gọi backend logout
      navigator.sendBeacon(
        'https://project-doan1-backend.onrender.com/api/logout',
        new Blob([JSON.stringify({ logout: true })], { type: 'application/json' })
      );
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return null;
};

export default AutoLogout;
