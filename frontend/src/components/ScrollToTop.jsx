import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    console.log('🔄 [ScrollToTop] Route changed to:', pathname);

    const tryScrollToTop = () => {
      const lenis = window.lenisInstance;

      if (lenis && typeof lenis.scrollTo === 'function') {
        console.log('✅ [ScrollToTop] Lenis instance found, scrolling to top...');
        lenis.scrollTo(0, { immediate: true });
        setTimeout(() => window.scrollTo(0, 0), 50);
        return true;
      } else {
        console.log('⚠️ [ScrollToTop] Lenis not ready, using window.scrollTo');
        window.scrollTo({ top: 0, behavior: 'instant' });
        return false;
      }
    };

    // Thử cuộn ngay lập tức
    if (!tryScrollToTop()) {
      let retries = 0;
      const interval = setInterval(() => {
        retries++;
        console.log(`⏳ [ScrollToTop] Retrying (${retries})...`);
        if (tryScrollToTop() || retries > 10) {
          clearInterval(interval);
          console.log('🧹 [ScrollToTop] Done retrying.');
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [pathname]);

  return null;
}

export default ScrollToTop;
