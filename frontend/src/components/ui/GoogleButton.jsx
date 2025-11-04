import { useGoogleLogin } from '@react-oauth/google';
import { Chrome } from 'lucide-react'; // icon chrome (hoặc đổi icon khác)

export default function GoogleButton({ onSuccess }) {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log('Google token:', tokenResponse);

      // Lấy thông tin user từ Google API
      const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      }).then((res) => res.json());

      console.log('Google userInfo:', userInfo);

      // Trả userInfo về cho component cha (Auth.jsx)
      if (onSuccess) onSuccess(userInfo);
    },
    onError: () => console.log('Google login thất bại'),
  });

  return (
    <button
      onClick={login}
      className="group mx-auto mb-6 flex w-full max-w-sm transform items-center justify-center gap-3 rounded-xl border border-white/30 bg-white/10 bg-gradient-to-r px-4 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:shadow-xl dark:bg-green-100 dark:text-stone-600"
    >
      <Chrome className="h-5 w-5 transition-transform group-hover:scale-110" />
      Continue with Google
    </button>
  );
}
