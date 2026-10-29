import React, { useState, useEffect, Suspense, lazy } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import HeroSkeleton from './components/HeroSkeleton';
import EventDetails from './components/EventDetails';
import MessagesWall from './components/MessagesWall';
import PhotoAlbum from './components/PhotoAlbum';
import ScrollButtons from './components/ScrollButtons';
import MobileFloatingCTA from './components/MobileFloatingCTA';
import Footer from './components/Footer';
import { storageService } from './services/storageService';
import { useDarkMode } from './hooks/useDarkMode';
import { ToastProvider } from './components/ui/ToastProvider';
import FloatingAmbientParticles from './components/hero/FloatingAmbientParticles';

// Lazy load AdminPanel to dramatically reduce initial guest bundle size
const AdminPanel = lazy(() => import('./components/AdminPanel'));

export default function App() {
  const { isDark, toggle: toggleDark } = useDarkMode();
  const [config, setConfig] = useState(storageService.getConfig());
  const [gifts, setGifts] = useState(storageService.getGifts());
  const [rsvps, setRsvps] = useState(storageService.getRSVPs());
  const [messages, setMessages] = useState(storageService.getMessages());
  const [pledges, setPledges] = useState(storageService.getPledges?.() || []);
  const [isInitialLoading, setIsInitialLoading] = useState(storageService.isCloudConnected);
  const [initialSyncError, setInitialSyncError] = useState(false);

  const [activeTab, setActiveTab] = useState('inicio');

  // Modals state
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Sync with localStorage, Supabase and custom events
  useEffect(() => {
    const handleConfigUpdate = (e) => setConfig(e.detail);
    const handleGiftsUpdate = (e) => setGifts(e.detail);
    const handleRSVPsUpdate = (e) => setRsvps(e.detail);
    const handleMessagesUpdate = (e) => setMessages(e.detail);
    const handlePledgesUpdate = (e) => setPledges(e.detail);

    window.addEventListener('config_updated', handleConfigUpdate);
    window.addEventListener('gifts_updated', handleGiftsUpdate);
    window.addEventListener('rsvps_updated', handleRSVPsUpdate);
    window.addEventListener('messages_updated', handleMessagesUpdate);
    window.addEventListener('pledges_updated', handlePledgesUpdate);

    // Conectar ao Supabase em tempo real se configurado
    let unsubscribeRealtime = null;
    storageService.initRealtimeSync((cloudData) => {
      if (cloudData.config) setConfig(cloudData.config);
      if (cloudData.gifts) setGifts(cloudData.gifts);
      if (cloudData.rsvps) setRsvps(cloudData.rsvps);
      if (cloudData.messages) setMessages(cloudData.messages);
      if (cloudData.pledges) setPledges(cloudData.pledges);
      setIsInitialLoading(false);
    }).then(unsub => {
      unsubscribeRealtime = unsub;
      // End initial loading if sync completed or local
      setIsInitialLoading(false);
    }).catch(() => {
      setInitialSyncError(storageService.isCloudConnected);
      setIsInitialLoading(false);
    });

    return () => {
      window.removeEventListener('config_updated', handleConfigUpdate);
      window.removeEventListener('gifts_updated', handleGiftsUpdate);
      window.removeEventListener('rsvps_updated', handleRSVPsUpdate);
      window.removeEventListener('messages_updated', handleMessagesUpdate);
      window.removeEventListener('pledges_updated', handlePledgesUpdate);
      if (typeof unsubscribeRealtime === 'function') {
        unsubscribeRealtime();
      }
    };
  }, []);

  // Gift actions
  const handleDeletePledge = async (pledgeId) => {
    const updated = await storageService.deletePledge(pledgeId);
    if (Array.isArray(updated)) setPledges(updated);
  };

  const handleCancelReservation = async (giftId) => {
    const updated = await storageService.cancelReservation(giftId);
    if (Array.isArray(updated)) setGifts(updated);
  };

  const handleAddGift = async (newGift) => {
    const updated = await storageService.addGift(newGift);
    if (Array.isArray(updated)) setGifts(updated);
  };

  const handleUpdateGift = async (giftId, fields) => {
    const updated = await storageService.updateGift(giftId, fields);
    if (Array.isArray(updated)) setGifts(updated);
  };

  const handleDeleteGift = async (giftId) => {
    const updated = await storageService.deleteGift(giftId);
    if (Array.isArray(updated)) setGifts(updated);
  };

  const handleResetGifts = async () => {
    const updated = await storageService.resetGiftsToDefault();
    if (Array.isArray(updated)) setGifts(updated);
  };

  // RSVP actions
  const handleDeleteRSVP = async (rsvpId) => {
    const updated = await storageService.deleteRSVP(rsvpId);
    if (Array.isArray(updated)) setRsvps(updated);
  };

  const handleUpdateRSVP = async (rsvpId, fields) => {
    const updated = await storageService.updateRSVP(rsvpId, fields);
    if (Array.isArray(updated)) setRsvps(updated);
  };

  // Messages actions
  const handleAddMessage = async (msgData) => {
    const newMsg = await storageService.addMessage(msgData);
    if (newMsg) {
      setMessages(storageService.getMessages());
    }
  };

  // Aprovar/excluir atualizam a tela na hora e só voltam atrás se o servidor recusar.
  const handleApproveMessage = async (msgId) => {
    const previous = messages;
    setMessages((current) => current.map((m) => (m.id === msgId ? { ...m, status: 'approved' } : m)));
    try {
      const updated = await storageService.approveMessage(msgId);
      if (Array.isArray(updated)) setMessages(updated);
    } catch (error) {
      setMessages(previous);
      throw error;
    }
  };

  const handleLikeMessage = async (msgId, delta = 1) => {
    const updated = await storageService.likeMessage(msgId, delta);
    if (Array.isArray(updated)) setMessages(updated);
  };

  const handleDeleteMessage = async (msgId) => {
    const previous = messages;
    setMessages((current) => current.filter((m) => m.id !== msgId));
    try {
      const updated = await storageService.deleteMessage(msgId);
      if (Array.isArray(updated)) setMessages(updated);
    } catch (error) {
      setMessages(previous);
      throw error;
    }
  };

  const handleUpdateMessage = async (msgId, fields) => {
    const updated = await storageService.updateMessage(msgId, fields);
    if (Array.isArray(updated)) setMessages(updated);
  };

  // Config actions
  const handleSaveConfig = async (newConfig, newPin = '') => {
    const updated = await storageService.saveConfig(newConfig, newPin);
    if (updated) setConfig(updated);
  };



  const scrollToSection = (id) => {
    setActiveTab(id);
    const elem = document.getElementById(id);
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  // Pré-visualização do skeleton em desenvolvimento: http://localhost:3000/?skeleton
  const previewSkeleton = import.meta.env.DEV && new URLSearchParams(window.location.search).has('skeleton');

  if (previewSkeleton || (isInitialLoading && storageService.isCloudConnected)) {
    return <HeroSkeleton />;
  }

  if (initialSyncError && storageService.isCloudConnected) {
    return (
      <main className="min-h-screen grid place-items-center bg-[#fffaf5] px-6 text-center text-slate-700">
        <div role="alert" className="max-w-md space-y-4">
          <h1 className="text-xl font-semibold">Não foi possível carregar as informações do evento.</h1>
          <p className="text-sm">Confira sua conexão e tente novamente.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
          >
            Tentar novamente
          </button>
        </div>
      </main>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-baby-pattern flex flex-col justify-between relative overflow-x-hidden">
        {/* Full-site ambient floating elements (hearts, stars, clouds, sparkles, cute teddy bears) */}
        <FloatingAmbientParticles />

        {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAdmin={() => setIsAdminOpen(true)}
        isDark={isDark}
        onToggleDark={toggleDark}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          config={config}
          onNavigateToGifts={() => scrollToSection('fotos')}
          onNavigateToRSVP={() => scrollToSection('recados')}
        />

        {/* Event Details Section */}
        <EventDetails config={config} />
        <PhotoAlbum />

        {/* Guestbook / Messages Wall */}
        <MessagesWall
          messages={messages}
          onAddMessage={handleAddMessage}
          onLikeMessage={handleLikeMessage}
        />
      </main>

      {isAdminOpen && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
              <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blush-100 text-blush-600 mx-auto flex items-center justify-center animate-spin">
                  <div className="w-6 h-6 border-2 border-blush-600 border-t-transparent rounded-full" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-slate-800">Carregando Painel</h4>
                  <p className="text-xs text-slate-500 mt-1">Preparando o painel de administração...</p>
                </div>
              </div>
            </div>
          }
        >
          <AdminPanel
            isOpen={isAdminOpen}
            onClose={() => setIsAdminOpen(false)}
            config={config}
            onSaveConfig={handleSaveConfig}
            gifts={gifts}
            pledges={pledges}
            onAddGift={handleAddGift}
            onUpdateGift={handleUpdateGift}
            onDeleteGift={handleDeleteGift}
            onCancelReservation={handleCancelReservation}
            onResetGifts={handleResetGifts}
            onDeletePledge={handleDeletePledge}
            rsvps={rsvps}
            onDeleteRSVP={handleDeleteRSVP}
            onUpdateRSVP={handleUpdateRSVP}
            messages={messages}
            onApproveMessage={handleApproveMessage}
            onDeleteMessage={handleDeleteMessage}
            onUpdateMessage={handleUpdateMessage}
          />
        </Suspense>
      )}

      {/* Floating Quick Scroll Buttons */}
      <ScrollButtons />

      {/* Mobile Sticky Action Bar */}
      <MobileFloatingCTA
        onNavigateToGifts={() => scrollToSection('fotos')}
        onNavigateToRSVP={() => scrollToSection('recados')}
      />

      {/* Footer */}
      <Footer
        config={config}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      </div>
    </ToastProvider>
  );
}
