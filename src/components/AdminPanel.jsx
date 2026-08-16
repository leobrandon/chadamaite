import React, { useState, useEffect } from 'react';
import { 
  X, Shield, Lock, Users, Gift, MessageCircleHeart, Settings, Download, 
  Trash2, Plus, Edit2, Check, RefreshCw, Eye, EyeOff, CheckCircle2, XCircle
} from 'lucide-react';
import { INITIAL_CATEGORIES, BABY_EMOJIS } from '../data/initialGifts';
import { storageService } from '../services/storageService';

export default function AdminPanel({ 
  isOpen, 
  onClose, 
  config, 
  onSaveConfig, 
  gifts, 
  onAddGift, 
  onUpdateGift, 
  onDeleteGift, 
  onCancelReservation,
  onResetGifts,
  rsvps, 
  onDeleteRSVP, 
  messages, 
  onApproveMessage,
  onDeleteMessage 
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState('gifts-report'); // 'gifts-report' | 'rsvps' | 'gifts' | 'config' | 'messages'

  // New Gift Form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Fraldas');
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('🎁');
  const [newPriority, setNewPriority] = useState('medium');

  // Config Form state
  const [tempConfig, setTempConfig] = useState(config);
  const [configSaved, setConfigSaved] = useState(false);

  // Sync tempConfig whenever remote config updates
  useEffect(() => {
    if (config) {
      setTempConfig(config);
    }
  }, [config]);

  // Edit Gift modal state
  const [editingGift, setEditingGift] = useState(null);

  // Message moderation filter state
  const [messageFilter, setMessageFilter] = useState('pending'); // 'pending' | 'approved'

  // Gift report search state
  const [giftReportSearch, setGiftReportSearch] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    const correctPin = String(config.adminPin || '16101928').trim();
    if (pinInput.trim() === correctPin) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleCreateGift = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddGift({
      title: newTitle.trim(),
      category: newCategory,
      description: newDesc.trim(),
      icon: newIcon || '🎁',
      priority: newPriority,
    });

    setNewTitle('');
    setNewDesc('');
  };

  const handleSaveEditedGift = (e) => {
    e.preventDefault();
    if (!editingGift) return;

    onUpdateGift(editingGift.id, {
      title: editingGift.title,
      category: editingGift.category,
      description: editingGift.description,
      icon: editingGift.icon,
      priority: editingGift.priority,
    });
    setEditingGift(null);
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    onSaveConfig(tempConfig);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2500);
  };

  const handleExportCSV = () => {
    const csvUri = storageService.exportRSVPsToCSV();
    if (!csvUri) {
      alert('Ainda não há confirmações para exportar.');
      return;
    }
    const link = document.createElement('a');
    link.setAttribute('href', csvUri);
    link.setAttribute('download', `confirmacoes_cha_maite_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportGiftsCSV = () => {
    const csvUri = storageService.exportGiftsToCSV();
    if (!csvUri) {
      alert('Ainda não há presentes para exportar.');
      return;
    }
    const link = document.createElement('a');
    link.setAttribute('href', csvUri);
    link.setAttribute('download', `relatorio_presentes_cha_maite_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Safe Array Defensive Guards
  const safeGifts = Array.isArray(gifts) ? gifts : [];
  const safeRsvps = Array.isArray(rsvps) ? rsvps : [];
  const safeMessages = Array.isArray(messages) ? messages : [];

  // Metrics
  const attendingRSVPs = safeRsvps.filter(r => r && r.attending);
  const totalAdults = attendingRSVPs.reduce((acc, curr) => acc + (curr.adultsCount || 1), 0);
  const totalChildren = attendingRSVPs.reduce((acc, curr) => acc + (curr.childrenCount || 0), 0);
  const totalGuests = totalAdults + totalChildren;

  const reservedGiftsCount = safeGifts.filter(g => g && g.status === 'reserved').length;
  const availableGiftsCount = safeGifts.length - reservedGiftsCount;

  const pendingMessages = safeMessages.filter(m => m && m.status === 'pending');
  const approvedMessages = safeMessages.filter(m => m && m.status === 'approved');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 p-5 sm:p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blush-500/20 text-blush-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold">
                Painel dos Papais (Leonardo & Isabella)
              </h3>
              <p className="text-xs text-slate-400">
                Gerencie a lista de presentes, convidados confirmados e detalhes do evento
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Barrier */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-14 text-center max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 rounded-full bg-blush-50 text-blush-500 mx-auto flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-serif text-2xl font-bold text-slate-800">
                Área Restrita aos Pais
              </h4>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Digite a senha de acesso dos papais para gerenciar o Chá
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  maxLength={15}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="Digite a senha do painel"
                  className={`w-full text-center tracking-widest font-mono text-xl py-3 rounded-2xl border outline-none transition ${
                    pinError
                      ? 'border-rose-500 bg-rose-50/30 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-blush-500 focus:ring-2 focus:ring-blush-200'
                  }`}
                  autoFocus
                />
                {pinError && (
                  <p className="text-xs text-rose-500 font-bold mt-2">
                    ❌ Senha incorreta. Verifique a senha digitada e tente novamente.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition"
              >
                Entrar no Painel
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col min-h-0">
            
            {/* Top Stats Banner */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-5 shrink-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Convidados</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl sm:text-2xl font-bold text-slate-800">{totalGuests}</span>
                    <span className="text-[10px] text-slate-500 font-medium">({totalAdults} ad. / {totalChildren} cr.)</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Presentes Escolhidos</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl sm:text-2xl font-bold text-blush-600">{reservedGiftsCount}</span>
                    <span className="text-[10px] text-slate-500">de {gifts.length}</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Presentes Livres</span>
                  <div className="text-xl sm:text-2xl font-bold text-emerald-600 mt-0.5">
                    {availableGiftsCount}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Recados no Mural</span>
                  <div className="text-xl sm:text-2xl font-bold text-purple-600 mt-0.5">
                    {messages.length}
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setActiveTab('gifts-report')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    activeTab === 'gifts-report'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5 text-blush-500" />
                  <span>🎁 Quem vai dar o quê? ({reservedGiftsCount})</span>
                </button>

                <button
                  onClick={() => setActiveTab('rsvps')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    activeTab === 'rsvps'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Presenças Confirmadas ({rsvps.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('gifts')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    activeTab === 'gifts'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Cadastrar/Editar Itens ({gifts.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('messages')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    activeTab === 'messages'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <MessageCircleHeart className="w-3.5 h-3.5" />
                  <span>Moderar Recados</span>
                  {pendingMessages.length > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold animate-pulse">
                      {pendingMessages.length} pendente{pendingMessages.length > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">({approvedMessages.length})</span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('config')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    activeTab === 'config'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Configurações</span>
                </button>
              </div>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
              
              {/* TAB 0: RELATÓRIO QUEM VAI DAR O QUÊ */}
              {activeTab === 'gifts-report' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-800 text-base sm:text-lg flex items-center gap-2">
                        <span>Relatório: Quem vai dar cada presente</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-blush-100 text-blush-700 font-bold">
                          {reservedGiftsCount} presentes reservados
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500">
                        Acompanhe o nome de cada convidado e o presente que ele escolheu dar para a Maitê
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExportGiftsCSV}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Exportar Relatório (Excel/CSV)</span>
                      </button>
                    </div>
                  </div>

                  {/* Search filter */}
                  {reservedGiftsCount > 0 && (
                    <div className="max-w-md">
                      <input
                        type="text"
                        value={giftReportSearch}
                        onChange={(e) => setGiftReportSearch(e.target.value)}
                        placeholder="Buscar por nome do convidado ou presente..."
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 focus:border-blush-400 outline-none text-xs shadow-sm transition"
                      />
                    </div>
                  )}

                  {/* Reserved Gifts Table */}
                  {reservedGiftsCount > 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                          <thead className="bg-blush-50/70 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-blush-100">
                            <tr>
                              <th className="p-3.5 text-blush-900 font-bold">Quem vai dar (Convidado)</th>
                              <th className="p-3.5">Presente Escolhido</th>
                              <th className="p-3.5">Categoria</th>
                              <th className="p-3.5">Data da Reserva</th>
                              <th className="p-3.5 text-right">Ação</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {gifts
                              .filter(g => g.status === 'reserved')
                              .filter(g => {
                                const q = giftReportSearch.toLowerCase();
                                return (
                                  (g.reservedBy && g.reservedBy.toLowerCase().includes(q)) ||
                                  g.title.toLowerCase().includes(q) ||
                                  g.category.toLowerCase().includes(q)
                                );
                              })
                              .map((gift) => (
                                <tr key={gift.id} className="hover:bg-slate-50/80 transition">
                                  <td className="p-3.5 font-bold text-slate-900 text-sm">
                                    <div className="flex items-center gap-2">
                                      <span className="w-7 h-7 rounded-full bg-blush-100 text-blush-700 flex items-center justify-center text-xs font-bold shrink-0">
                                        {(gift.reservedBy || 'C').charAt(0).toUpperCase()}
                                      </span>
                                      <span>{gift.reservedBy || 'Nome não informado'}</span>
                                    </div>
                                  </td>
                                  <td className="p-3.5 font-semibold text-slate-800">
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">{gift.icon || '🎁'}</span>
                                      <div>
                                        <span>{gift.title}</span>
                                        {gift.description && (
                                          <span className="block text-[11px] text-slate-400 font-normal">
                                            {gift.description}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3.5">
                                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium text-[10px]">
                                      {gift.category}
                                    </span>
                                  </td>
                                  <td className="p-3.5 text-slate-500 font-medium">
                                    {gift.reservedAt ? new Date(gift.reservedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recentemente'}
                                  </td>
                                  <td className="p-3.5 text-right">
                                    <button
                                      onClick={() => {
                                        if (confirm(`Liberar este presente (${gift.title}) para que fique disponível novamente?`)) {
                                          onCancelReservation(gift.id);
                                        }
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-[11px] font-bold border border-amber-200 transition"
                                      title="Desmarcar reserva"
                                    >
                                      Liberar Presente
                                    </button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-12 rounded-2xl text-center border border-slate-200 text-slate-400 text-sm space-y-2">
                      <div className="w-12 h-12 rounded-full bg-blush-50 text-blush-400 mx-auto flex items-center justify-center text-xl">
                        🎁
                      </div>
                      <p className="font-bold text-slate-700 text-base">Nenhum presente foi reservado ainda.</p>
                      <p className="text-xs text-slate-400">Assim que os convidados escolherem os presentes no site, a lista com o nome de cada um aparecerá aqui!</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* TAB 1: RSVPs */}
              {activeTab === 'rsvps' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 text-base sm:text-lg">
                        Lista de Respostas dos Convidados
                      </h4>
                      <p className="text-xs text-slate-500">
                        {attendingRSVPs.length} confirmações positivas ({totalGuests} pessoas no total)
                      </p>
                    </div>

                    <button
                      onClick={handleExportCSV}
                      disabled={rsvps.length === 0}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Exportar Relatório (Excel/CSV)</span>
                    </button>
                  </div>

                  {rsvps.length > 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                          <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                            <tr>
                              <th className="p-3">Convidado Principal</th>
                              <th className="p-3">Presença</th>
                              <th className="p-3">Adultos</th>
                              <th className="p-3">Crianças</th>
                              <th className="p-3">Acompanhantes</th>
                              <th className="p-3">WhatsApp</th>
                              <th className="p-3">Recado</th>
                              <th className="p-3 text-right">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {rsvps.map((rsvp) => (
                              <tr key={rsvp.id} className="hover:bg-slate-50/80 transition">
                                <td className="p-3 font-bold text-slate-800">
                                  {rsvp.name}
                                </td>
                                <td className="p-3">
                                  {rsvp.attending ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                                      <CheckCircle2 className="w-3 h-3" /> Sim
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                                      <XCircle className="w-3 h-3" /> Não
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 font-semibold">{rsvp.adultsCount || 0}</td>
                                <td className="p-3 font-semibold">{rsvp.childrenCount || 0}</td>
                                <td className="p-3 text-slate-500 max-w-[160px] truncate" title={(rsvp.companionNames || []).join(', ')}>
                                  {(rsvp.companionNames && rsvp.companionNames.length > 0) 
                                    ? rsvp.companionNames.join(', ') 
                                    : '-'}
                                </td>
                                <td className="p-3">{rsvp.phone || '-'}</td>
                                <td className="p-3 text-slate-500 max-w-[200px] truncate" title={rsvp.message}>
                                  {rsvp.message || '-'}
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    onClick={() => {
                                      if (confirm(`Excluir a confirmação de ${rsvp.name}?`)) {
                                        onDeleteRSVP(rsvp.id);
                                      }
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                                    title="Excluir resposta"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-8 rounded-2xl text-center border border-slate-200 text-slate-400 text-sm">
                      Nenhuma confirmação de presença registrada até o momento.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: GIFTS MANAGEMENT */}
              {activeTab === 'gifts' && (
                <div className="space-y-6">
                  
                  {/* Add New Gift Box */}
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-blush-200 shadow-sm">
                    <h5 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-blush-500" />
                      <span>Adicionar Novo Presente à Lista</span>
                    </h5>

                    <form onSubmit={handleCreateGift} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Ícone (Emoji)</label>
                        <select
                          value={newIcon}
                          onChange={(e) => setNewIcon(e.target.value)}
                          className="w-full px-2.5 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-blush-400 bg-white"
                        >
                          {BABY_EMOJIS.map((item) => (
                            <option key={item.emoji} value={item.emoji}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Nome do Item *</label>
                        <input
                          type="text"
                          required
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="Ex: Banheira Ergonômica com Suporte"
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-blush-400"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Categoria</label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-blush-400 bg-white"
                        >
                          {INITIAL_CATEGORIES.filter(c => c !== 'Todas').map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Prioridade</label>
                        <select
                          value={newPriority}
                          onChange={(e) => setNewPriority(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-blush-400 bg-white"
                        >
                          <option value="high">★ Alta (Preferência)</option>
                          <option value="medium">Média (Normal)</option>
                          <option value="low">Baixa (Opcional)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-10">
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Descrição / Tamanho / Sugestão de Marca</label>
                        <input
                          type="text"
                          value={newDesc}
                          onChange={(e) => setNewDesc(e.target.value)}
                          placeholder="Ex: Cor rosa ou neutra, preferência por marcas com trava de segurança"
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-blush-400"
                        />
                      </div>

                      <div className="sm:col-span-2 flex items-end">
                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-xl bg-blush-500 hover:bg-blush-600 text-white font-bold text-xs shadow-sm transition"
                        >
                          Adicionar
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Gifts Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-sm">
                        Todos os Presentes ({gifts.length})
                      </span>

                      <button
                        onClick={() => {
                          if (confirm('Tem certeza que deseja restaurar a lista padrão de presentes?')) {
                            onResetGifts();
                          }
                        }}
                        className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Restaurar Lista Padrão</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                          <tr>
                            <th className="p-3">Ícone</th>
                            <th className="p-3">Presente</th>
                            <th className="p-3">Categoria</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Reservado Por</th>
                            <th className="p-3 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {gifts.map((gift) => (
                            <tr key={gift.id} className="hover:bg-slate-50/80 transition">
                              <td className="p-3 text-xl">{gift.icon || '🎁'}</td>
                              <td className="p-3 font-semibold text-slate-800">
                                {gift.title}
                                {gift.description && (
                                  <span className="block text-[11px] text-slate-400 font-normal">
                                    {gift.description}
                                  </span>
                                )}
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px]">
                                  {gift.category}
                                </span>
                              </td>
                              <td className="p-3">
                                {gift.status === 'reserved' ? (
                                  <span className="px-2 py-0.5 rounded-full bg-blush-100 text-blush-700 font-bold text-[10px]">
                                    Reservado
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                                    Disponível
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-slate-500 font-medium">
                                {gift.reservedBy || '-'}
                              </td>
                              <td className="p-3 text-right space-x-1">
                                {gift.status === 'reserved' && (
                                  <button
                                    onClick={() => onCancelReservation(gift.id)}
                                    className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold transition"
                                    title="Tornar disponível novamente"
                                  >
                                    Liberar
                                  </button>
                                )}

                                <button
                                  onClick={() => setEditingGift(gift)}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition"
                                  title="Editar presente"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => {
                                    if (confirm(`Excluir ${gift.title}?`)) {
                                      onDeleteGift(gift.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                                  title="Excluir presente"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: CONFIG */}
              {activeTab === 'config' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl">
                  <h5 className="font-bold text-slate-800 text-base mb-4">
                    Personalização do Chá de Bebê
                  </h5>

                  <form onSubmit={handleSaveConfig} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nome da Bebê</label>
                        <input
                          type="text"
                          value={tempConfig.babyName}
                          onChange={(e) => setTempConfig({ ...tempConfig, babyName: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-blush-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nome dos Papais</label>
                        <input
                          type="text"
                          value={tempConfig.parents}
                          onChange={(e) => setTempConfig({ ...tempConfig, parents: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-blush-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Data (AAAA-MM-DD)</label>
                        <input
                          type="date"
                          value={tempConfig.date}
                          onChange={(e) => setTempConfig({ ...tempConfig, date: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-blush-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Horário (HH:MM)</label>
                        <input
                          type="time"
                          value={tempConfig.time}
                          onChange={(e) => setTempConfig({ ...tempConfig, time: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-blush-400"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Data Formatada (Texto visível)</label>
                        <input
                          type="text"
                          value={tempConfig.displayDate}
                          onChange={(e) => setTempConfig({ ...tempConfig, displayDate: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-blush-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nome do Local</label>
                        <input
                          type="text"
                          value={tempConfig.locationName}
                          onChange={(e) => setTempConfig({ ...tempConfig, locationName: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-blush-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Cidade / Estado</label>
                        <input
                          type="text"
                          value={tempConfig.city}
                          onChange={(e) => setTempConfig({ ...tempConfig, city: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-blush-400"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Endereço Completo</label>
                        <input
                          type="text"
                          value={tempConfig.address}
                          onChange={(e) => setTempConfig({ ...tempConfig, address: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-blush-400"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Link do Google Maps</label>
                        <input
                          type="url"
                          value={tempConfig.mapUrl}
                          onChange={(e) => setTempConfig({ ...tempConfig, mapUrl: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-blush-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Chave Pix</label>
                        <input
                          type="text"
                          value={tempConfig.pixKey}
                          onChange={(e) => setTempConfig({ ...tempConfig, pixKey: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-blush-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Senha PIN do Painel</label>
                        <input
                          type="text"
                          value={tempConfig.adminPin}
                          onChange={(e) => setTempConfig({ ...tempConfig, adminPin: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-blush-400"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex items-center gap-3">
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Salvar Alterações</span>
                      </button>

                      {configSaved && (
                        <span className="text-xs text-emerald-600 font-bold">
                          ✓ Salvo com sucesso!
                        </span>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 4: MESSAGES MODERATION */}
              {activeTab === 'messages' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h5 className="font-bold text-slate-800 text-base">
                        Moderação do Mural de Recados
                      </h5>
                      <p className="text-xs text-slate-500">
                        Aprove ou recuse recados deixados pelos convidados antes de serem exibidos publicamente
                      </p>
                    </div>

                    {/* Sub-tabs: Pendentes vs Aprovados */}
                    <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
                      <button
                        onClick={() => setMessageFilter('pending')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          messageFilter === 'pending'
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>Aguardando Aprovação</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-bold">
                          {pendingMessages.length}
                        </span>
                      </button>

                      <button
                        onClick={() => setMessageFilter('approved')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          messageFilter === 'approved'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>Aprovados no Mural</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-bold">
                          {approvedMessages.length}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Messages Content */}
                  {messageFilter === 'pending' ? (
                    pendingMessages.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {pendingMessages.map((msg) => (
                          <div key={msg.id} className="bg-white p-5 rounded-2xl border-2 border-rose-200/80 flex flex-col justify-between shadow-sm relative">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-slate-800 text-sm">{msg.author}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                  Pendente
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                                "{msg.text}"
                              </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                              <span className="text-[10px] text-slate-400">{msg.date}</span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onApproveMessage(msg.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                                  title="Aprovar e publicar no mural"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Aprovar Recado</span>
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm('Recusar e excluir este recado?')) {
                                      onDeleteMessage(msg.id);
                                    }
                                  }}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition"
                                  title="Recusar recado"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Recusar</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white p-10 rounded-2xl text-center border border-slate-200 text-slate-400 text-sm">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="font-bold text-slate-700">Tudo em dia!</p>
                        <p className="text-xs text-slate-400 mt-1">Não há novos recados aguardando aprovação.</p>
                      </div>
                    )
                  ) : (
                    approvedMessages.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {approvedMessages.map((msg) => (
                          <div key={msg.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-sm">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-slate-800 text-sm">{msg.author}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  No Mural ✓
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed italic">
                                "{msg.text}"
                              </p>
                            </div>
                            <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[10px] text-slate-400">{msg.date}</span>
                              <button
                                onClick={() => {
                                  if (confirm('Excluir este recado do mural?')) {
                                    onDeleteMessage(msg.id);
                                  }
                                }}
                                className="text-xs text-rose-500 hover:text-rose-700 font-semibold"
                              >
                                Remover do Mural
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white p-8 rounded-2xl text-center border border-slate-200 text-slate-400 text-sm">
                        Nenhum recado aprovado no momento.
                      </div>
                    )
                  )}
                </div>
              )}

            </div>

          </div>
        )}

      </div>

      {/* Edit Gift Modal */}
      {editingGift && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h4 className="font-bold text-slate-800 text-base">Editar Presente</h4>
            
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Ícone (Emoji)</label>
              <select
                value={editingGift.icon || '🎁'}
                onChange={(e) => setEditingGift({ ...editingGift, icon: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white outline-none focus:border-blush-400"
              >
                {BABY_EMOJIS.map((item) => (
                  <option key={item.emoji} value={item.emoji}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Título</label>
              <input
                type="text"
                value={editingGift.title}
                onChange={(e) => setEditingGift({ ...editingGift, title: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Categoria</label>
              <select
                value={editingGift.category}
                onChange={(e) => setEditingGift({ ...editingGift, category: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-xl bg-white"
              >
                {INITIAL_CATEGORIES.filter(c => c !== 'Todas').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Descrição</label>
              <textarea
                rows="2"
                value={editingGift.description}
                onChange={(e) => setEditingGift({ ...editingGift, description: e.target.value })}
                className="w-full px-3 py-2 text-sm border rounded-xl resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveEditedGift}
                className="flex-1 py-2 rounded-xl bg-blush-500 text-white font-bold text-xs"
              >
                Salvar Alterações
              </button>
              <button
                onClick={() => setEditingGift(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
