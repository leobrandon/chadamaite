export const KEYS = {
  GIFTS: 'cha_maite_gifts_v1',
  RSVPS: 'cha_maite_rsvps_v1',
  CONFIG: 'cha_maite_config_v1',
  MESSAGES: 'cha_maite_messages_v1',
  PLEDGES: 'cha_maite_pledges_v1',
  LOGS: 'cha_maite_admin_logs_v1',
  DISMISSED_GIFTS: 'cha_maite_dismissed_gifts_v1',
  DISMISSED_RSVPS: 'cha_maite_dismissed_rsvps_v1',
  DISMISSED_MESSAGES: 'cha_maite_dismissed_messages_v1',
  DISMISSED_PLEDGES: 'cha_maite_dismissed_pledges_v1',
};

// Higienização automática e autocura do localStorage
(function selfHealLocalStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    // 1. Remove a chave corrompida literal 'undefined' gerada anteriormente
    window.localStorage.removeItem('undefined');

    // 2. Higieniza descartados de RSVPs para remover resíduos indevidos
    const rsvpDismissedStr = window.localStorage.getItem(KEYS.DISMISSED_RSVPS);
    if (rsvpDismissedStr) {
      try {
        const parsed = JSON.parse(rsvpDismissedStr);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(id => {
            const s = String(id || '');
            return !s.includes('28bf3597-c708-44cd-b509-2eee0ae919ac') &&
                   !s.startsWith('msg-') &&
                   !s.startsWith('dismissed-msg-');
          });
          window.localStorage.setItem(KEYS.DISMISSED_RSVPS, JSON.stringify(cleaned));
        }
      } catch {}
    }

    // 3. Higieniza descartados de recados para remover falso descarte
    const msgDismissedStr = window.localStorage.getItem(KEYS.DISMISSED_MESSAGES);
    if (msgDismissedStr) {
      try {
        const parsed = JSON.parse(msgDismissedStr);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(id => {
            const s = String(id || '');
            return !s.includes('28bf3597-c708-44cd-b509-2eee0ae919ac');
          });
          window.localStorage.setItem(KEYS.DISMISSED_MESSAGES, JSON.stringify(cleaned));
        }
      } catch {}
    }
  } catch {}
})();
