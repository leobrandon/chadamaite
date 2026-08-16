import React, { useState, useEffect } from 'react';
import { 
  X, Shield, Lock, Users, Gift, MessageCircleHeart, Settings, Download, 
  Trash2, Plus, Edit2, Check, RefreshCw, Eye, EyeOff, CheckCircle2, XCircle, Search, FileText
} from 'lucide-react';
import { INITIAL_CATEGORIES, BABY_EMOJIS } from '../data/initialGifts';
import { storageService } from '../services/storageService';
import ConfirmModal from './ConfirmModal';

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
  pledges = [],
  onDeletePledge,
  rsvps, 
  onDeleteRSVP, 
  onUpdateRSVP,
  messages, 
  onApproveMessage,
  onDeleteMessage 
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('cha_maite_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState('gifts-report'); // 'gifts-report' | 'rsvps' | 'gifts' | 'config' | 'messages'

  // New Gift Form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Fraldas');
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('🎁');
  const [newPriority, setNewPriority] = useState('medium');
  const [newTargetQuantity, setNewTargetQuantity] = useState(5);

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

  // Edit RSVP modal state
  const [editingRsvp, setEditingRsvp] = useState(null);

  // Message moderation filter state
  const [messageFilter, setMessageFilter] = useState('pending'); // 'pending' | 'approved'

  // Gift report search state
  const [giftReportSearch, setGiftReportSearch] = useState('');
  
  // Gift manage tab search state
  const [giftManageSearch, setGiftManageSearch] = useState('');
  
  // Accordion state for pledges
  const [expandedGiftId, setExpandedGiftId] = useState(null);

  // In-app Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    isDestructive: false,
    onConfirm: null,
  });

  const requestConfirm = ({
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isDestructive = true,
    onConfirm,
  }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      isDestructive,
      onConfirm: () => {
        onConfirm();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    const correctPin = String(config?.adminPin || '16101928').trim();
    if (pinInput.trim() === correctPin) {
      try {
        sessionStorage.setItem('cha_maite_admin_auth', 'true');
      } catch {
        // ignore sessionStorage errors
      }
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleCreateGift = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await onAddGift({
      title: newTitle.trim(),
      category: newCategory,
      description: newDesc.trim(),
      icon: newIcon || '🎁',
      priority: newPriority,
      targetQuantity: Number(newTargetQuantity) || 5,
    });

    setNewTitle('');
    setNewDesc('');
    setNewTargetQuantity(5);
  };

  const handleSaveEditedGift = async (e) => {
    e.preventDefault();
    if (!editingGift) return;

    await onUpdateGift(editingGift.id, {
      title: editingGift.title,
      category: editingGift.category,
      description: editingGift.description,
      icon: editingGift.icon,
      priority: editingGift.priority,
      targetQuantity: Number(editingGift.targetQuantity) || 5,
    });
    setEditingGift(null);
  };

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

  const handleSaveConfig = (e) => {
    e.preventDefault();
    onSaveConfig(tempConfig);
    try {
      sessionStorage.setItem('cha_maite_admin_auth', 'true');
    } catch {
      // ignore
    }
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

  const giftsWithPledgesCount = new Set(pledges.map(p => p.giftId)).size;
  const availableGiftsCount = safeGifts.length - giftsWithPledgesCount;
  const totalPledgesCount = pledges.length;

  const pendingMessages = safeMessages.filter(m => m && m.status === 'pending');
  const approvedMessages = safeMessages.filter(m => m && m.status === 'approved');

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const totalAttending = attendingRSVPs.length;
    const notAttending = safeRsvps.filter(r => !r.attending).length;
    const rows = safeRsvps.map(r => `
      <tr>
        <td>${r.name}</td>
        <td style="text-align:center;">${r.attending ? '✅ Sim' : '❌ Não'}</td>
        <td style="text-align:center;">${r.attending ? (r.adultsCount||0) : '-'}</td>
        <td style="text-align:center;">${r.attending ? (r.childrenCount||0) : '-'}</td>
        <td>${(r.companionNames||[]).join(', ') || '-'}</td>
        <td>${r.phone||'-'}</td>
        <td>${r.message||'-'}</td>
      </tr>
    `).join('');
    printWindow.document.write(`<!DOCTYPE html><html lang="pt-BR"><head>
      <meta charset="UTF-8">
      <title>Lista de Presenças - Chá da Maitê</title>
      <style>
        @media print { body { -webkit-print-color-adjust: exact; color-adjust: exact; } }
        body { font-family: Arial, sans-serif; padding: 24px; color: #1e293b; }
        h1 { color: #f472b6; font-size: 22px; margin-bottom: 4px; }
        .subtitle { color: #64748b; font-size: 13px; margin-bottom: 20px; }
        .summary { display: flex; gap: 16px; margin-bottom: 20px; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 20px; text-align: center; }
        .card .num { font-size: 24px; font-weight: bold; color: #f472b6; }
        .card .label { font-size: 11px; color: #64748b; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #f1f5f9; color: #475569; text-transform: uppercase; font-size: 10px; padding: 8px; border-bottom: 2px solid #e2e8f0; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #f1f5f9; color: #334155; }
        tr:nth-child(even) { background: #fafafa; }
        .footer { margin-top: 20px; font-size: 10px; color: #94a3b8; text-align: right; }
      </style></head><body>
      <h1>🌸 Chá de Bebê da Maitê</h1>
      <p class="subtitle">Lista de Confirmações de Presença • Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
      <div class="summary">
        <div class="card"><div class="num">${safeRsvps.length}</div><div class="label">Respostas</div></div>
        <div class="card"><div class="num">${totalAttending}</div><div class="label">Confirmados</div></div>
        <div class="card"><div class="num">${totalAdults}</div><div class="label">Adultos</div></div>
        <div class="card"><div class="num">${totalChildren}</div><div class="label">Crianças</div></div>
        <div class="card"><div class="num">${notAttending}</div><div class="label">Não vêm</div></div>
      </div>
      <table><thead><tr><th>Convidado</th><th>Presença</th><th>Adultos</th><th>Crianças</th><th>Acompanhantes</th><th>WhatsApp</th><th>Recado</th></tr></thead><tbody>${rows}</tbody></table>
      <p class="footer">Chá da Maitê • Leonardo & Isabella • ${new Date().toLocaleDateString('pt-BR')}</p>
      </body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSaveEditedRsvp = async () => {
    if (!editingRsvp) return;
    await onUpdateRSVP(editingRsvp.id, {
      adultsCount: editingRsvp.adultsCount,
      childrenCount: editingRsvp.childrenCount,
      companionNames: editingRsvp.companionNames || [],
      phone: editingRsvp.phone || '',
      message: editingRsvp.message || ''
    });
    setEditingRsvp(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[90dvh] overscroll-contain">
        
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

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  try {
                    sessionStorage.removeItem('cha_maite_admin_auth');
                  } catch {
                    // ignore
                  }
                  setIsAuthenticated(false);
                  setPinInput('');
                  setPinError(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
                title="Bloquear Painel com Senha"
              >
                <Lock className="w-3.5 h-3.5 text-blush-400" />
                <span className="hidden sm:inline">Bloquear</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Presentes com Contribuição</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl sm:text-2xl font-bold text-blush-600">{giftsWithPledgesCount}</span>
                    <span className="text-[10px] text-slate-500">de {gifts.length}</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Presentes Sem Contrib.</span>
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
                  <span>🎁 Contribuições por Presente ({giftsWithPledgesCount})</span>
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
                        <span>Relatório: Contribuições por Presente</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-blush-100 text-blush-700 font-bold">
                          {giftsWithPledgesCount} presentes com contribuições
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500">
                        Acompanhe as contribuições não-exclusivas. Diversos convidados podem contribuir com o mesmo presente.
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
                  {giftsWithPledgesCount > 0 && (
                    <div className="max-w-md">
                      <input
                        type="text"
                        value={giftReportSearch}
                        onChange={(e) => setGiftReportSearch(e.target.value)}
                        placeholder="Buscar por presente..."
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 focus:border-blush-400 outline-none text-xs shadow-sm transition"
                      />
                    </div>
                  )}

                  {/* Pledges Accordion */}
                  {giftsWithPledgesCount > 0 ? (
                    <div className="space-y-3">
                      {gifts
                        .filter(g => pledges.some(p => p.giftId === g.id))
                        .filter(g => {
                          const q = giftReportSearch.toLowerCase();
                          return g.title.toLowerCase().includes(q) || g.category.toLowerCase().includes(q);
                        })
                        .map((gift) => {
                          const giftPledges = pledges.filter(p => p.giftId === gift.id);
                          const totalUnits = giftPledges.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);
                          const targetQty = Number(gift.targetQuantity) || 5;
                          const isCompleted = totalUnits >= targetQty;
                          const progressPercent = Math.min(100, Math.round((totalUnits / targetQty) * 100));
                          const isExpanded = expandedGiftId === gift.id;

                          return (
                            <div key={gift.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                              {/* Gift Header */}
                              <div 
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition"
                                onClick={() => setExpandedGiftId(isExpanded ? null : gift.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-blush-50 text-blush-600 flex items-center justify-center text-xl shrink-0 border border-blush-100">
                                    {gift.icon || '🎁'}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h5 className="font-bold text-slate-800 text-sm">{gift.title}</h5>
                                      {isCompleted && (
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                                          Meta Atingida! 🎉
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      {gift.category} • <span className="font-semibold text-blush-600">{giftPledges.length} contribuidor(es)</span> • <span className="font-semibold text-slate-700">{totalUnits} de {targetQty} un. recebidas ({progressPercent}%)</span>
                                    </p>
                                  </div>
                                </div>
                                <div className="text-slate-400 p-2">
                                  {isExpanded ? '▲' : '▼'}
                                </div>
                              </div>

                              {/* Expanded Pledges Table */}
                              {isExpanded && (
                                <div className="border-t border-slate-100 bg-slate-50 p-4">
                                  <table className="w-full text-left text-xs text-slate-600">
                                    <thead className="bg-slate-200/50 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                                      <tr>
                                        <th className="p-2">Convidado</th>
                                        <th className="p-2">Quantidade</th>
                                        <th className="p-2">Data</th>
                                        <th className="p-2 text-right">Ações</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                      {giftPledges.map(pledge => (
                                        <tr key={pledge.id}>
                                          <td className="p-2 font-bold text-slate-800">
                                            <div className="flex items-center gap-2">
                                              <span className="w-6 h-6 rounded-full bg-blush-100 text-blush-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                                                {(pledge.giverName || 'C').charAt(0).toUpperCase()}
                                              </span>
                                              <span>{pledge.giverName}</span>
                                            </div>
                                          </td>
                                          <td className="p-2 font-medium">{pledge.quantity} un.</td>
                                          <td className="p-2 text-slate-500">
                                            {new Date(pledge.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                          </td>
                                          <td className="p-2 text-right">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                requestConfirm({
                                                  title: 'Excluir Contribuição',
                                                  message: `Tem certeza que deseja excluir a contribuição de ${pledge.giverName}?`,
                                                  confirmText: 'Sim, Excluir',
                                                  cancelText: 'Cancelar',
                                                  isDestructive: true,
                                                  onConfirm: () => onDeletePledge(pledge.id),
                                                });
                                              }}
                                              className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-500 hover:text-rose-700 transition"
                                              title="Excluir contribuição"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="bg-white p-12 rounded-2xl text-center border border-slate-200 text-slate-400 text-sm space-y-2">
                      <div className="w-12 h-12 rounded-full bg-blush-50 text-blush-400 mx-auto flex items-center justify-center text-xl">
                        🎁
                      </div>
                      <p className="font-bold text-slate-700 text-base">Sem contribuições ainda.</p>
                      <p className="text-xs text-slate-400">Assim que os convidados começarem a escolher presentes, eles aparecerão aqui!</p>
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

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExportPDF}
                        disabled={rsvps.length === 0}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Exportar PDF</span>
                      </button>
                      <button
                        onClick={handleExportCSV}
                        disabled={rsvps.length === 0}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Exportar Relatório (Excel/CSV)</span>
                      </button>
                    </div>
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
                                <td className="p-3 text-right whitespace-nowrap">
                                  <button
                                    onClick={() => setEditingRsvp({...rsvp, companionNames: rsvp.companionNames || []})}
                                    className="p-1.5 rounded-lg hover:bg-blush-50 text-slate-400 hover:text-blush-600 transition"
                                    title="Editar confirmação"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      requestConfirm({
                                        title: 'Excluir Confirmação',
                                        message: `Tem certeza que deseja excluir a confirmação de presença de ${rsvp.name}?`,
                                        confirmText: 'Sim, Excluir',
                                        cancelText: 'Cancelar',
                                        isDestructive: true,
                                        onConfirm: () => onDeleteRSVP(rsvp.id),
                                      });
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
                      <div className="sm:col-span-2">
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

                      <div className="sm:col-span-2">
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

                      <div className="sm:col-span-2">
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

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Meta Desejada</label>
                        <input
                          type="number"
                          min="1"
                          max="999"
                          required
                          value={newTargetQuantity}
                          onChange={(e) => setNewTargetQuantity(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-blush-400"
                        />
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

                  {/* Gifts Card List — mobile-friendly, fully clickable */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-sm">
                        Todos os Presentes ({gifts.length})
                      </span>
                      <button
                        onClick={() => {
                          requestConfirm({
                            title: 'Restaurar Lista Padrão',
                            message: 'Tem certeza que deseja restaurar a lista padrão de presentes? Todas as adições e edições manuais serão redefinidas para o modelo inicial.',
                            confirmText: 'Sim, Restaurar',
                            cancelText: 'Cancelar',
                            isDestructive: true,
                            onConfirm: () => onResetGifts(),
                          });
                        }}
                        className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 transition"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Restaurar Lista Padrão</span>
                      </button>
                    </div>

                    {/* Search bar for gifts list */}
                    <div className="p-3 bg-slate-50 border-b border-slate-100">
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={giftManageSearch}
                          onChange={(e) => setGiftManageSearch(e.target.value)}
                          placeholder="Buscar item por nome, categoria ou marca..."
                          className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white outline-none focus:border-blush-400 focus:ring-2 focus:ring-blush-100 transition"
                        />
                        {giftManageSearch && (
                          <button
                            type="button"
                            onClick={() => setGiftManageSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1"
                            title="Limpar busca"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {gifts
                        .filter((gift) => {
                          if (!giftManageSearch.trim()) return true;
                          const q = giftManageSearch.toLowerCase();
                          return (
                            (gift.title || '').toLowerCase().includes(q) ||
                            (gift.category || '').toLowerCase().includes(q) ||
                            (gift.description || '').toLowerCase().includes(q)
                          );
                        })
                        .map((gift) => {
                        const giftPledges = pledges.filter(p => p.giftId === gift.id);
                        const totalUnits = giftPledges.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);
                        const targetQty = Number(gift.targetQuantity) || 5;
                        const isCompleted = totalUnits >= targetQty;

                        return (
                          <button
                            key={gift.id}
                            onClick={() => setEditingGift(gift)}
                            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 active:bg-blush-50/50 transition text-left group"
                          >
                            {/* Emoji */}
                            <div className="w-10 h-10 rounded-xl bg-blush-50 border border-blush-100 flex items-center justify-center text-xl shrink-0">
                              {gift.icon || '🎁'}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-800 text-sm leading-snug truncate">
                                {gift.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px]">
                                  {gift.category}
                                </span>
                                {gift.priority === 'high' && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold text-[10px]">★ Alta</span>
                                )}
                                {giftPledges.length > 0 ? (
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-blush-100 text-blush-700'
                                  }`}>
                                    {isCompleted ? '🎉 ' : '💝 '}{totalUnits}/{targetQty} un. ({giftPledges.length} contrib.)
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px]">
                                    0/{targetQty} un.
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Chevron */}
                            <Edit2 className="w-3.5 h-3.5 text-slate-300 group-hover:text-blush-400 transition shrink-0" />
                          </button>
                        );
                      })}
                      {gifts.filter((gift) => {
                        if (!giftManageSearch.trim()) return true;
                        const q = giftManageSearch.toLowerCase();
                        return (
                          (gift.title || '').toLowerCase().includes(q) ||
                          (gift.category || '').toLowerCase().includes(q) ||
                          (gift.description || '').toLowerCase().includes(q)
                        );
                      }).length === 0 && (
                        <div className="p-8 text-center text-slate-400 text-xs">
                          Nenhum presente encontrado para "{giftManageSearch}".
                        </div>
                      )}
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
                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Data (Calendário)</label>
                        <input
                          type="date"
                          value={tempConfig.date}
                          onChange={(e) => handleDateChange(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-blush-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Horário (Seletor)</label>
                        <input
                          type="time"
                          value={tempConfig.time}
                          onChange={(e) => handleTimeChange(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-blush-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Data Formatada (Texto no Site)</label>
                        <input
                          type="text"
                          value={tempConfig.displayDate}
                          onChange={(e) => setTempConfig({ ...tempConfig, displayDate: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-blush-400"
                          placeholder="Ex: Sábado, 17 de Outubro de 2026"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Horário Formatado (Texto no Site)</label>
                        <input
                          type="text"
                          value={tempConfig.displayTime}
                          onChange={(e) => setTempConfig({ ...tempConfig, displayTime: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-blush-400"
                          placeholder="Ex: A partir das 15:30h"
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
                                    requestConfirm({
                                      title: 'Recusar Recado',
                                      message: `Tem certeza que deseja recusar e excluir o recado de ${msg.author}?`,
                                      confirmText: 'Sim, Recusar',
                                      cancelText: 'Cancelar',
                                      isDestructive: true,
                                      onConfirm: () => onDeleteMessage(msg.id),
                                    });
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
                                  requestConfirm({
                                    title: 'Remover Recado do Mural',
                                    message: `Tem certeza que deseja remover o recado de ${msg.author} do mural público?`,
                                    confirmText: 'Sim, Remover',
                                    cancelText: 'Cancelar',
                                    isDestructive: true,
                                    onConfirm: () => onDeleteMessage(msg.id),
                                  });
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
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90dvh] overflow-y-auto overscroll-contain">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{editingGift.icon || '🎁'}</span>
                <h4 className="font-bold text-slate-800 text-base">Editar Presente</h4>
              </div>
              <button
                onClick={() => setEditingGift(null)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEditedGift} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Ícone (Emoji)</label>
                <select
                  value={editingGift.icon || '🎁'}
                  onChange={(e) => setEditingGift({ ...editingGift, icon: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white outline-none focus:border-blush-400 focus:ring-2 focus:ring-blush-100 transition"
                >
                  {BABY_EMOJIS.map((item) => (
                    <option key={item.emoji} value={item.emoji}>{item.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Nome do Item *</label>
                <input
                  type="text"
                  required
                  value={editingGift.title}
                  onChange={(e) => setEditingGift({ ...editingGift, title: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blush-400 focus:ring-2 focus:ring-blush-100 transition"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Categoria</label>
                  <select
                    value={editingGift.category}
                    onChange={(e) => setEditingGift({ ...editingGift, category: e.target.value })}
                    className="w-full px-2.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-white outline-none focus:border-blush-400 focus:ring-2 focus:ring-blush-100 transition"
                  >
                    {INITIAL_CATEGORIES.filter(c => c !== 'Todas').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Prioridade</label>
                  <select
                    value={editingGift.priority || 'medium'}
                    onChange={(e) => setEditingGift({ ...editingGift, priority: e.target.value })}
                    className="w-full px-2.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-white outline-none focus:border-blush-400 focus:ring-2 focus:ring-blush-100 transition"
                  >
                    <option value="high">★ Alta</option>
                    <option value="medium">Média</option>
                    <option value="low">Baixa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Meta (Qtd)</label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    required
                    value={editingGift.targetQuantity ?? 5}
                    onChange={(e) => setEditingGift({ ...editingGift, targetQuantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-2.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl outline-none focus:border-blush-400 focus:ring-2 focus:ring-blush-100 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Descrição / Sugestão de Marca</label>
                <textarea
                  rows="2"
                  value={editingGift.description}
                  onChange={(e) => setEditingGift({ ...editingGift, description: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl resize-none outline-none focus:border-blush-400 focus:ring-2 focus:ring-blush-100 transition"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-blush-500 hover:bg-blush-600 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-blush-500/20 transition flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Salvar Alterações
                </button>
                <button
                  type="button"
                  onClick={() => setEditingGift(null)}
                  className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm transition"
                >
                  Cancelar
                </button>
              </div>

              {/* Danger Zone — Delete */}
              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    requestConfirm({
                      title: 'Excluir Presente',
                      message: `Tem certeza que deseja excluir o presente "${editingGift.title}" permanentemente da lista?`,
                      confirmText: 'Sim, Excluir Presente',
                      cancelText: 'Cancelar',
                      isDestructive: true,
                      onConfirm: async () => {
                        await onDeleteGift(editingGift.id);
                        setEditingGift(null);
                      },
                    });
                  }}
                  className="w-full py-2.5 rounded-2xl border border-rose-200 text-rose-600 hover:bg-rose-50 active:scale-[0.98] font-semibold text-sm transition flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir este presente
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Edit RSVP Modal */}
      {editingRsvp && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90dvh] overflow-y-auto overscroll-contain">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✏️</span>
                <h4 className="font-bold text-slate-800 text-base">Editar Confirmação</h4>
              </div>
              <button onClick={() => setEditingRsvp(null)} className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEditedRsvp(); }} className="p-5 space-y-4">
              {/* Name (read-only) */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Convidado</label>
                <p className="font-semibold text-slate-800 text-sm">{editingRsvp.name}</p>
              </div>
              {/* Adults */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Adultos</label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => { const v = Math.max(1, (editingRsvp.adultsCount||1) - 1); setEditingRsvp(prev => { const companions = [...(prev.companionNames||[])]; const total = v + (prev.childrenCount||0); const needed = Math.max(0, total-1); while(companions.length < needed) companions.push(''); return {...prev, adultsCount: v, companionNames: companions.slice(0, needed)}; }); }} className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 transition">-</button>
                  <span className="w-8 text-center font-bold text-slate-800">{editingRsvp.adultsCount||1}</span>
                  <button type="button" onClick={() => { setEditingRsvp(prev => { const v = (prev.adultsCount||1) + 1; const companions = [...(prev.companionNames||[])]; const total = v + (prev.childrenCount||0); const needed = Math.max(0, total-1); while(companions.length < needed) companions.push(''); return {...prev, adultsCount: v, companionNames: companions.slice(0, needed)}; }); }} className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 transition">+</button>
                </div>
              </div>
              {/* Children */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Crianças</label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => { setEditingRsvp(prev => { const v = Math.max(0, (prev.childrenCount||0) - 1); const companions = [...(prev.companionNames||[])]; const total = (prev.adultsCount||1) + v; const needed = Math.max(0, total-1); while(companions.length < needed) companions.push(''); return {...prev, childrenCount: v, companionNames: companions.slice(0, needed)}; }); }} className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 transition">-</button>
                  <span className="w-8 text-center font-bold text-slate-800">{editingRsvp.childrenCount||0}</span>
                  <button type="button" onClick={() => { setEditingRsvp(prev => { const v = (prev.childrenCount||0) + 1; const companions = [...(prev.companionNames||[])]; const total = (prev.adultsCount||1) + v; const needed = Math.max(0, total-1); while(companions.length < needed) companions.push(''); return {...prev, childrenCount: v, companionNames: companions.slice(0, needed)}; }); }} className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 transition">+</button>
                </div>
              </div>
              {/* Companions */}
              {(editingRsvp.companionNames||[]).length > 0 && (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Nomes dos Acompanhantes</label>
                  <div className="space-y-2">
                    {(editingRsvp.companionNames||[]).map((name, i) => (
                      <input key={i} type="text" value={name} onChange={(e) => { const next = [...(editingRsvp.companionNames||[])]; next[i] = e.target.value; setEditingRsvp(prev => ({...prev, companionNames: next})); }} placeholder={`Nome do acompanhante ${i+1}`} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blush-400 focus:ring-2 focus:ring-blush-100 transition" />
                    ))}
                  </div>
                </div>
              )}
              {/* Phone */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">WhatsApp / Telefone</label>
                <input type="text" value={editingRsvp.phone||''} onChange={(e) => setEditingRsvp(prev => ({...prev, phone: e.target.value}))} placeholder="(00) 00000-0000" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blush-400 focus:ring-2 focus:ring-blush-100 transition" />
              </div>
              {/* Message */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Recado com Carinho</label>
                <textarea rows="3" value={editingRsvp.message||''} onChange={(e) => setEditingRsvp(prev => ({...prev, message: e.target.value}))} placeholder="Recado deixado pelo convidado..." className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl resize-none outline-none focus:border-blush-400 focus:ring-2 focus:ring-blush-100 transition" />
              </div>
              {/* Buttons */}
              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 py-3 rounded-2xl bg-blush-500 hover:bg-blush-600 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-blush-500/20 transition flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4" /> Salvar Alterações
                </button>
                <button type="button" onClick={() => setEditingRsvp(null)} className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm transition">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        isDestructive={confirmModal.isDestructive}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmModal}
      />

    </div>
  );
}
