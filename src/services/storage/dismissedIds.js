import { KEYS } from './keys.js';

export function createDismissedIdsApi() {
  return {
    getDismissedGiftIds: () => {
      try {
        const saved = localStorage.getItem(KEYS.DISMISSED_GIFTS);
        if (!saved) return [];
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    },

    getDismissedRSVPIds: () => {
      try {
        const saved = localStorage.getItem(KEYS.DISMISSED_RSVPS);
        if (!saved) return [];
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) return [];
        // Higieniza qualquer resíduo indevido de recados gravados erroneamente como RSVP
        const cleaned = parsed.filter(id => {
          const str = String(id || '');
          if (str.includes('8dd0513e-e2a8-4262-ae62-41108ff2794d')) return false;
          if (str.includes('msg-') || str.startsWith('dismissed-msg-')) return false;
          return true;
        });
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(KEYS.DISMISSED_RSVPS, JSON.stringify(cleaned));
        }
        return cleaned;
      } catch {
        return [];
      }
    },

    getDismissedMessageIds: () => {
      const defaultDismissed = [
        'test1-1789646180102',
        'test-approval-check-1',
        'msg-test-upsert-1789646339583',
        'rsvp-msg-flow-1789732791804',
        'msg-flow-1789732791804',
        'msg-rsvp-1bb3cd4d-97bc-4c08-a156-8b73808b39d5',
        'rsvp-1bb3cd4d-97bc-4c08-a156-8b73808b39d5',
      ];
      try {
        const saved = localStorage.getItem(KEYS.DISMISSED_MESSAGES);
        if (!saved) return defaultDismissed;
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(id => !String(id || '').includes('28bf3597-c708-44cd-b509-2eee0ae919ac'));
          defaultDismissed.forEach((id) => {
            if (!cleaned.includes(id)) cleaned.push(id);
          });
          return cleaned;
        }
        return defaultDismissed;
      } catch {
        return defaultDismissed;
      }
    },

    getDismissedPledgeIds: () => {
      try {
        const saved = localStorage.getItem(KEYS.DISMISSED_PLEDGES);
        if (!saved) return [];
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    },
  };
}
