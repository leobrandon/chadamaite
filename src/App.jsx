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

  // Sync with localStorage / custom events
  useEffect(() => {
    const handleConfigUpdate = (e) => setConfig(e.detail);
    const handleGiftsUpdate = (e) => setGifts(e.detail);
    const handleRSVPsUpdate = (e) => setRsvps(e.detail);
    const handleMessagesUpdate = (e) => setMessages(e.detail);

    window.addEventListener('config_updated', handleConfigUpdate);
    window.addEventListener('gifts_updated', handleGiftsUpdate);
    window.addEventListener('rsvps_updated', handleRSVPsUpdate);
    window.addEventListener('messages_updated', handleMessagesUpdate);

    return () => {
      window.removeEventListener('config_updated', handleConfigUpdate);
      window.removeEventListener('gifts_updated', handleGiftsUpdate);
      window.removeEventListener('rsvps_updated', handleRSVPsUpdate);
      window.removeEventListener('messages_updated', handleMessagesUpdate);
    };
  }, []);

  // Gift actions
  const handleSelectGift = (gift) => {
    setSelectedGiftForModal(gift);
  };

  const handleConfirmReservation = (giftId, guestName) => {
    const updated = storageService.reserveGift(giftId, guestName);
    setGifts(updated);
  };

  const handleCancelReservation = (giftId) => {
    const updated = storageService.cancelReservation(giftId);
    setGifts(updated);
  };

  const handleAddGift = (newGift) => {
    const updated = storageService.addGift(newGift);
    setGifts(updated);
  };

  const handleUpdateGift = (giftId, fields) => {
    const updated = storageService.updateGift(giftId, fields);
    setGifts(updated);
  };

  const handleDeleteGift = (giftId) => {
    const updated = storageService.deleteGift(giftId);
    setGifts(updated);
  };

  const handleResetGifts = () => {
    const updated = storageService.resetGiftsToDefault();
    setGifts(updated);
  };

  // RSVP actions
  const handleSaveRSVP = (rsvpData) => {
    storageService.saveRSVP(rsvpData);
  };

  const handleDeleteRSVP = (rsvpId) => {
    const updated = storageService.deleteRSVP(rsvpId);
    setRsvps(updated);
  };

  // Messages actions
  const handleAddMessage = (msgData) => {
    storageService.addMessage(msgData);
  };

  const handleLikeMessage = (msgId) => {
    const updated = storageService.likeMessage(msgId);
    setMessages(updated);
  };

  const handleDeleteMessage = (msgId) => {
    const updated = storageService.deleteMessage(msgId);
    setMessages(updated);
  };

  // Config actions
  const handleSaveConfig = (newConfig) => {
    storageService.saveConfig(newConfig);
    setConfig(newConfig);
  };

  const availableGiftsCount = gifts.filter(g => g.status === 'available').length;

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
        onDeleteMessage={handleDeleteMessage}
      />

      {/* Footer */}
      <Footer
        config={config}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

    </div>
  );
}
