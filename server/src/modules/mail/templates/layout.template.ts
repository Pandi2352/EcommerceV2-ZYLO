export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

export interface LayoutOptions {
  appName: string;
  heading: string;
  /** Paragraphs of plain text (escaped before rendering) */
  paragraphs?: string[];
  /** Optional custom HTML content block to render inside the email body */
  contentHtml?: string;
  action?: { label: string; url: string };
  footnote?: string;
  maxWidth?: number;
}

/** Shared HTML shell for transactional emails. */
export function renderLayout(options: LayoutOptions): string {
  const { appName, heading, paragraphs = [], contentHtml, action, footnote, maxWidth = 560 } = options;
  const body = paragraphs
    .map((text) => `<p style="margin:0 0 16px;color:#334155;font-size:14px;line-height:1.6">${escapeHtml(text)}</p>`)
    .join('');
  const customHtml = contentHtml || '';
  const button = action
    ? `<p style="margin:24px 0"><a href="${escapeHtml(action.url)}" style="display:inline-block;background:#2A3B5C;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:6px">${escapeHtml(action.label)}</a></p>
       <p style="margin:0 0 16px;color:#64748b;font-size:12px;word-break:break-all">Or paste this link into your browser: ${escapeHtml(action.url)}</p>`
    : '';
  const note = footnote
    ? `<p style="margin:24px 0 0;color:#94a3b8;font-size:12px">${escapeHtml(footnote)}</p>`
    : '';

  return `<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:${maxWidth}px;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:32px">
<tr><td>
<p style="margin:0 0 24px;font-size:18px;font-weight:800;color:#2A3B5C;letter-spacing:1px">${escapeHtml(appName)}</p>
<h1 style="margin:0 0 16px;font-size:20px;color:#0f172a">${escapeHtml(heading)}</h1>
${body}${customHtml}${button}${note}
</td></tr></table></td></tr></table></body></html>`;
}

/** Plain-text alternative for clients that do not render HTML. */
export function renderText(options: LayoutOptions): string {
  const lines = [options.heading, '', ...(options.paragraphs || [])];
  if (options.action) lines.push('', `${options.action.label}: ${options.action.url}`);
  if (options.footnote) lines.push('', options.footnote);
  return lines.join('\n');
}
