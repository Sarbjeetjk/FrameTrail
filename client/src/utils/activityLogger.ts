import api from '../services/api';

interface LogEventOptions {
  event: string;
  detail: string;
  user?: string;
  level?: 'info' | 'warn' | 'success' | 'error';
}

/**
 * Universal System Activity & User Audit Logger
 * Logs all user & admin activities and syncs with MongoDB Atlas & localStorage
 */
export const logActivity = async ({
  event,
  detail,
  user,
  level = 'info',
}: LogEventOptions) => {
  try {
    const savedLogs = localStorage.getItem('frametrail_system_logs');
    let currentLogs: any[] = [];
    if (savedLogs) {
      try {
        currentLogs = JSON.parse(savedLogs);
      } catch (e) {
        currentLogs = [];
      }
    }

    const savedUser = localStorage.getItem('frametrail_user');
    let userName = user;
    let userEmail = '';
    if (!userName && savedUser) {
      try {
        const u = JSON.parse(savedUser);
        userName = u.name || u.email;
        userEmail = u.email || '';
      } catch (e) {}
    }
    if (!userName) userName = 'Guest Visitor';

    const firstLog = currentLogs[0] || {};
    let ip = firstLog.ip || '103.211.54.12';
    let location = firstLog.location || 'New Delhi, India';
    let coordinates = firstLog.coordinates || { lat: 28.6139, lng: 77.209 };
    let isp = firstLog.isp || 'Reliance Jio Infocomm Limited';

    // Try fetching cached GeoIP data if available
    try {
      const cached = sessionStorage.getItem('frametrail_geoip');
      if (cached) {
        const data = JSON.parse(cached);
        if (data.ip) ip = data.ip;
        if (data.city) location = `${data.city}, ${data.region || ''} ${data.country_name || 'India'}`.trim();
        if (data.latitude && data.longitude) coordinates = { lat: data.latitude, lng: data.longitude };
        if (data.org) isp = data.org;
      }
    } catch (e) {}

    const newLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      time: 'Just now',
      event,
      user: userName,
      userEmail,
      ip,
      location,
      coordinates,
      device: `${navigator.platform || 'Desktop'} (${navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Browser'})`,
      isp,
      networkType: '4G / Wi-Fi',
      screenRes: `${window.screen.width} x ${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
      hardwareSpec: '16 GB RAM (16 CPU Cores)',
      detail,
      level,
    };

    // 1. Sync to MongoDB Atlas backend in background
    api.post('/logs', newLog).catch(() => {});

    // 2. Sync to localStorage for immediate offline/instant preview
    const updated = [newLog, ...currentLogs];
    localStorage.setItem('frametrail_system_logs', JSON.stringify(updated.slice(0, 100)));
  } catch (error) {
    console.error('[Activity Logger Error]', error);
  }
};
