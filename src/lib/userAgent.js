// Lightweight UA parser. Avoids the ua-parser-js dependency (~30kb) for our
// modest needs: showing a friendly device label in the Active Sessions list.
// Order matters — Edge masquerades as Chrome, Chrome masquerades as Safari, etc.

export const parseUserAgent = (ua) => {
  if (!ua || typeof ua !== 'string') return { browser: 'Unknown', os: 'Unknown', label: 'Unknown device' };

  let browser = 'Browser';
  if      (/Edg\//.test(ua))                  browser = 'Edge';
  else if (/OPR\//.test(ua))                  browser = 'Opera';
  else if (/Chrome\//.test(ua) && !/Edg/.test(ua)) browser = 'Chrome';
  else if (/Firefox\//.test(ua))              browser = 'Firefox';
  else if (/Safari\//.test(ua))               browser = 'Safari';

  let os = 'OS';
  if      (/Windows NT 10/.test(ua))          os = 'Windows';
  else if (/Windows/.test(ua))                os = 'Windows';
  else if (/Mac OS X/.test(ua))               os = 'macOS';
  else if (/Android/.test(ua))                os = 'Android';
  else if (/iPhone|iPad|iPod/.test(ua))       os = 'iOS';
  else if (/Linux/.test(ua))                  os = 'Linux';

  const isMobile = /Mobile|Android|iPhone|iPad|iPod/.test(ua);

  return {
    browser,
    os,
    isMobile,
    label: `${browser} on ${os}${isMobile ? ' · Mobile' : ''}`,
  };
};

// Friendly relative-time for "last active 3 hours ago".
export const timeAgo = (iso) => {
  if (!iso) return 'just now';
  const diff = Date.now() - new Date(iso).getTime();
  const sec  = Math.round(diff / 1000);
  if (sec < 60)        return 'just now';
  const min = Math.round(sec / 60);
  if (min < 60)        return `${min} minute${min === 1 ? '' : 's'} ago`;
  const hr = Math.round(min / 60);
  if (hr < 24)         return `${hr} hour${hr === 1 ? '' : 's'} ago`;
  const day = Math.round(hr / 24);
  if (day < 30)        return `${day} day${day === 1 ? '' : 's'} ago`;
  const mo = Math.round(day / 30);
  if (mo < 12)         return `${mo} month${mo === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString();
};
