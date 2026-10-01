import React, { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '../utils/cn';
import { toast } from './toastStore';

export interface CopyButtonProps {
  value: string;
  /** Accessible name, e.g. "Copy invitation link" */
  label: string;
  /** Toast shown after copying; omit for a silent copy */
  successMessage?: string;
  className?: string;
}

/** Icon button that copies `value` to the clipboard and confirms with a check mark. */
export const CopyButton: React.FC<CopyButtonProps> = ({ value, label, successMessage, className }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async (event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (successMessage) toast.success(successMessage);
    } catch {
      toast.error("Couldn't copy. Select the text and copy it manually.");
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900',
        copied && 'text-emerald-600 hover:text-emerald-600',
        className,
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
};

export default CopyButton;
