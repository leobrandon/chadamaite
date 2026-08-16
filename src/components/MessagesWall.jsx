import React, { useState } from 'react';
import { MessageCircleHeart, Heart, Send, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MessagesWall({ messages, onAddMessage, onLikeMessage }) {
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPendingAlert, setShowPendingAlert] = useState(false);

  const safeMessages = Array.isArray(messages) ? messages : [];
  const approvedMessages = safeMessages.filter(m => m && m.status === 'approved');

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
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Seu nome (ex: Titia Jéssica)"
                className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blush-400 focus:ring-2 focus:ring-blush-100 outline-none text-sm transition"
              />
            </div>
            <textarea
              rows="3"
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escreva seu recadinho de carinho..."
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-blush-400 focus:ring-2 focus:ring-blush-100 outline-none text-sm transition resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !text.trim()}
                className="px-6 py-2.5 rounded-full bg-blush-500 hover:bg-blush-600 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-blush-500/20 disabled:opacity-50 transition flex items-center gap-2"
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
            <span>✨</span>
            <span><strong>Obrigado pelo carinho!</strong> Seu recado foi enviado e será exibido no mural assim que os papais aprovarem. 💖</span>
          </div>
        )}

        {/* Messages Masonry/Grid */}
        {approvedMessages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {approvedMessages.map((msg) => (
              <div
                key={msg.id}
                className="glass-card p-5 rounded-3xl border border-blush-100/90 shadow-sm flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-800 text-sm">
                      {msg.author}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {msg.date || 'Recente'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line italic">
                    "{msg.text}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Com muito amor ✨</span>
                  <button
                    onClick={() => onLikeMessage(msg.id)}
                    className="flex items-center gap-1.5 text-xs text-blush-600 hover:text-blush-700 bg-blush-50 hover:bg-blush-100 px-2.5 py-1 rounded-full font-medium transition"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>{msg.likes || 0}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400 text-sm">
            Seja o primeiro a deixar um recadinho carinhoso! 💌
          </div>
        )}

      </div>
    </section>
  );
}
