import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import EventDetails from './components/EventDetails';
import GiftList from './components/GiftList';
import GiftModal from './components/GiftModal';
import RSVPSection from './components/RSVPSection';
import MessagesWall from './components/MessagesWall';
import AdminPanel from './components/AdminPanel';
import PixModal from './components/PixModal';
import ScrollButtons from './components/ScrollButtons';
import Footer from './components/Footer';
import { storageService } from './services/storageService';

export default function App() {
  const [config, setConfig] = useState(storageService.getConfig());
  const [gifts, setGifts] = useState(storageService.getGifts());
  const [rsvps, setRsvps] = useState(storageService.getRSVPs());
  const [messages, setMessages] = useState(storageService.getMessages());
  
  const [activeTab, setActiveTab] = useState('inicio');
  
  // Modals state
  const [selectedGiftForModal, setSelectedGiftForModal] = useState(null);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Sync with localStorage, Supabase and custom events
  useEffect(() => {
    const handleConfigUpdate = (e) => setConfig(e.detail);
    const handleGiftsUpdate = (e) => setGifts(e.detail);
    const handleRSVPsUpdate = (e) => setRsvps(e.detail);
    const handleMessagesUpdate = (e) => setMessages(e.detail);

    window.addEventListener('config_updated', handleConfigUpdate);
    window.addEventListener('gifts_updated', handleGiftsUpdate);
    window.addEventListener('rsvps_updated', handleRSVPsUpdate);
    window.addEventListener('messages_updated', handleMessagesUpdate);

    // Conectar ao Supabase em tempo real se configurado
    let unsubscribeRealtime = null;
    storageService.initRealtimeSync((cloudData) => {
      if (cloudData.config) setConfig(cloudData.config);
      if (cloudData.gifts) setGifts(cloudData.gifts);
      if (cloudData.rsvps) setRsvps(cloudData.rsvps);
      if (cloudData.messages) setMessages(cloudData.messages);
    }).then(unsub => {
      unsubscribeRealtime = unsub;
    });

    return () => {
      window.removeEventListener('config_updated', handleConfigUpdate);
      window.removeEventListener('gifts_updated', handleGiftsUpdate);
      window.removeEventListener('rsvps_updated', handleRSVPsUpdate);
      window.removeEventListener('messages_updated', handleMessagesUpdate);
      if (typeof unsubscribeRealtime === 'function') {
        unsubscribeRealtime();
      }
    };
  }, []);

  // Gift actions
  const handleSelectGift = (gift) => {
    setSelectedGiftForModal(gift);
  };

  const handleConfirmReservation = async (giftId, guestName) => {
    const updated = await storageService.reserveGift(giftId, guestName);
    if (Array.isArray(updated)) setGifts(updated);
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
  const handleSaveRSVP = async (rsvpData) => {
    await storageService.saveRSVP(rsvpData);
  };

  const handleDeleteRSVP = async (rsvpId) => {
    const updated = await storageService.deleteRSVP(rsvpId);
    if (Array.isArray(updated)) setRsvps(updated);
  };

  // Messages actions
  const handleAddMessage = async (msgData) => {
    await storageService.addMessage(msgData);
  };

  const handleApproveMessage = async (msgId) => {
    const updated = await storageService.approveMessage(msgId);
    if (Array.isArray(updated)) setMessages(updated);
  };

  const handleLikeMessage = async (msgId) => {
    const updated = await storageService.likeMessage(msgId);
    if (Array.isArray(updated)) setMessages(updated);
  };

  const handleDeleteMessage = async (msgId) => {
    const updated = await storageService.deleteMessage(msgId);
    if (Array.isArray(updated)) setMessages(updated);
  };

  // Config actions
  const handleSaveConfig = async (newConfig) => {
    const updated = await storageService.saveConfig(newConfig);
    if (updated) setConfig(updated);
  };

  const safeGifts = Array.isArray(gifts) ? gifts : [];
  const safeRsvps = Array.isArray(rsvps) ? rsvps : [];
  const safeMessages = Array.isArray(messages) ? messages : [];

  const availableGiftsCount = safeGifts.filter(g => g.status === 'available').length;

  const scrollToSection = (id) => {
    setActiveTab(id);
    const elem = document.getElementById(id);
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-baby-pattern flex flex-col justify-between">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAdmin={() => setIsAdminOpen(true)}
        totalGiftsAvailable={availableGiftsCount}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          config={config}
          onNavigateToGifts={() => scrollToSection('presentes')}
          onNavigateToRSVP={() => scrollToSection('rsvp')}
        />

        {/* Event Details Section */}
        <EventDetails
          config={config}
          onOpenPixModal={() => setIsPixModalOpen(true)}
        />

        {/* Gift Registry Section */}
        <GiftList
          gifts={gifts}
          onSelectGift={handleSelectGift}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />

        {/* RSVP Section */}
        <RSVPSection
          config={config}
          onSaveRSVP={handleSaveRSVP}
        />

        {/* Guestbook / Messages Wall */}
        <MessagesWall
          messages={messages}
          onAddMessage={handleAddMessage}
          onLikeMessage={handleLikeMessage}
        />
      </main>

      {/* Modals */}
      <GiftModal
        gift={selectedGiftForModal}
        isOpen={Boolean(selectedGiftForModal)}
        onClose={() => setSelectedGiftForModal(null)}
        onConfirm={handleConfirmReservation}
      />

      <PixModal
        isOpen={isPixModalOpen}
        onClose={() => setIsPixModalOpen(false)}
        config={config}
      />

      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        gifts={gifts}
        onAddGift={handleAddGift}
        onUpdateGift={handleUpdateGift}
        onDeleteGift={handleDeleteGift}
        onCancelReservation={handleCancelReservation}
        onResetGifts={handleResetGifts}
        rsvps={rsvps}
        onDeleteRSVP={handleDeleteRSVP}
        messages={messages}
        onApproveMessage={handleApproveMessage}
        onDeleteMessage={handleDeleteMessage}
      />

      {/* Floating Quick Scroll Buttons */}
      <ScrollButtons />

      {/* Footer */}
      <Footer
        config={config}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

    </div>
  );
}
