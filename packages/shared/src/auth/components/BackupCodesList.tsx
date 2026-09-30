import React, { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import Button from '../../../components/common/Button';
import Alert from '../../../components/feedback/Alert';

export interface BackupCodesListProps {
  codes: string[];
  onDone: () => void;
}

/** One-time display of freshly generated backup codes, with copy and download. */
export const BackupCodesList: React.FC<BackupCodesListProps> = ({ codes, onDone }) => {
  const [copied, setCopied] = useState(false);
  const text = codes.join('\n');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([`ZYLO backup codes\n\n${text}\n`], { type: 'text/plain' }));
    const link = Object.assign(document.createElement('a'), { href: url, download: 'zylo-backup-codes.txt' });
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Alert tone="warning" title="Save these backup codes now">
        Each code signs you in once if you lose your authenticator. They will not be shown again.
      </Alert>

      <ul className="grid grid-cols-2 gap-2 p-4 rounded-md bg-slate-50 border border-slate-200 font-mono text-sm text-slate-800">
        {codes.map((code) => (
          <li key={code} className="tracking-wider">{code}</li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={copy} leftIcon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}>
          {copied ? 'Copied' : 'Copy'}
        </Button>
        <Button variant="outline" size="sm" onClick={download} leftIcon={<Download className="w-3.5 h-3.5" />}>
          Download
        </Button>
        <Button variant="primary" size="sm" onClick={onDone}>
          I have saved them
        </Button>
      </div>
    </div>
  );
};

export default BackupCodesList;
