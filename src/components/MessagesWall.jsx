import React, { useState, useMemo, useEffect } from 'react';
import { MessageCircleHeart, Heart, Send, ChevronLeft, ChevronRight, Search, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const MESSAGES_PER_PAGE = 6; // 6 cards per page (2 rows of 3 on desktop, 3 rows of 2 on tablet, 6 rows of 1 on mobile)

export default function MessagesWall({ messages = [], onAddMessage, onLikeMessage }) {
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

  const safeMessages = Array.isArray(messages) ? messages : [];
  
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

  // Ajusta página atual se ultrapassar o total
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Mensagens da página atual
  const paginatedMessages = useMemo(() => {
    const startIdx = (currentPage - 1) * MESSAGES_PER_PAGE;
    return filteredMessages.slice(startIdx, startIdx + MESSAGES_PER_PAGE);
  }, [filteredMessages, currentPage]);

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

      // Efeito sutil de confetezinho/corações quando curte
      confetti({
        particleCount: 15,
        spread: 40,
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
      setTimeout(() => setShowPendingAlert(false), 6000);
    }, 300);
  };

  return (
    <section id="recados" className="py-16 md:py-20 bg-white/50 border-t border-blush-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blush-100/80 text-blush-700 text-xs font-bold uppercase tracking-wider mb-3">
            <MessageCircleHeart className="w-3.5 h-3.5" />
            <span>Mural de Amor</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
            Recadinhos para a Maitê
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Deixe uma mensagem cheia de boas energias para a nossa pequena e para os papais.
          </p>
        </div>

        {/* Input Card */}
        <div className="glass-card max-w-2xl mx-auto p-6 sm:p-7 rounded-3xl mb-12 shadow-sm border border-blush-200/80">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                maxLength={80}
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Seu nome (ex: Titia Jéssica)"
                className="flex-1 px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-blush-400 focus:ring-2 focus:ring-blush-100 outline-none text-base sm:text-sm transition"
              />
            </div>
            <textarea
              rows="3"
              maxLength={500}
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escreva seu recadinho de carinho..."
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-blush-400 focus:ring-2 focus:ring-blush-100 outline-none text-base sm:text-sm transition resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !text.trim()}
                className="px-6 py-3 rounded-full bg-blush-500 hover:bg-blush-600 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-blush-500/20 disabled:opacity-50 transition flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Publicando...' : 'Publicar Recado'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Feedback Alert for Pending Approval */}
        {showPendingAlert && (
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm text-center animate-fade-in shadow-sm flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Obrigado pelo carinho!</strong> Seu recado foi enviado e será exibido no mural assim que os papais aprovarem. 💖</span>
          </div>
        )}

        {/* Messages Header & Search Bar (quando houver várias mensagens) */}
        {approvedMessages.length > 0 && (
          <div id="recados-grid" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">
                Mural de Recados
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blush-100 text-blush-700 font-bold text-xs">
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
                  placeholder="Buscar recados..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs outline-none focus:border-blush-400 focus:ring-1 focus:ring-blush-100 transition text-slate-700"
                />
              </div>
            )}
          </div>
        )}

        {/* Messages Grid */}
        {paginatedMessages.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {paginatedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="glass-card p-5 rounded-3xl border border-blush-100/90 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-blush-200 transition bg-white/80 backdrop-blur-xs min-h-[170px]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-7 h-7 rounded-full bg-blush-100 text-blush-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {(msg.author || 'A').charAt(0).toUpperCase()}
                        </span>
                        <span className="font-bold text-slate-800 text-sm truncate">
                          {msg.author}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0 ml-2">
                        {msg.date || 'Recente'}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line italic">
                      "{msg.text}"
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Com muito amor ✨</span>
                    {(() => {
                      const isLiked = likedMessageIds.includes(msg.id);
                      return (
                        <button
                          type="button"
                          onClick={() => handleToggleLike(msg.id)}
                          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold transition cursor-pointer active:scale-90 shadow-xs ${
                            isLiked
                              ? 'bg-blush-500 text-white shadow-blush-500/25 ring-2 ring-blush-200'
                              : 'bg-blush-50 text-blush-600 hover:bg-blush-100 hover:text-blush-700'
                          }`}
                          title={isLiked ? 'Você curtiu este recado (clique para remover)' : 'Curtir recadinho'}
                          aria-label={isLiked ? 'Você curtiu este recado (clique para remover)' : 'Curtir recadinho'}
                        >
                          <Heart className={`w-3.5 h-3.5 transition-transform duration-200 ${isLiked ? 'fill-white text-white scale-110' : 'fill-blush-400 text-blush-400'}`} />
                          <span className="tabular-nums">{msg.likes || 0}</span>
                        </button>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-blush-100">
                <p className="text-xs text-slate-500 order-2 sm:order-1">
                  Mostrando {((currentPage - 1) * MESSAGES_PER_PAGE) + 1} - {Math.min(currentPage * MESSAGES_PER_PAGE, filteredMessages.length)} de {filteredMessages.length} recados
                </p>

                <div className="flex items-center gap-1.5 order-1 sm:order-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-blush-50 hover:text-blush-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-600 transition shadow-xs min-h-[38px] min-w-[38px] flex items-center justify-center"
                    aria-label="Página anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Dynamic Page Buttons */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        // Mostra primeira, última, e páginas próximas da atual
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, index, arr) => {
                        const showEllipsisBefore = index > 0 && page - arr[index - 1] > 1;

                        return (
                          <React.Fragment key={page}>
                            {showEllipsisBefore && (
                              <span className="px-1 text-slate-400 text-xs select-none">...</span>
                            )}
                            <button
                              type="button"
                              onClick={() => handlePageChange(page)}
                              className={`w-9 h-9 rounded-xl text-xs font-bold transition flex items-center justify-center shadow-xs ${
                                currentPage === page
                                  ? 'bg-blush-500 text-white shadow-blush-500/20'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-blush-50 hover:text-blush-600'
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
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-blush-50 hover:text-blush-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-600 transition shadow-xs min-h-[38px] min-w-[38px] flex items-center justify-center"
                    aria-label="Próxima página"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-sm glass-card rounded-3xl p-6">
            {searchQuery ? (
              <p>Nenhum recado encontrado para "{searchQuery}".</p>
            ) : (
              <p>Seja o primeiro a deixar um recadinho carinhoso! 💌</p>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
