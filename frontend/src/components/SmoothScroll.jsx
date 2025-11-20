import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import { useLocation } from 'react-router-dom';

const SmoothScroll = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/CreateVocabulary') {
      if (window.lenisInstance) {
        window.lenisInstance.destroy();
        window.lenisInstance = null;
      }
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      return;
    }

    // Reset overflow cho các route khác
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';

    // Khởi tạo Lenis
    const lenis = new Lenis({
      lerp: 0.03,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: true,
    });

    window.lenisInstance = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup khi unmount hoặc chuyển route
    return () => {
      if (lenis) {
        lenis.destroy();
        window.lenisInstance = null;
      }
    };
  }, [location.pathname]);

  return null;
};

export default SmoothScroll;
