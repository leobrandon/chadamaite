import React, { useState } from 'react';
import { CalendarCheck, Users, Send, Smile } from 'lucide-react';
import confetti from 'canvas-confetti';
import GiftSuggestModal from './GiftSuggestModal';
import { formatPhone, handlePhoneKeyDown } from '../utils/phoneMask';
import SuccessCelebration from './ui/SuccessCelebration';
import ShimmerButton from './ui/ShimmerButton';
import { useToast } from './ui/ToastProvider';
import CloudHeadingReveal from './ui/CloudHeadingReveal';

export default function RSVPSection({ config, onSaveRSVP, gifts = [], pledges = [], onSelectGift }) {
  const { addToast } = useToast();
  const [attending, setAttending] = useState(true);
  const [name, setName] = useState('');
  const [adultsCount, setAdultsCount] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [companionNames, setCompanionNames] = useState([]);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGiftSuggest, setShowGiftSuggest] = useState(false);

  // Sync companion fields with total people
  const handleAdultsChange = (delta) => {
    const nextVal = Math.max(1, adultsCount + delta);
    setAdultsCount(nextVal);
    updateCompanionList(nextVal, childrenCount);
  };

  const handleChildrenChange = (delta) => {
    const nextVal = Math.max(0, childrenCount + delta);
    setChildrenCount(nextVal);
    updateCompanionList(adultsCount, nextVal);
  };

  const updateCompanionList = (adults, children) => {
    const totalPeople = adults + children;
    const requiredCompanions = Math.max(0, totalPeople - 1); // first one is the main guest
    setCompanionNames(prev => {
      const next = [...prev];
      while (next.length < requiredCompanions) next.push('');
      return next.slice(0, requiredCompanions);
    });
  };

  const handleCompanionNameChange = (index, value) => {
    const next = [...companionNames];
    next[index] = value;
    setCompanionNames(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (attending) {
      const isAnyCompanionEmpty = companionNames.some(n => !n.trim());
      if (isAnyCompanionEmpty) {
        addToast({ message: 'Por favor, preencha o nome de todos os acompanhantes.', type: 'info' });
        return;
      }
    }

    setIsSubmitting(true);

    const rsvpData = {
      name: name.trim(),
      attending,
      adultsCount: attending ? adultsCount : 0,
      childrenCount: attending ? childrenCount : 0,
      companionNames: attending ? companionNames.map(n => n.trim()) : [],
      phone: formatPhone(phone),
      message: message.trim(),
    };

    if (attending) {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f7799e', '#eed86a', '#7fa382', '#a7c3a9', '#fcaec4']
        });
      } catch {
        // ignore confetti errors
      }
    }

    try {
      await onSaveRSVP(rsvpData);
      addToast({ 
        message: attending ? 'Presença confirmada com sucesso! 🎉' : 'Resposta registrada com sucesso! 💖', 
        type: 'success' 
      });
    } catch (err) {
      console.error('Erro ao enviar RSVP:', err);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  const handleReset = () => {
    setName('');
    setAdultsCount(1);
    setChildrenCount(0);
    setCompanionNames([]);
    setPhone('');
    setMessage('');
    setIsSubmitted(false);
    setShowGiftSuggest(false);
  };

  return (
    <section id="rsvp" className="py-16 md:py-24 bg-gradient-to-b from-transparent via-blush-50/50 to-transparent relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Section Header with Cloud Reveal */}
        <CloudHeadingReveal
          badge="Confirmação de Presença"
          badgeIcon={CalendarCheck}
          title="Você vai ao"
          highlight="Chá da Maitê? 🌸"
          subtitle="Por favor, confirme sua presença para organizarmos tudo com muito amor e conforto para você e sua família!"
          className="text-center max-w-xl mx-auto mb-10"
        />

        {/* Card Form */}
        <div className="glass-card p-6 sm:p-10 rounded-3xl shadow-xl border border-blush-200/90 relative overflow-hidden">
          
          {isSubmitted ? (
            /* Success State with Animation */
            <SuccessCelebration
              title={attending ? 'Presença Confirmada com Sucesso! 🎉' : 'Obrigado por nos avisar! 💖'}
              subtitle={
                attending
                  ? `Que alegria ter você conosco! Os papais ${config.parents} e a pequena ${config.babyName} mal podem esperar para te abraçar.`
                  : 'Sentiremos muito sua falta, mas guardamos seu carinho com muito amor!'
              }
            >
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowGiftSuggest(true)}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blush-500 hover:bg-blush-600 text-white font-bold text-sm shadow-lg shadow-blush-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  🎁 Também quero escolher um presentinho!
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold transition cursor-pointer"
                >
                  Enviar outra confirmação
                </button>
              </div>
            </SuccessCelebration>
          ) : (
            /* RSVP Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Option: Sim ou Não */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Você poderá comparecer?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAttending(true)}
                    className={`py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition ${
                      attending
                        ? 'border-blush-500 bg-blush-50 text-blush-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Smile className={`w-5 h-5 ${attending ? 'text-blush-500' : 'text-slate-400'}`} />
                    <span>Sim, com certeza vou! 🎉</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttending(false)}
                    className={`py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition ${
                      !attending
                        ? 'border-slate-400 bg-slate-100 text-slate-800 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>🥺 Infelizmente não poderei</span>
                  </button>
                </div>
              </div>

              {/* Main Name Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Seu Nome Completo *
                </label>
                <input
                  type="text"
                  maxLength={80}
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Ana Clara Santos"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:border-blush-400 focus:ring-2 focus:ring-blush-100 outline-none text-base sm:text-sm shadow-sm transition"
                />
              </div>

              {attending && (
                <>
                  {/* Guest Counts (Adults + Children) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-5 bg-blush-50/60 border border-blush-200/70 rounded-2xl">
                    
                    {/* Adults */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block font-bold text-slate-800 text-sm">Adultos</span>
                        <span className="text-[11px] text-slate-500">Incluindo você</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                        <button
                          type="button"
                          onClick={() => handleAdultsChange(-1)}
                          disabled={adultsCount <= 1}
                          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold flex items-center justify-center transition active:scale-95 text-base"
                          aria-label="Diminuir adultos"
                        >
                          -
                        </button>
                        <span className="w-7 text-center font-bold text-slate-800 text-base">{adultsCount}</span>
                        <button
                          type="button"
                          onClick={() => handleAdultsChange(1)}
                          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition active:scale-95 text-base"
                          aria-label="Aumentar adultos"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block font-bold text-slate-800 text-sm">Crianças</span>
                        <span className="text-[11px] text-slate-500">Até 10 anos</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                        <button
                          type="button"
                          onClick={() => handleChildrenChange(-1)}
                          disabled={childrenCount <= 0}
                          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold flex items-center justify-center transition active:scale-95 text-base"
                          aria-label="Diminuir crianças"
                        >
                          -
                        </button>
                        <span className="w-7 text-center font-bold text-slate-800 text-base">{childrenCount}</span>
                        <button
                          type="button"
                          onClick={() => handleChildrenChange(1)}
                          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition active:scale-95 text-base"
                          aria-label="Aumentar crianças"
                        >
                          +
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Companion Names (if more than 1 person) */}
                  {companionNames.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                        <Users className="w-3.5 h-3.5 text-blush-500" />
                        <span>Nome dos Acompanhantes e Crianças * (Obrigatório)</span>
                      </div>
                      <div className="space-y-2">
                        {companionNames.map((companionName, idx) => (
                          <input
                            key={idx}
                            type="text"
                            maxLength={80}
                            required={true}
                            value={companionName}
                            onChange={(e) => handleCompanionNameChange(idx, e.target.value)}
                            placeholder={`Nome do acompanhante / criança ${idx + 1} *`}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:border-blush-400 focus:ring-2 focus:ring-blush-100 outline-none text-base sm:text-sm transition"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Phone / WhatsApp */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      WhatsApp / Telefone <span className="text-slate-400 font-normal text-[11px]">(opcional)</span>
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={15}
                      value={phone}
                      onKeyDown={handlePhoneKeyDown}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      placeholder="(11) 99999-9999"
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:border-blush-400 focus:ring-2 focus:ring-blush-100 outline-none text-base sm:text-sm shadow-sm transition"
                    />
                  </div>
                </>
              )}

              {/* Message to Baby & Parents */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Deixe uma mensagem de carinho para a Maitê e os papais <span className="text-slate-400 font-normal text-[11px]">(opcional)</span>
                </label>
                <textarea
                  rows="3"
                  maxLength={500}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escreva seus votos de amor, saúde e bênçãos para essa nova fase..."
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:border-blush-400 focus:ring-2 focus:ring-blush-100 outline-none text-base sm:text-sm shadow-sm transition resize-none"
                />
              </div>

              {/* Submit Button */}
              <ShimmerButton
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-blush-500 hover:bg-blush-600 active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-lg shadow-blush-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-5 h-5" />
                <span>{isSubmitting ? 'Enviando confirmação...' : 'Confirmar Minha Resposta'}</span>
              </ShimmerButton>

            </form>
          )}

        </div>

      </div>
      
      <GiftSuggestModal
        isOpen={showGiftSuggest}
        onClose={() => setShowGiftSuggest(false)}
        gifts={gifts}
        pledges={pledges}
        onSelectGift={(gift) => {
          setShowGiftSuggest(false);
          if (onSelectGift) onSelectGift(gift);
        }}
      />
    </section>
  );
}
