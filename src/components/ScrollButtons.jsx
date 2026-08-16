import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function ScrollButtons() {
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // Show top button when scrolled down > 200px
      setShowTop(scrollY > 200);

      // Show bottom button when not near the very bottom
      setShowBottom(scrollY + windowHeight < docHeight - 150);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    <aside aria-label="Navegação rápida de rolagem" className="fixed bottom-6 right-5 z-40 flex flex-col gap-2 pointer-events-auto">
      {/* Scroll to Top */}
      <button
        onClick={scrollToTop}
        title="Subir até o início"
        aria-label="Subir até o início da página"
        className={`w-11 h-11 rounded-full bg-white/90 hover:bg-blush-500 text-slate-700 hover:text-white border border-blush-200 shadow-lg backdrop-blur-md flex items-center justify-center transition-all duration-300 transform active:scale-90 ${
          showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <ChevronUp className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* Scroll to Bottom */}
      <button
        onClick={scrollToBottom}
        title="Descer até o fim da página"
        aria-label="Descer até o final da página"
        className={`w-11 h-11 rounded-full bg-white/90 hover:bg-blush-500 text-slate-700 hover:text-white border border-blush-200 shadow-lg backdrop-blur-md flex items-center justify-center transition-all duration-300 transform active:scale-90 ${
          showBottom ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <ChevronDown className="w-5 h-5 stroke-[2.5]" />
      </button>
    </aside>
  );
}
