import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Check, Copy, Link2, X } from 'lucide-react';
import Button from '@shared/ui/Button';
import { formatDateTime } from '@shared/utils/format';
import { inviteLinkDialog, type ShownInviteLink } from '../inviteLinkStore';

/** Mount once (admin App). Shows a freshly issued invitation link with a copy button. */
export const InviteLinkDialogHost: React.FC = () => {
  const link = useSyncExternalStore(inviteLinkDialog.subscribe, inviteLinkDialog.getSnapshot, inviteLinkDialog.getSnapshot);
  // Keyed by URL so the "Copied" state starts fresh for every new link
  return link ? <InviteLinkCard key={link.inviteUrl} link={link} /> : null;
};

const InviteLinkCard: React.FC<{ link: ShownInviteLink }> = ({ link }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && inviteLinkDialog.close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link.inviteUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="invite-link-title">
      <div className="fixed inset-0 animate-fade-in bg-zinc-900/40" onClick={inviteLinkDialog.close} />
      <div className="relative w-full max-w-lg animate-pop-in rounded-xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-900/15">
        <div className="flex items-start gap-3 p-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Link2 className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 id="invite-link-title" className="text-[15px] font-semibold text-zinc-900">
              {link.resent ? 'New invitation link' : 'Invitation sent'}
            </h3>
            <p className="mt-1 text-[13px] text-zinc-600">
              We emailed <strong className="font-medium text-zinc-900">{link.email}</strong> to join as {link.roleName} (User ID <span className="font-mono text-xs">{link.userCode}</span>). You can
              also share this link directly. It works once and expires {formatDateTime(link.expiresAt)}.
            </p>
          </div>
          <button type="button" onClick={inviteLinkDialog.close} aria-label="Close" className="-mr-1 rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5">
          <div className="flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 p-1.5 pl-2.5">
            <input
              readOnly
              value={link.inviteUrl}
              aria-label="Invitation link"
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 bg-transparent font-mono text-xs text-zinc-700 outline-none"
            />
            <Button size="xs" variant={copied ? 'outline' : 'primary'} leftIcon={copied ? <Check /> : <Copy />} onClick={copy}>
              {copied ? 'Copied' : 'Copy link'}
            </Button>
          </div>
          <p className="mt-2 text-xs text-amber-700">
            This is the only time the link is shown. Treat it like a password: anyone with it can create this account.
          </p>
        </div>

        <div className="mt-4 flex justify-end border-t border-zinc-100 px-5 py-3">
          <Button size="sm" variant="outline" onClick={inviteLinkDialog.close}>
            Done
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default InviteLinkDialogHost;
