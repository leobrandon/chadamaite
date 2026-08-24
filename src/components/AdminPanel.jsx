import React, { useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { storageService } from '../services/storageService';
import ConfirmModal from './ConfirmModal';

// Subcomponents
import AdminLogin from './admin/AdminLogin';
import AdminHeader from './admin/AdminHeader';
import AdminStats from './admin/AdminStats';
import AdminGiftsReportTab from './admin/AdminGiftsReportTab';
import AdminRSVPTab from './admin/AdminRSVPTab';
import AdminGiftsManageTab from './admin/AdminGiftsManageTab';
import AdminConfigTab from './admin/AdminConfigTab';
import AdminMessagesTab from './admin/AdminMessagesTab';

// Modals
import AdminEditGiftModal from './admin/modals/AdminEditGiftModal';
import AdminEditRsvpModal from './admin/modals/AdminEditRsvpModal';
import AdminEditMessageModal from './admin/modals/AdminEditMessageModal';
import { verifyAdminPin } from '../utils/security';

export default function AdminPanel({ 
  isOpen, 
  onClose, 
  config, 
  onSaveConfig, 
  gifts = [], 
  onAddGift, 
  onUpdateGift, 
  onDeleteGift, 
  onCancelReservation,
  onResetGifts,
  pledges = [],
  onDeletePledge,
  rsvps = [], 
  onDeleteRSVP, 
  onUpdateRSVP,
  messages = [], 
  onApproveMessage,
  onDeleteMessage,
  onUpdateMessage,
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

  // Edit states for modals
  const [editingGift, setEditingGift] = useState(null);
  const [editingRsvp, setEditingRsvp] = useState(null);
  const [isSavingRsvp, setIsSavingRsvp] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [isSavingMessage, setIsSavingMessage] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    const entered = pinInput.trim();
    const storedHash = config?.adminPinHash || config?.adminPin;

    const isValid = await verifyAdminPin(entered, storedHash);

    if (isValid) {
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

  const handleLock = () => {
    try {
      sessionStorage.removeItem('cha_maite_admin_auth');
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setPinInput('');
    setPinError(false);
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
      displayOrder: Number(editingGift.displayOrder) || 999,
    });
    setEditingGift(null);
  };

  const handleSaveEditedRsvp = async () => {
    if (!editingRsvp) return;
    const name = (editingRsvp.name || '').trim();
    if (!name) return;

    setIsSavingRsvp(true);
    try {
      await onUpdateRSVP(editingRsvp.id, {
        name,
        adultsCount: Number(editingRsvp.adultsCount) || 1,
        childrenCount: Number(editingRsvp.childrenCount) || 0,
        companionNames: (editingRsvp.companionNames || []).map((n) => n.trim()),
        phone: editingRsvp.phone || '',
        message: editingRsvp.message || '',
      });
      setEditingRsvp(null);
      setToastNotification({
        type: 'success',
        message: `Convidado "${name}" atualizado com sucesso!`,
      });
      setTimeout(() => setToastNotification(null), 3500);
    } catch (err) {
      console.error('Erro ao atualizar RSVP:', err);
      setToastNotification({
        type: 'error',
        message: 'Erro ao salvar alterações no banco. Tente novamente.',
      });
      setTimeout(() => setToastNotification(null), 3500);
    } finally {
      setIsSavingRsvp(false);
    }
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
  const attendingRSVPs = safeRsvps.filter((r) => r && r.attending);
  const totalAdults = attendingRSVPs.reduce((acc, curr) => acc + (curr.adultsCount || 1), 0);
  const totalChildren = attendingRSVPs.reduce((acc, curr) => acc + (curr.childrenCount || 0), 0);
  const totalGuests = totalAdults + totalChildren;

  const giftsWithPledgesCount = new Set(pledges.map((p) => p.giftId)).size;
  const availableGiftsCount = safeGifts.length - giftsWithPledgesCount;

  const pendingMessages = safeMessages.filter((m) => m && m.status === 'pending');
  const approvedMessages = safeMessages.filter((m) => m && m.status === 'approved');

  const handleExportGiftsPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const giftsWithPledges = safeGifts.filter((g) => pledges.some((p) => p.giftId === g.id));
    const totalPledges = pledges.length;
    const totalUnitsPledged = pledges.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);

    const giftBlocks = giftsWithPledges.map((gift) => {
      const giftPledges = pledges.filter((p) => p.giftId === gift.id);
      const totalUnits = giftPledges.reduce((sum, p) => sum + (Number(p.quantity) || 1), 0);
      const targetQty = Number(gift.targetQuantity) || 5;
      const isCompleted = totalUnits >= targetQty;
      const progressPercent = Math.min(100, Math.round((totalUnits / targetQty) * 100));

      const pledgeRows = giftPledges.map((p) => `
        <tr>
          <td style="padding: 6px 10px; border-bottom: 1px solid #f1f5f9; font-weight: 600;">${p.giverName || 'Convidado'}</td>
          <td style="padding: 6px 10px; border-bottom: 1px solid #f1f5f9; text-align: center;">${p.quantity} un.</td>
          <td style="padding: 6px 10px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #64748b;">
            ${p.createdAt ? new Date(p.createdAt).toLocaleDateString('pt-BR') : '-'}
          </td>
        </tr>
      `).join('');

      return `
        <div style="margin-bottom: 18px; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background: #ffffff; page-break-inside: avoid;">
          <div style="background: #fdf2f8; padding: 10px 14px; border-bottom: 1px solid #fbcfe8; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-size: 14px; font-weight: bold; color: #1e293b;">${gift.icon || '🎁'} ${gift.title}</span>
              <span style="font-size: 11px; color: #831843; margin-left: 8px;">(${gift.category})</span>
            </div>
            <div>
              <span style="font-size: 11px; font-weight: bold; color: #be185d;">
                ${totalUnits} de ${targetQty} un. (${progressPercent}%)
              </span>
              ${isCompleted ? '<span style="font-size: 10px; font-weight: bold; background: #d1fae5; color: #065f46; padding: 2px 6px; border-radius: 10px; margin-left: 6px;">Meta Atingida! 🎉</span>' : ''}
            </div>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="padding: 6px 10px; text-align: left; font-size: 10px; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0;">Convidado</th>
                <th style="padding: 6px 10px; text-align: center; font-size: 10px; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0;">Quantidade</th>
                <th style="padding: 6px 10px; text-align: right; font-size: 10px; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0;">Data</th>
              </tr>
            </thead>
            <tbody>
              ${pledgeRows}
            </tbody>
          </table>
        </div>
      `;
    }).join('');

    printWindow.document.write(`<!DOCTYPE html><html lang="pt-BR"><head>
      <meta charset="UTF-8">
      <title>Relatório de Presentes - Chá da Maitê</title>
      <style>
        @media print { body { -webkit-print-color-adjust: exact; color-adjust: exact; } }
        body { font-family: Arial, sans-serif; padding: 24px; color: #1e293b; }
        h1 { color: #f472b6; font-size: 22px; margin-bottom: 4px; }
        .subtitle { color: #64748b; font-size: 13px; margin-bottom: 20px; }
        .summary { display: flex; gap: 16px; margin-bottom: 20px; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 20px; text-align: center; }
        .card .num { font-size: 24px; font-weight: bold; color: #f472b6; }
        .card .label { font-size: 11px; color: #64748b; text-transform: uppercase; }
        .footer { margin-top: 24px; font-size: 10px; color: #94a3b8; text-align: right; }
      </style></head><body>
      <h1>🌸 Chá de Bebê da Maitê</h1>
      <p class="subtitle">Relatório: Contribuições por Presente • Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
      <div class="summary">
        <div class="card"><div class="num">${safeGifts.length}</div><div class="label">Total Itens</div></div>
        <div class="card"><div class="num">${giftsWithPledges.length}</div><div class="label">Itens Escolhidos</div></div>
        <div class="card"><div class="num">${totalPledges}</div><div class="label">Contribuições</div></div>
        <div class="card"><div class="num">${totalUnitsPledged}</div><div class="label">Unidades Dadas</div></div>
      </div>
      <div>${giftBlocks || '<p style="color: #64748b; font-size: 13px;">Nenhuma contribuição registrada ainda.</p>'}</div>
      <p class="footer">Chá da Maitê • Leonardo & Isabella • ${new Date().toLocaleDateString('pt-BR')}</p>
      </body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const totalAttending = attendingRSVPs.length;
    const notAttending = safeRsvps.filter((r) => !r.attending).length;
    const rows = safeRsvps.map((r) => `
      <tr>
        <td>${r.name}</td>
        <td style="text-align:center;">${r.attending ? '✅ Sim' : '❌ Não'}</td>
        <td style="text-align:center;">${r.attending ? (r.adultsCount || 0) : '-'}</td>
        <td style="text-align:center;">${r.attending ? (r.childrenCount || 0) : '-'}</td>
        <td>${(r.companionNames || []).join(', ') || '-'}</td>
        <td>${r.phone || '-'}</td>
        <td>${r.message || '-'}</td>
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/80 dark:bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-5xl rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[94dvh] sm:h-auto sm:max-h-[90dvh] overscroll-contain transition-all">
        
        {/* Header */}
        <AdminHeader
          isAuthenticated={isAuthenticated}
          onLock={handleLock}
          onClose={onClose}
        />

        {/* Auth Barrier */}
        {!isAuthenticated ? (
          <AdminLogin
            pinInput={pinInput}
            setPinInput={setPinInput}
            pinError={pinError}
            setPinError={setPinError}
            onLogin={handleLogin}
          />
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col min-h-0">
            
            {/* Top Stats Banner & Tab Navigation */}
            <AdminStats
              totalGuests={totalGuests}
              totalAdults={totalAdults}
              totalChildren={totalChildren}
              giftsWithPledgesCount={giftsWithPledgesCount}
              totalGiftsCount={safeGifts.length}
              availableGiftsCount={availableGiftsCount}
              totalMessagesCount={safeMessages.length}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              rsvpsCount={safeRsvps.length}
              pendingMessagesCount={pendingMessages.length}
              approvedMessagesCount={approvedMessages.length}
            />

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/40">
              
              {/* TAB 0: RELATÓRIO QUEM VAI DAR O QUÊ */}
              {activeTab === 'gifts-report' && (
                <AdminGiftsReportTab
                  gifts={safeGifts}
                  pledges={pledges}
                  onDeletePledge={onDeletePledge}
                  onExportPDF={handleExportGiftsPDF}
                  onExportCSV={handleExportGiftsCSV}
                  onRequestConfirm={requestConfirm}
                />
              )}
              
              {/* TAB 1: RSVPs */}
              {activeTab === 'rsvps' && (
                <AdminRSVPTab
                  rsvps={safeRsvps}
                  attendingRSVPs={attendingRSVPs}
                  totalGuests={totalGuests}
                  onExportPDF={handleExportPDF}
                  onExportCSV={handleExportCSV}
                  onEditRsvp={setEditingRsvp}
                  onDeleteRSVP={onDeleteRSVP}
                  onRequestConfirm={requestConfirm}
                />
              )}

              {/* TAB 2: GIFTS MANAGEMENT */}
              {activeTab === 'gifts' && (
                <AdminGiftsManageTab
                  gifts={safeGifts}
                  pledges={pledges}
                  onAddGift={onAddGift}
                  onEditGift={setEditingGift}
                  onResetGifts={onResetGifts}
                  onRequestConfirm={requestConfirm}
                />
              )}

              {/* TAB 3: CONFIG */}
              {activeTab === 'config' && (
                <AdminConfigTab
                  config={config}
                  onSaveConfig={onSaveConfig}
                />
              )}

              {/* TAB 4: MESSAGES MODERATION */}
              {activeTab === 'messages' && (
                <AdminMessagesTab
                  pendingMessages={pendingMessages}
                  approvedMessages={approvedMessages}
                  onApproveMessage={onApproveMessage}
                  onDeleteMessage={onDeleteMessage}
                  onEditMessage={setEditingMessage}
                  onRequestConfirm={requestConfirm}
                />
              )}

            </div>

          </div>
        )}

      </div>

      {/* Edit Gift Modal */}
      <AdminEditGiftModal
        editingGift={editingGift}
        setEditingGift={setEditingGift}
        onSaveEditedGift={handleSaveEditedGift}
        onDeleteGift={onDeleteGift}
        onRequestConfirm={requestConfirm}
      />

      {/* Edit RSVP Modal */}
      <AdminEditRsvpModal
        editingRsvp={editingRsvp}
        setEditingRsvp={setEditingRsvp}
        onSaveEditedRsvp={handleSaveEditedRsvp}
        isSaving={isSavingRsvp}
      />

      {/* Edit Message Modal */}
      <AdminEditMessageModal
        editingMessage={editingMessage}
        setEditingMessage={setEditingMessage}
        isSavingMessage={isSavingMessage}
        setIsSavingMessage={setIsSavingMessage}
        onUpdateMessage={onUpdateMessage}
      />

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

      {/* Toast Notification Alert */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-[70] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border animate-slide-up text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-700 dark:border-slate-200">
          {toastNotification.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 dark:text-rose-600 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 flex-shrink-0" />
          )}
          <span>{toastNotification.message}</span>
        </div>
      )}

    </div>
  );
}
