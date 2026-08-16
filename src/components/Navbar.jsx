import React, { useState } from 'react';
import { Gift, CalendarCheck, Heart, Sparkles, Menu, X, Shield, MessageCircleHeart, Share2 } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenAdmin, totalGiftsAvailable }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'inicio', label: 'Início', icon: Sparkles },
    { id: 'presentes', label: 'Lista de Presentes', icon: Gift, badge: totalGiftsAvailable },
    { id: 'rsvp', label: 'Confirmar Presença', icon: CalendarCheck },
    { id: 'recados', label: 'Mural de Amor', icon: MessageCircleHeart },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getShareUrl = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `Olá! Veja o convite e lista de presentes do Chá de Bebê da Maitê: ${currentUrl}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-blush-100 shadow-sm transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo / Title */}
          <button 
            onClick={() => handleNavClick('inicio')}
            className="flex items-center gap-2.5 text-left group transition"
          >
            <div className="w-10 h-10 rounded-full bg-blush-100 flex items-center justify-center text-blush-600 group-hover:scale-110 transition shadow-inner">
              <span className="text-xl">🌸</span>
            </div>
            <div>
              <span className="font-handwriting text-2xl sm:text-3xl text-blush-600 tracking-wide block leading-none">
                Chá da Maitê
              </span>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium block mt-0.5">
                Leonardo & Isabella
              </span>
            </div>
          </button>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blush-500 text-white shadow-md shadow-blush-500/20'
                      : 'text-slate-600 hover:text-blush-600 hover:bg-blush-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blush-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white text-blush-600' : 'bg-blush-100 text-blush-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="h-6 w-px bg-slate-200 mx-1.5" />

            {/* Social Share WhatsApp Button */}
            <a
              href={getShareUrl()}
              target="_blank"
              rel="noopener noreferrer"
              title="Compartilhar Convite no WhatsApp"
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Compartilhar</span>
            </a>

            {/* Admin Trigger */}
            <button
              onClick={onOpenAdmin}
              title="Área dos Papais (Leonardo & Isabella)"
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition border border-slate-200"
            >
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>Papais</span>
            </button>
          </nav>

          {/* Mobile Menu Buttons */}
          <div className="flex md:hidden items-center gap-2">
            <a
              href={getShareUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full text-emerald-600 bg-emerald-50 border border-emerald-100"
              title="Compartilhar no WhatsApp"
            >
              <Share2 className="w-4 h-4" />
            </a>

            <button
              onClick={onOpenAdmin}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 bg-slate-50"
              title="Admin"
            >
              <Shield className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-blush-50 focus:outline-none transition"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-blush-600" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 border-b border-blush-100 px-4 pt-2 pb-5 space-y-1 shadow-lg animate-fade-in">
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
                    : 'text-slate-700 hover:bg-blush-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blush-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white text-blush-600' : 'bg-blush-100 text-blush-700'
                  }`}>
                    {item.badge} itens
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-100 mt-2">
            <a
              href={getShareUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 transition"
            >
              <Share2 className="w-4 h-4" />
              <span>Compartilhar Convite no WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
