export interface ParsedClientInfo {
  browser: string;
  os: string;
  device: string;
}

export function parseUserAgent(ua?: string): ParsedClientInfo {
  if (!ua || typeof ua !== 'string') {
    return { browser: 'Unknown Browser', os: 'Unknown OS', device: 'Desktop' };
  }

  // Detect Operating System
  let os = 'Unknown OS';
  if (/windows phone/i.test(ua)) os = 'Windows Phone';
  else if (/win(dows|98|nt|95)/i.test(ua)) {
    if (/nt 10.0/i.test(ua)) os = 'Windows 10/11';
    else if (/nt 6.3/i.test(ua)) os = 'Windows 8.1';
    else if (/nt 6.2/i.test(ua)) os = 'Windows 8';
    else if (/nt 6.1/i.test(ua)) os = 'Windows 7';
    else os = 'Windows';
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = 'macOS';
  } else if (/android/i.test(ua)) {
    os = 'Android';
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    os = 'iOS';
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
  }

  // Detect Browser
  let browser = 'Unknown Browser';
  if (/edg([ea]|ios)?\/([0-9.]+)/i.test(ua)) {
    const match = ua.match(/edg([ea]|ios)?\/([0-9.]+)/i);
    browser = `Edge ${match ? match[2].split('.')[0] : ''}`.trim();
  } else if (/opr\/([0-9.]+)/i.test(ua)) {
    const match = ua.match(/opr\/([0-9.]+)/i);
    browser = `Opera ${match ? match[1].split('.')[0] : ''}`.trim();
  } else if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) {
    const match = ua.match(/(?:chrome|crios)\/([0-9.]+)/i);
    browser = `Chrome ${match ? match[1].split('.')[0] : ''}`.trim();
  } else if (/firefox|fxios/i.test(ua)) {
    const match = ua.match(/(?:firefox|fxios)\/([0-9.]+)/i);
    browser = `Firefox ${match ? match[1].split('.')[0] : ''}`.trim();
  } else if (/version\/([0-9.]+).*safari/i.test(ua)) {
    const match = ua.match(/version\/([0-9.]+)/i);
    browser = `Safari ${match ? match[1].split('.')[0] : ''}`.trim();
  } else if (/safari/i.test(ua)) {
    browser = 'Safari';
  }

  // Detect Device
  let device = 'Desktop';
  if (/tablet|ipad/i.test(ua)) device = 'Tablet';
  else if (/mobile|phone|android|iphone/i.test(ua)) device = 'Mobile';

  return { browser, os, device };
}
