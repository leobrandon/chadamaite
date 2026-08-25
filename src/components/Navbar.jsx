import React, { useState, useEffect } from 'react';
import { Gift, CalendarCheck, Sparkles, Menu, X, Shield, MessageCircleHeart, Share2, Sun, Moon } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenAdmin, totalGiftsAvailable, isDark, onToggleDark }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems = [
    { id: 'inicio', label: 'Início', icon: Sparkles },
    { id: 'presentes', label: 'Lista de Presentes', icon: Gift, badge: totalGiftsAvailable },
    { id: 'rsvp', label: 'Confirmar Presença', icon: CalendarCheck },
    { id: 'recados', label: 'Mural de Amor', icon: MessageCircleHeart },
  ];

  // Monitorar rolagem para atualizar estilo e seção ativa
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);

      // Detectar qual seção está visível na tela
      const sections = ['inicio', 'presentes', 'rsvp', 'recados'];
      const scrollPosition = window.scrollY + 120;

      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionId = sections[i];
        const elem = document.getElementById(sectionId);
        if (elem) {
          const top = elem.offsetTop;
          if (scrollPosition >= top) {
            setActiveTab(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setActiveTab]);

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -75;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const getShareUrl = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `Olá! Veja o convite e lista de presentes do Chá de Bebê da Maitê: ${currentUrl}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  };

  return (
    <>
      {/* Header Fixo no Topo que acompanha toda a rolagem */}
      <header
        className={`fixed top-0 left-0 right-0 w-full z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md border-b border-blush-200/70 dark:border-slate-800 py-1 sm:py-1.5'
            : 'bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-blush-100 dark:border-slate-800/80 shadow-sm py-2 sm:py-2.5'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* Logo / Title */}
            <button 
              onClick={() => handleNavClick('inicio')}
              className="flex items-center gap-2.5 text-left group transition shrink-0 py-1 mr-3 lg:mr-8 focus:outline-none"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blush-100 dark:bg-blush-950/60 flex items-center justify-center text-blush-600 dark:text-blush-400 group-hover:scale-105 transition shadow-inner shrink-0 border border-blush-200/60 dark:border-blush-800/40">
                <span className="text-lg sm:text-xl">🌸</span>
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-serif text-base sm:text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-tight flex items-center gap-1 pr-1">
                  Chá da <span className="font-handwriting text-2xl sm:text-3xl text-blush-600 dark:text-blush-400 font-normal">Maitê</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-400 font-semibold leading-none mt-0.5">
                  Leonardo & Isabella
                </span>
              </div>
            </button>

            {/* Desktop Nav Items */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2 shrink-0">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-1.5 lg:gap-2 px-3 lg:px-3.5 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-blush-500 text-white shadow-md shadow-blush-500/25'
                        : 'text-slate-600 dark:text-slate-300 hover:text-blush-600 dark:hover:text-blush-300 hover:bg-blush-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 ${isActive ? 'text-white' : 'text-blush-400 dark:text-blush-400'}`} />
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`text-[10px] lg:text-xs px-1.5 lg:px-2 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-white text-blush-600' : 'bg-blush-100 text-blush-700 dark:bg-blush-950 dark:text-blush-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

              {/* Dark Mode Toggle */}
              <button
                onClick={onToggleDark}
                title={isDark ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
                className={`p-2 rounded-full transition border ${
                  isDark 
                    ? 'text-amber-300 bg-slate-800 border-slate-700 hover:bg-slate-700' 
                    : 'text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100 hover:text-blush-600'
                }`}
                aria-label={isDark ? 'Modo Claro' : 'Modo Escuro'}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>

              {/* Social Share WhatsApp Button */}
              <a
                href={getShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                title="Compartilhar Convite no WhatsApp"
                className="flex items-center gap-1.5 px-3 py-1.5 lg:py-2 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 transition whitespace-nowrap"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartilhar</span>
              </a>

              {/* Admin Trigger */}
              <button
                onClick={onOpenAdmin}
                title="Área dos Papais (Leonardo & Isabella)"
                className="flex items-center gap-1.5 px-3 py-1.5 lg:py-2 rounded-full text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-700 whitespace-nowrap"
              >
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>Papais</span>
              </button>
            </nav>

            {/* Mobile Menu Buttons */}
            <div className="flex md:hidden items-center gap-1.5">
              {/* Dark Mode Toggle (Mobile) */}
              <button
                onClick={onToggleDark}
                title={isDark ? 'Modo Claro' : 'Modo Escuro'}
                className={`p-2 rounded-full border transition ${
                  isDark
                    ? 'text-amber-300 bg-slate-800 border-slate-700'
                    : 'text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
                aria-label={isDark ? 'Modo Claro' : 'Modo Escuro'}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
              </button>

              <a
                href={getShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/60"
                title="Compartilhar no WhatsApp"
              >
                <Share2 className="w-4 h-4" />
              </a>

              <button
                onClick={onOpenAdmin}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                title="Admin"
              >
                <Shield className="w-4 h-4" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-blush-50 dark:hover:bg-slate-800 focus:outline-none transition"
                aria-label="Abrir menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-blush-600 dark:text-blush-400" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-slate-900/95 border-b border-blush-100 dark:border-slate-800 px-4 pt-2 pb-5 space-y-1 shadow-xl animate-fade-in backdrop-blur-md">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-blush-500 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-blush-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blush-500 dark:text-blush-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white text-blush-600' : 'bg-blush-100 dark:bg-blush-950 text-blush-700 dark:text-blush-300'
                    }`}>
                      {item.badge} itens
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
              <a
                href={getShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 transition"
              >
                <Share2 className="w-4 h-4" />
                <span>Compartilhar Convite no WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Espaçador de altura para compensar o header fixed */}
      <div className="h-16 sm:h-20 w-full" aria-hidden="true" />
    </>
  );
}
