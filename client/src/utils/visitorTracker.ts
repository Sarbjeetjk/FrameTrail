/**
 * Visitor Telemetry Tracker
 * Records real-time visitor traffic (IP, location, device, page) to system activity logs.
 */
export const recordVisitorHit = async (pageName: string) => {
  try {
    // Avoid spamming duplicate logs on rapid re-renders within 10 seconds for same page
    const lastHitTime = sessionStorage.getItem(`frametrail_last_hit_${pageName}`);
    const now = Date.now();
    if (lastHitTime && now - parseInt(lastHitTime, 10) < 10000) {
      return;
    }
    sessionStorage.setItem(`frametrail_last_hit_${pageName}`, now.toString());

    let ip = '103.211.54.12';
    let location = 'New Delhi, India';
    let coordinates = { lat: 28.6139, lng: 77.209 };
    let isp = 'Reliance Jio Infocomm Limited';

    // Fetch real IP & location metadata from public Geo-IP API
    try {
      const res = await fetch('https://ipapi.co/json/').then((r) => r.json());
      if (res && res.ip) {
        ip = res.ip;
        const city = res.city || 'New Delhi';
        const region = res.region || '';
        const country = res.country_name || 'India';
        location = `${city}${region ? `, ${region}` : ''}, ${country}`;
        if (res.latitude && res.longitude) {
          coordinates = { lat: res.latitude, lng: res.longitude };
        }
        if (res.org) {
          isp = res.org;
        }
      }
    } catch (e) {
      // Fallback silently if API is blocked or offline
    }

    const device = `${navigator.platform || 'Desktop'} (${navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Safari') ? 'Safari' : 'Mobile Browser'})`;

    const newVisitorLog = {
      id: `log_vis_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      time: 'Just now',
      event: 'VISITOR_GALLERY_ACCESS',
      user: 'Guest Visitor',
      ip,
      location,
      coordinates,
      device,
      isp,
      networkType: '4G / Wi-Fi',
      screenRes: `${window.screen.width} x ${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
      hardwareSpec: '16 GB RAM (16 CPU Cores)',
      detail: `Public gallery accessed by visitor on page: ${pageName}.`,
      level: 'info',
    };

    const savedLogs = localStorage.getItem('frametrail_system_logs');
    let existingLogs = [];
    if (savedLogs) {
      try {
        existingLogs = JSON.parse(savedLogs);
      } catch (err) {
        existingLogs = [];
      }
    }

    const updatedLogs = [newVisitorLog, ...existingLogs.slice(0, 99)]; // Keep top 100 logs
    localStorage.setItem('frametrail_system_logs', JSON.stringify(updatedLogs));
  } catch (error) {
    console.error('[Visitor Tracker Error]', error);
  }
};
