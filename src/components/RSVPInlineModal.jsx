import React, { useState, useEffect } from 'react';
import { Users, Smile, Send } from 'lucide-react';
import { formatPhone, handlePhoneKeyDown } from '../utils/phoneMask';

export default function RSVPInlineModal({ guestNamePrefill = '', config, onSubmit, onDone }) {
  const [attending, setAttending] = useState(true);
  const [name, setName] = useState(guestNamePrefill);
  const [adultsCount, setAdultsCount] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [companionNames, setCompanionNames] = useState([]);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setName(guestNamePrefill);
  }, [guestNamePrefill]);

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
    const requiredCompanions = Math.max(0, totalPeople - 1);
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
        alert('Por favor, preencha o nome de todos os acompanhantes e crianças.');
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

    try {
      await onSubmit(rsvpData);
      onDone();
    } catch (err) {
      console.error('Erro ao enviar RSVP:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-blush-100 shadow-sm text-left">
      <div className="text-center mb-4">
        <h4 className="font-serif text-lg font-bold text-slate-800">Uma última coisa! Confirme sua presença 💕</h4>
        <p className="text-xs text-slate-500 mt-1">Para sabermos quem estará conosco no dia especial da Maitê.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Option: Sim ou Não */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Você poderá comparecer?</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAttending(true)}
              className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition ${
                attending ? 'border-blush-500 bg-blush-50 text-blush-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Smile className={`w-3.5 h-3.5 ${attending ? 'text-blush-500' : 'text-slate-400'}`} />
              <span>Sim, vou!</span>
            </button>
            <button
              type="button"
              onClick={() => setAttending(false)}
              className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center border transition ${
                !attending ? 'border-slate-400 bg-slate-100 text-slate-800 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>🥺 Infelizmente não poderei</span>
            </button>
          </div>
        </div>

        {/* Main Name Input */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Seu Nome Completo *</label>
          <input
            type="text"
            maxLength={80}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Ana Clara Santos"
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blush-400 focus:ring-1 focus:ring-blush-100 outline-none text-sm shadow-sm transition"
          />
        </div>

        {attending && (
          <>
            {/* Guest Counts */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-blush-50/60 border border-blush-200/70 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block font-bold text-slate-800 text-xs">Adultos</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white p-0.5 rounded-xl border border-slate-200 shadow-sm">
                  <button type="button" onClick={() => handleAdultsChange(-1)} disabled={adultsCount <= 1} className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold flex items-center justify-center transition active:scale-95 text-xs">-</button>
                  <span className="w-5 text-center font-bold text-slate-800 text-xs">{adultsCount}</span>
                  <button type="button" onClick={() => handleAdultsChange(1)} className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition active:scale-95 text-xs">+</button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="block font-bold text-slate-800 text-xs">Crianças</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white p-0.5 rounded-xl border border-slate-200 shadow-sm">
                  <button type="button" onClick={() => handleChildrenChange(-1)} disabled={childrenCount <= 0} className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold flex items-center justify-center transition active:scale-95 text-xs">-</button>
                  <span className="w-5 text-center font-bold text-slate-800 text-xs">{childrenCount}</span>
                  <button type="button" onClick={() => handleChildrenChange(1)} className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition active:scale-95 text-xs">+</button>
                </div>
              </div>
            </div>

            {/* Companion Names */}
            {companionNames.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  <Users className="w-3 h-3 text-blush-500" />
                  <span>Nome dos Acompanhantes/Crianças *</span>
                </div>
                <div className="space-y-2">
                  {companionNames.map((companionName, idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={80}
                      required
                      value={companionName}
                      onChange={(e) => handleCompanionNameChange(idx, e.target.value)}
                      placeholder={`Acompanhante ${idx + 1} *`}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blush-400 focus:ring-1 focus:ring-blush-100 outline-none text-sm transition"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Phone */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">WhatsApp <span className="text-slate-400 font-normal">(opcional)</span></label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={15}
                value={phone}
                onKeyDown={handlePhoneKeyDown}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="(11) 99999-9999"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blush-400 focus:ring-1 focus:ring-blush-100 outline-none text-sm shadow-sm transition"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Mensagem <span className="text-slate-400 font-normal">(opcional)</span></label>
          <textarea
            rows="2"
            maxLength={500}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Deixe um recadinho..."
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-blush-400 focus:ring-1 focus:ring-blush-100 outline-none text-sm shadow-sm transition resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-xl bg-blush-500 hover:bg-blush-600 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-blush-500/25 transition flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? 'Confirmando...' : 'Confirmar Minha Presença 💕'}</span>
        </button>
      </form>
    </div>
  );
}
