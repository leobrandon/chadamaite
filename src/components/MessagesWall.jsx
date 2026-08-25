import React, { useState, useMemo } from 'react';
import { MessageCircleHeart, Send, ChevronLeft, ChevronRight, Search, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { formatRelativeOrExactDate } from '../utils/dateUtils';
import HeartBurstButton from './ui/HeartBurstButton';
import { useToast } from './ui/ToastProvider';
import CloudHeadingReveal from './ui/CloudHeadingReveal';

const MESSAGES_PER_PAGE = 6; // 6 cards per page (2 rows of 3 on desktop, 3 rows of 2 on tablet, 6 rows of 1 on mobile)

// Paleta suave e acolhedora de cartões de recado (estilo mural de chá de bebê com suporte completo a tema claro e escuro)
const CARD_THEMES = [
  {
    bg: 'bg-gradient-to-br from-rose-50/90 via-blush-50/60 to-white border-rose-200/80 dark:from-rose-950/40 dark:via-slate-800/90 dark:to-slate-900/95 dark:border-rose-900/40',
    avatarBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/90 dark:text-rose-300 dark:border dark:border-rose-800/50',
    tapeBg: 'bg-rose-200/60 dark:bg-rose-800/40',
    badgeText: 'text-rose-500 dark:text-rose-400',
  },
  {
    bg: 'bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-white border-amber-200/80 dark:from-amber-950/40 dark:via-slate-800/90 dark:to-slate-900/95 dark:border-amber-900/40',
    avatarBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/90 dark:text-amber-300 dark:border dark:border-amber-800/50',
    tapeBg: 'bg-amber-200/60 dark:bg-amber-800/40',
    badgeText: 'text-amber-600 dark:text-amber-400',
  },
  {
    bg: 'bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white border-emerald-200/80 dark:from-emerald-950/40 dark:via-slate-800/90 dark:to-slate-900/95 dark:border-emerald-900/40',
    avatarBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-300 dark:border dark:border-emerald-800/50',
    tapeBg: 'bg-emerald-200/60 dark:bg-emerald-800/40',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    bg: 'bg-gradient-to-br from-purple-50/90 via-pink-50/50 to-white border-purple-200/80 dark:from-purple-950/40 dark:via-slate-800/90 dark:to-slate-900/95 dark:border-purple-900/40',
    avatarBg: 'bg-purple-100 text-purple-800 dark:bg-purple-950/90 dark:text-purple-300 dark:border dark:border-purple-800/50',
    tapeBg: 'bg-purple-200/60 dark:bg-purple-800/40',
    badgeText: 'text-purple-600 dark:text-purple-400',
  },
  {
    bg: 'bg-gradient-to-br from-sky-50/90 via-blue-50/50 to-white border-sky-200/80 dark:from-sky-950/40 dark:via-slate-800/90 dark:to-slate-900/95 dark:border-sky-900/40',
    avatarBg: 'bg-sky-100 text-sky-800 dark:bg-sky-950/90 dark:text-sky-300 dark:border dark:border-sky-800/50',
    tapeBg: 'bg-sky-200/60 dark:bg-sky-800/40',
    badgeText: 'text-sky-600 dark:text-sky-400',
  },
  {
    bg: 'bg-gradient-to-br from-pink-50/90 via-rose-50/60 to-white border-pink-200/80 dark:from-pink-950/40 dark:via-slate-800/90 dark:to-slate-900/95 dark:border-pink-900/40',
    avatarBg: 'bg-pink-100 text-pink-700 dark:bg-pink-950/90 dark:text-pink-300 dark:border dark:border-pink-800/50',
    tapeBg: 'bg-pink-200/60 dark:bg-pink-800/40',
    badgeText: 'text-pink-600 dark:text-pink-400',
  },
];

export default function MessagesWall({ messages = [], onAddMessage, onLikeMessage }) {
  const { addToast } = useToast();
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPendingAlert, setShowPendingAlert] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Persistência local das mensagens que o usuário já curtiu
  const [likedMessageIds, setLikedMessageIds] = useState(() => {
    try {
      const stored = localStorage.getItem('cha_maite_liked_messages_ids');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const safeMessages = useMemo(() => Array.isArray(messages) ? messages : [], [messages]);
  
  // Apenas mensagens aprovadas
  const approvedMessages = useMemo(() => {
    return safeMessages.filter(m => m && m.status === 'approved');
  }, [safeMessages]);

  // Mensagens filtradas pela busca
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return approvedMessages;
    const q = searchQuery.toLowerCase();
    return approvedMessages.filter(
      m => (m.author || '').toLowerCase().includes(q) || (m.text || '').toLowerCase().includes(q)
    );
  }, [approvedMessages, searchQuery]);

  // Total de páginas
  const totalPages = Math.max(1, Math.ceil(filteredMessages.length / MESSAGES_PER_PAGE));

  // Clamped current page
  const activePage = Math.min(currentPage, totalPages);

  // Mensagens da página atual
  const paginatedMessages = useMemo(() => {
    const startIdx = (activePage - 1) * MESSAGES_PER_PAGE;
    return filteredMessages.slice(startIdx, startIdx + MESSAGES_PER_PAGE);
  }, [filteredMessages, activePage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Rola suavemente até o início do mural se o usuário estiver muito abaixo
      const wallElement = document.getElementById('recados-grid');
      if (wallElement) {
        wallElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const handleToggleLike = (msgId) => {
    const isAlreadyLiked = likedMessageIds.includes(msgId);
    let updatedLikes;
    if (isAlreadyLiked) {
      // Remove curtida (-1)
      updatedLikes = likedMessageIds.filter(id => id !== msgId);
      setLikedMessageIds(updatedLikes);
      try {
        localStorage.setItem('cha_maite_liked_messages_ids', JSON.stringify(updatedLikes));
      } catch (err) {
        console.error('Erro ao salvar curtidas locais:', err);
      }
      onLikeMessage(msgId, -1);
    } else {
      // Adiciona curtida única (+1)
      updatedLikes = [...likedMessageIds, msgId];
      setLikedMessageIds(updatedLikes);
      try {
        localStorage.setItem('cha_maite_liked_messages_ids', JSON.stringify(updatedLikes));
      } catch (err) {
        console.error('Erro ao salvar curtidas locais:', err);
      }
      onLikeMessage(msgId, 1);
      addToast({ message: 'Recado curtido com muito amor! 💕', type: 'heart' });

      // Efeito sutil de confetezinho/corações quando curte
      confetti({
        particleCount: 18,
        spread: 45,
        origin: { y: 0.8 },
        colors: ['#f7799e', '#fcaec4', '#ffd6e1']
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#f7799e', '#fcaec4', '#ffd6e1']
    });

    setTimeout(() => {
      onAddMessage({
        author: author.trim() || 'Amigo com carinho',
        text: text.trim(),
      });
      setAuthor('');
      setText('');
      setIsSubmitting(false);
      setShowPendingAlert(true);
      addToast({ message: 'Recadinho enviado com sucesso! ✨', type: 'sparkle' });
      setTimeout(() => setShowPendingAlert(false), 7000);
    }, 300);
  };

  const textRemaining = 500 - text.length;

  return (
    <section id="recados" className="py-16 md:py-20 bg-white/50 dark:bg-slate-900/50 border-t border-blush-100 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Header with Cloud Carousel Reveal */}
        <CloudHeadingReveal
          badge="Mural de Amor"
          badgeIcon={MessageCircleHeart}
          title="Recadinhos para"
          highlight="a Maitê 💕"
          subtitle="Deixe uma mensagem cheia de boas energias para a nossa pequena e para os papais."
          className="text-center max-w-xl mx-auto mb-10"
        />

        {/* Input Card with Character Counter */}
        <div className="glass-card max-w-2xl mx-auto p-6 sm:p-7 rounded-3xl mb-12 shadow-sm border border-blush-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Seu Nome ou Família:
                </label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {author.length}/80
                </span>
              </div>
              <input
                type="text"
                maxLength={80}
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Ex: Titia Jéssica / Família Silva"
                className="w-full px-4 py-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blush-400 focus:ring-2 focus:ring-blush-100 dark:focus:ring-blush-950 outline-none text-base sm:text-sm transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Seu Recado de Carinho: <span className="text-rose-500">*</span>
                </label>
                <span className={`text-[11px] font-medium transition ${
                  textRemaining < 50
                    ? 'text-rose-600 dark:text-rose-400 font-bold'
                    : textRemaining < 150
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {textRemaining} {textRemaining === 1 ? 'caractere restante' : 'caracteres restantes'}
                </span>
              </div>
              <textarea
                rows="3"
                maxLength={500}
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escreva sua mensagem cheia de afeto para a Maitê..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blush-400 focus:ring-2 focus:ring-blush-100 dark:focus:ring-blush-950 outline-none text-base sm:text-sm transition resize-none leading-relaxed"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 order-2 sm:order-1 text-center sm:text-left">
                ✨ Seu recado será publicado após rápida aprovação dos papais.
              </p>
              <button
                type="submit"
                disabled={isSubmitting || !text.trim()}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-blush-500 hover:bg-blush-600 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-blush-500/20 disabled:opacity-50 transition flex items-center justify-center gap-2 order-1 sm:order-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Publicando...' : 'Publicar Recado 💕'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Feedback Alert for Pending Approval */}
        {showPendingAlert && (
          <div className="max-w-2xl mx-auto mb-8 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm animate-fade-in shadow-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-emerald-950 dark:text-emerald-100">Recado enviado com sucesso! 💖</p>
              <p className="text-emerald-800 dark:text-emerald-300 text-xs mt-0.5">
                Muito obrigado pelo carinho! Ele será exibido no mural de cartões assim que os papais aprovarem.
              </p>
            </div>
          </div>
        )}

        {/* Messages Header & Search Bar */}
        {approvedMessages.length > 0 && (
          <div id="recados-grid" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Mural de Cartões de Carinho
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blush-100 dark:bg-blush-950/80 dark:border dark:border-blush-800/40 text-blush-700 dark:text-blush-300 font-bold text-xs">
                {approvedMessages.length} {approvedMessages.length === 1 ? 'recado' : 'recados'}
              </span>
            </div>

            {approvedMessages.length > 6 && (
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Buscar recados por nome..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs outline-none focus:border-blush-400 focus:ring-1 focus:ring-blush-100 dark:focus:ring-blush-950 transition"
                />
              </div>
            )}
          </div>
        )}

        {/* Messages Cards Grid (Mural de Cartões de Carinho) */}
        {paginatedMessages.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedMessages.map((msg, index) => {
                const theme = CARD_THEMES[index % CARD_THEMES.length];
                const isLiked = likedMessageIds.includes(msg.id);
                const displayDate = formatRelativeOrExactDate(msg.date, msg.createdAt);

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.2) }}
                    className="h-full"
                  >
                    <div
                      className={`relative p-5 sm:p-6 rounded-3xl border shadow-xs flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg hover:shadow-blush-500/10 hover:border-blush-300 dark:hover:border-blush-700/80 transition-all duration-200 ease-out min-h-[190px] h-full ${theme.bg}`}
                    >
                      {/* Delicate tape badge at top */}
                      <div className={`w-12 h-2.5 rounded-full ${theme.tapeBg} absolute -top-1.5 left-1/2 -translate-x-1/2 shadow-2xs border border-white/60 dark:border-white/10`} />

                      <div>
                        {/* Author Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`w-8 h-8 rounded-full ${theme.avatarBg} flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}>
                              {(msg.author || 'A').charAt(0).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate block">
                                {msg.author}
                              </span>
                              {displayDate && (
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                                  {displayDate}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-lg select-none">💌</span>
                        </div>

                        {/* Message Body */}
                        <div className="relative pt-1">
                          <p className="text-slate-700 dark:text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-normal">
                            "{msg.text}"
                          </p>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                        <span className={`text-[11px] font-semibold ${theme.badgeText} flex items-center gap-1`}>
                          <Sparkles className="w-3 h-3" />
                          <span>Com amor</span>
                        </span>

                        <HeartBurstButton
                          isLiked={isLiked}
                          likesCount={msg.likes}
                          onClick={() => handleToggleLike(msg.id)}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-blush-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 order-2 sm:order-1">
                  Mostrando {((activePage - 1) * MESSAGES_PER_PAGE) + 1} - {Math.min(activePage * MESSAGES_PER_PAGE, filteredMessages.length)} de {filteredMessages.length} recados
                </p>

                <div className="flex items-center gap-1.5 order-1 sm:order-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(activePage - 1)}
                    disabled={activePage === 1}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blush-50 dark:hover:bg-slate-700 hover:text-blush-600 dark:hover:text-blush-300 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-800 disabled:hover:text-slate-600 dark:disabled:hover:text-slate-300 transition shadow-xs min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
                    aria-label="Página anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Dynamic Page Buttons */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - activePage) <= 1
                        );
                      })
                      .map((page, index, arr) => {
                        const showEllipsisBefore = index > 0 && page - arr[index - 1] > 1;

                        return (
                          <React.Fragment key={page}>
                            {showEllipsisBefore && (
                              <span className="px-1 text-slate-400 dark:text-slate-500 text-xs select-none">...</span>
                            )}
                            <button
                              type="button"
                              onClick={() => handlePageChange(page)}
                              className={`w-9 h-9 rounded-xl text-xs font-bold transition flex items-center justify-center shadow-xs cursor-pointer ${
                                activePage === page
                                  ? 'bg-blush-500 text-white shadow-blush-500/20'
                                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blush-50 dark:hover:bg-slate-700 hover:text-blush-600 dark:hover:text-blush-300'
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePageChange(activePage + 1)}
                    disabled={activePage === totalPages}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blush-50 dark:hover:bg-slate-700 hover:text-blush-600 dark:hover:text-blush-300 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-800 disabled:hover:text-slate-600 dark:disabled:hover:text-slate-300 transition shadow-xs min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
                    aria-label="Próxima página"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm glass-card rounded-3xl p-6 dark:bg-slate-800/60 dark:border-slate-700/60">
            {searchQuery ? (
              <p>Nenhum recado encontrado para "{searchQuery}".</p>
            ) : (
              <p>Seja o primeiro a deixar um recadinho carinhoso para a Maitê! 💕</p>
            )}
          </div>
        )}

      </div>
    </section>
  );
}

