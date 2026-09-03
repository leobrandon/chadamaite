import React, { useState, useEffect } from 'react';
import { Check, Eye, EyeOff } from 'lucide-react';
import { hashPassword } from '../../utils/security';

export default function AdminConfigTab({ config, onSaveConfig }) {
  const [tempConfig, setTempConfig] = useState(config || {});
  const [newPin, setNewPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  useEffect(() => {
    if (config) {
      setTempConfig(config);
    }
  }, [config]);

  const handleDateChange = (newDate) => {
    let formattedDisplay = tempConfig.displayDate;
    if (newDate) {
      const parts = newDate.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const dateObj = new Date(year, month, day);
        if (!isNaN(dateObj.getTime())) {
          const weekday = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' });
          const monthName = dateObj.toLocaleDateString('pt-BR', { month: 'long' });
          formattedDisplay = `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${day} de ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${year}`;
        }
      }
    }
    setTempConfig(prev => ({
      ...prev,
      date: newDate,
      displayDate: formattedDisplay,
    }));
  };

  const handleTimeChange = (newTime) => {
    setTempConfig(prev => ({
      ...prev,
      time: newTime,
      displayTime: newTime ? `A partir das ${newTime}h` : prev.displayTime,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const configToSave = { ...tempConfig };
    
    // Se o usuário digitou uma nova senha PIN, gera o hash seguro
    if (newPin && newPin.trim()) {
      const hash = await hashPassword(newPin.trim());
      configToSave.adminPinHash = hash;
      delete configToSave.adminPin;
    }
    
    onSaveConfig(configToSave);
    try {
      sessionStorage.setItem('cha_maite_admin_auth', 'true');
    } catch {
      // ignore
    }
    setNewPin('');
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2500);
  };

  return (
    <div className="bg-white dark:bg-slate-900/90 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl">
      <div className="mb-4">
        <h5 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base">
          Personalização do Chá de Bebê
        </h5>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          Edite os textos, data do evento, chave Pix e senha de acesso ao painel
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          <div>
            <label className="block text-[10px] sm:text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Nome da Bebê</label>
            <input
              type="text"
              value={tempConfig.babyName || ''}
              onChange={(e) => setTempConfig({ ...tempConfig, babyName: e.target.value })}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blush-400 dark:focus:border-blush-500"
            />
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Nome dos Papais</label>
            <input
              type="text"
              value={tempConfig.parents || ''}
              onChange={(e) => setTempConfig({ ...tempConfig, parents: e.target.value })}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blush-400 dark:focus:border-blush-500"
            />
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Data (Calendário)</label>
            <input
              type="date"
              value={tempConfig.date || ''}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blush-400 dark:focus:border-blush-500"
            />
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Horário (Seletor)</label>
            <input
              type="time"
              value={tempConfig.time || ''}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blush-400 dark:focus:border-blush-500"
            />
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Data Formatada (Texto no Site)</label>
            <input
              type="text"
              value={tempConfig.displayDate || ''}
              onChange={(e) => setTempConfig({ ...tempConfig, displayDate: e.target.value })}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blush-400 dark:focus:border-blush-500"
              placeholder="Ex: Sábado, 17 de Outubro de 2026"
            />
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Horário Formatado (Texto no Site)</label>
            <input
              type="text"
              value={tempConfig.displayTime || ''}
              onChange={(e) => setTempConfig({ ...tempConfig, displayTime: e.target.value })}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blush-400 dark:focus:border-blush-500"
              placeholder="Ex: A partir das 15:30h"
            />
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Nome do Local</label>
            <input
              type="text"
              value={tempConfig.locationName || ''}
              onChange={(e) => setTempConfig({ ...tempConfig, locationName: e.target.value })}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blush-400 dark:focus:border-blush-500"
            />
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Cidade / Estado</label>
            <input
              type="text"
              value={tempConfig.city || ''}
              onChange={(e) => setTempConfig({ ...tempConfig, city: e.target.value })}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blush-400 dark:focus:border-blush-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[10px] sm:text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Endereço Completo</label>
            <input
              type="text"
              value={tempConfig.address || ''}
              onChange={(e) => setTempConfig({ ...tempConfig, address: e.target.value })}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blush-400 dark:focus:border-blush-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[10px] sm:text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Link do Google Maps</label>
            <input
              type="url"
              value={tempConfig.mapUrl || ''}
              onChange={(e) => setTempConfig({ ...tempConfig, mapUrl: e.target.value })}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blush-400 dark:focus:border-blush-500"
            />
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Chave Pix</label>
            <input
              type="text"
              value={tempConfig.pixKey || ''}
              onChange={(e) => setTempConfig({ ...tempConfig, pixKey: e.target.value })}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blush-400 dark:focus:border-blush-500"
            />
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Alterar Senha do Painel
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Deixe em branco para manter a atual"
                className="w-full px-3 py-2.5 pr-9 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blush-400 dark:focus:border-blush-500"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
                title={showPin ? 'Ocultar' : 'Ver'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              Protegida por criptografia SHA-256 no navegador.
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 min-h-[42px]"
          >
            <Check className="w-4 h-4" />
            <span>Salvar Configurações</span>
          </button>

          {configSaved && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold text-center">
              ✓ Salvo com sucesso!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
