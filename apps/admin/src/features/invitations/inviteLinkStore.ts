import type { InvitationLinkResult } from '../../services/invitations.service';

export type ShownInviteLink = InvitationLinkResult & { resent: boolean };

// Tiny store so any action (invite drawer, resend in a table row) can open the link dialog
let current: ShownInviteLink | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export const inviteLinkDialog = {
  open(result: InvitationLinkResult, { resent = false } = {}) {
    current = { ...result, resent };
    emit();
  },
  close() {
    current = null;
    emit();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => current,
};
