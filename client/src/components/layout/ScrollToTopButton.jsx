import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FiChevronUp } from 'react-icons/fi';

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 260);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [location.pathname]);

  if (!visible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-4 md:bottom-8 md:right-6 z-40 inline-flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full bg-[#3B613A] text-white shadow-lg shadow-[#3B613A]/30 hover:bg-[#4a7549] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B613A]"
      aria-label="Scroll to top"
    >
      <FiChevronUp className="w-5 h-5" />
    </button>
  );
}

