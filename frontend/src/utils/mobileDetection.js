// Mobile detection utilities for enhanced mobile app experience

export const isMobileDevice = () => {
  // Enhanced mobile detection with more comprehensive patterns
  const mobilePatterns = [
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i,
    /Mobile|Tablet|iPad|iPhone|iPod|Android|webOS|BlackBerry|Windows Phone/i,
    /Mobi|Tablet/i
  ];
  
  const userAgent = navigator.userAgent;
  const isMobileUA = mobilePatterns.some(pattern => pattern.test(userAgent));
  const isSmallScreen = window.innerWidth <= 768;
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  return isMobileUA || (isSmallScreen && hasTouch);
};

export const isIOS = () => {
  const userAgent = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(userAgent) || 
         (/Macintosh/.test(userAgent) && 'ontouchend' in document); // iPadOS detection
};

export const isAndroid = () => {
  return /Android/.test(navigator.userAgent);
};

export const isWebView = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const standalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSStandalone = isIOS() && (standalone || navigator.standalone);
  const isAndroidStandalone = isAndroid() && standalone;
  
  // Enhanced WebView detection patterns
  const webViewPatterns = [
    'wv', // Android WebView
    'fb_iab', // Facebook In-App Browser
    'fb4a', // Facebook App
    'twitter', // Twitter In-App Browser
    'instagram', // Instagram In-App Browser
    'line', // LINE In-App Browser
    'wechat', // WeChat In-App Browser
    'messenger', // Messenger In-App Browser
    'telegram', // Telegram In-App Browser
    'whatsapp', // WhatsApp In-App Browser
    'snapchat', // Snapchat In-App Browser
    'linkedin', // LinkedIn In-App Browser
    'kakaotalk', // KakaoTalk In-App Browser
    'naver', // Naver In-App Browser
    'samsung', // Samsung Browser
    'miui', // MIUI Browser
    'huawei', // Huawei Browser
    'oppo', // OPPO Browser
    'vivo', // VIVO Browser
    'xiaomi', // Xiaomi Browser
    'oneplus', // OnePlus Browser
    'firefox', // Firefox Mobile
    'crios', // Chrome iOS
    'gws', // Google WebView
    'gsa', // Google Search App
    'bing', // Bing App
    'yahoo', // Yahoo App
    'duckduckgo', // DuckDuckGo App
    'brave', // Brave Browser
    'vivaldi', // Vivaldi Browser
    'opera', // Opera Mobile
    'edge', // Edge Mobile
    'ucbrowser', // UC Browser
    'puffin', // Puffin Browser
    'maxthon', // Maxthon Browser
    'dolphin', // Dolphin Browser
    'silk', // Amazon Silk
    'blackberry', // BlackBerry Browser
    'tizen', // Tizen Browser
    'webos', // webOS Browser
    'bada', // Bada Browser
    'meego', // MeeGo Browser
    'sailfish', // Sailfish Browser
    'firefoxos', // Firefox OS Browser
    'kaios', // KaiOS Browser
    'nokia', // Nokia Browser
    'lg', // LG Browser
    'htc', // HTC Browser
    'motorola', // Motorola Browser
    'sony', // Sony Browser
    'asus', // ASUS Browser
    'acer', // Acer Browser
    'toshiba', // Toshiba Browser
    'fujitsu', // Fujitsu Browser
    'panasonic', // Panasonic Browser
    'sharp', // Sharp Browser
    'nec', // NEC Browser
    'casio', // Casio Browser
    'kyocera', // Kyocera Browser
    'pantech', // Pantech Browser
    'kyocera', // Kyocera Browser
    'palm', // Palm Browser
    'danger', // Danger Browser
    'hiptop', // Hiptop Browser
    'playbook', // BlackBerry PlayBook
    'rimtablet', // RIM Tablet
    'kindle', // Kindle Browser
    'silk-accelerated', // Amazon Silk Accelerated
    'safari-mobile', // Safari Mobile
    'chrome-mobile', // Chrome Mobile
    'firefox-mobile', // Firefox Mobile
    'edge-mobile', // Edge Mobile
    'opera-mobile', // Opera Mobile
    'samsungbrowser-mobile', // Samsung Browser Mobile
    'ucbrowser-mobile', // UC Browser Mobile
    'puffin-mobile', // Puffin Browser Mobile
    'maxthon-mobile', // Maxthon Browser Mobile
    'dolphin-mobile', // Dolphin Browser Mobile
    'silk-mobile', // Amazon Silk Mobile
    'blackberry-mobile', // BlackBerry Mobile
    'tizen-mobile', // Tizen Mobile
    'webos-mobile', // webOS Mobile
    'bada-mobile', // Bada Mobile
    'meego-mobile', // MeeGo Mobile
    'sailfish-mobile', // Sailfish Mobile
    'firefoxos-mobile', // Firefox OS Mobile
    'kaios-mobile', // KaiOS Mobile
    'nokia-mobile', // Nokia Mobile
    'lg-mobile', // LG Mobile
    'htc-mobile', // HTC Mobile
    'motorola-mobile', // Motorola Mobile
    'sony-mobile', // Sony Mobile
    'asus-mobile', // ASUS Mobile
    'acer-mobile', // Acer Mobile
    'toshiba-mobile', // Toshiba Mobile
    'fujitsu-mobile', // Fujitsu Mobile
    'panasonic-mobile', // Panasonic Mobile
    'sharp-mobile', // Sharp Mobile
    'nec-mobile', // NEC Mobile
    'casio-mobile', // Casio Mobile
    'kyocera-mobile', // Kyocera Mobile
    'pantech-mobile', // Pantech Mobile
    'palm-mobile', // Palm Mobile
    'danger-mobile', // Danger Mobile
    'hiptop-mobile', // Hiptop Mobile
    'playbook-mobile', // PlayBook Mobile
    'rimtablet-mobile', // RIM Tablet Mobile
    'kindle-mobile' // Kindle Mobile
  ];
  
  const isWebViewUA = webViewPatterns.some(pattern => userAgent.includes(pattern));
  
  // Additional WebView detection methods
  const hasLimitedStorage = () => {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return false;
    } catch (e) {
      return true;
    }
  };
  
  const hasLimitedWindow = () => {
    return !window.open || typeof window.open !== 'function';
  };
  
  const hasLimitedNavigator = () => {
    return !navigator.share || typeof navigator.share !== 'function';
  };
  
  return !isIOSStandalone && !isAndroidStandalone && 
         (isWebViewUA || hasLimitedStorage() || hasLimitedWindow() || hasLimitedNavigator());
};

export const getMobileOS = () => {
  if (isIOS()) return 'ios';
  if (isAndroid()) return 'android';
  if (isMobileDevice()) return 'mobile';
  return 'desktop';
};

export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  
  // Enhanced browser detection
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg') && !userAgent.includes('OPR') && !userAgent.includes('Samsung')) {
    browserName = 'Chrome';
    browserVersion = userAgent.match(/Chrome\/(\d+)/)?.[1];
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome') && !userAgent.includes('Chromium')) {
    browserName = 'Safari';
    browserVersion = userAgent.match(/Version\/(\d+)/)?.[1];
  } else if (userAgent.includes('Firefox') && !userAgent.includes('Seamonkey')) {
    browserName = 'Firefox';
    browserVersion = userAgent.match(/Firefox\/(\d+)/)?.[1];
  } else if (userAgent.includes('Edg') || userAgent.includes('Edge')) {
    browserName = 'Edge';
    browserVersion = userAgent.match(/(?:Edg|Edge)\/(\d+)/)?.[1];
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    browserName = 'Opera';
    browserVersion = userAgent.match(/(?:Opera|OPR)\/(\d+)/)?.[1];
  } else if (userAgent.includes('Samsung') || userAgent.includes('SamsungBrowser')) {
    browserName = 'Samsung';
    browserVersion = userAgent.match(/SamsungBrowser\/(\d+)/)?.[1];
  } else if (userAgent.includes('UCBrowser') || userAgent.includes('UC Browser')) {
    browserName = 'UC Browser';
    browserVersion = userAgent.match(/(?:UCBrowser|UC Browser)\/(\d+)/)?.[1];
  } else if (userAgent.includes('Puffin')) {
    browserName = 'Puffin';
    browserVersion = userAgent.match(/Puffin\/(\d+)/)?.[1];
  } else if (userAgent.includes('Dolphin')) {
    browserName = 'Dolphin';
    browserVersion = userAgent.match(/Dolphin\/(\d+)/)?.[1];
  } else if (userAgent.includes('Maxthon')) {
    browserName = 'Maxthon';
    browserVersion = userAgent.match(/Maxthon\/(\d+)/)?.[1];
  } else if (userAgent.includes('Silk')) {
    browserName = 'Silk';
    browserVersion = userAgent.match(/Silk\/(\d+)/)?.[1];
  } else if (userAgent.includes('BlackBerry')) {
    browserName = 'BlackBerry';
    browserVersion = userAgent.match(/BlackBerry\/(\d+)/)?.[1];
  } else if (userAgent.includes('Tizen')) {
    browserName = 'Tizen';
    browserVersion = userAgent.match(/Tizen\/(\d+)/)?.[1];
  } else if (userAgent.includes('webOS')) {
    browserName = 'webOS';
    browserVersion = userAgent.match(/webOS\/(\d+)/)?.[1];
  } else if (userAgent.includes('Bada')) {
    browserName = 'Bada';
    browserVersion = userAgent.match(/Bada\/(\d+)/)?.[1];
  } else if (userAgent.includes('MeeGo')) {
    browserName = 'MeeGo';
    browserVersion = userAgent.match(/MeeGo\/(\d+)/)?.[1];
  } else if (userAgent.includes('Sailfish')) {
    browserName = 'Sailfish';
    browserVersion = userAgent.match(/Sailfish\/(\d+)/)?.[1];
  } else if (userAgent.includes('FirefoxOS')) {
    browserName = 'FirefoxOS';
    browserVersion = userAgent.match(/FirefoxOS\/(\d+)/)?.[1];
  } else if (userAgent.includes('KaiOS')) {
    browserName = 'KaiOS';
    browserVersion = userAgent.match(/KaiOS\/(\d+)/)?.[1];
  } else if (userAgent.includes('Nokia')) {
    browserName = 'Nokia';
    browserVersion = userAgent.match(/Nokia\/(\d+)/)?.[1];
  } else if (userAgent.includes('LG')) {
    browserName = 'LG';
    browserVersion = userAgent.match(/LG\/(\d+)/)?.[1];
  } else if (userAgent.includes('HTC')) {
    browserName = 'HTC';
    browserVersion = userAgent.match(/HTC\/(\d+)/)?.[1];
  } else if (userAgent.includes('Motorola')) {
    browserName = 'Motorola';
    browserVersion = userAgent.match(/Motorola\/(\d+)/)?.[1];
  } else if (userAgent.includes('Sony')) {
    browserName = 'Sony';
    browserVersion = userAgent.match(/Sony\/(\d+)/)?.[1];
  } else if (userAgent.includes('ASUS')) {
    browserName = 'ASUS';
    browserVersion = userAgent.match(/ASUS\/(\d+)/)?.[1];
  } else if (userAgent.includes('Acer')) {
    browserName = 'Acer';
    browserVersion = userAgent.match(/Acer\/(\d+)/)?.[1];
  } else if (userAgent.includes('Toshiba')) {
    browserName = 'Toshiba';
    browserVersion = userAgent.match(/Toshiba\/(\d+)/)?.[1];
  } else if (userAgent.includes('Fujitsu')) {
    browserName = 'Fujitsu';
    browserVersion = userAgent.match(/Fujitsu\/(\d+)/)?.[1];
  } else if (userAgent.includes('Panasonic')) {
    browserName = 'Panasonic';
    browserVersion = userAgent.match(/Panasonic\/(\d+)/)?.[1];
  } else if (userAgent.includes('Sharp')) {
    browserName = 'Sharp';
    browserVersion = userAgent.match(/Sharp\/(\d+)/)?.[1];
  } else if (userAgent.includes('NEC')) {
    browserName = 'NEC';
    browserVersion = userAgent.match(/NEC\/(\d+)/)?.[1];
  } else if (userAgent.includes('Casio')) {
    browserName = 'Casio';
    browserVersion = userAgent.match(/Casio\/(\d+)/)?.[1];
  } else if (userAgent.includes('Kyocera')) {
    browserName = 'Kyocera';
    browserVersion = userAgent.match(/Kyocera\/(\d+)/)?.[1];
  } else if (userAgent.includes('Pantech')) {
    browserName = 'Pantech';
    browserVersion = userAgent.match(/Pantech\/(\d+)/)?.[1];
  } else if (userAgent.includes('Palm')) {
    browserName = 'Palm';
    browserVersion = userAgent.match(/Palm\/(\d+)/)?.[1];
  } else if (userAgent.includes('Danger')) {
    browserName = 'Danger';
    browserVersion = userAgent.match(/Danger\/(\d+)/)?.[1];
  } else if (userAgent.includes('Hiptop')) {
    browserName = 'Hiptop';
    browserVersion = userAgent.match(/Hiptop\/(\d+)/)?.[1];
  } else if (userAgent.includes('PlayBook')) {
    browserName = 'PlayBook';
    browserVersion = userAgent.match(/PlayBook\/(\d+)/)?.[1];
  } else if (userAgent.includes('Kindle')) {
    browserName = 'Kindle';
    browserVersion = userAgent.match(/Kindle\/(\d+)/)?.[1];
  }
  
  return {
    name: browserName,
    version: browserVersion,
    userAgent: userAgent
  };
};

export const getDeviceInfo = () => {
  return {
    isMobile: isMobileDevice(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    isWebView: isWebView(),
    os: getMobileOS(),
    browser: getBrowserInfo(),
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    pixelRatio: window.devicePixelRatio,
    touchSupport: 'ontouchstart' in window,
    orientation: window.screen.orientation?.type || 'unknown',
    connection: navigator.connection?.effectiveType || 'unknown',
    memory: navigator.deviceMemory || 'unknown',
    cores: navigator.hardwareConcurrency || 'unknown',
    language: navigator.language || 'unknown',
    languages: navigator.languages || [],
    platform: navigator.platform || 'unknown',
    vendor: navigator.vendor || 'unknown',
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack || 'unknown',
    onLine: navigator.onLine,
    javaEnabled: navigator.javaEnabled(),
    pdfViewerEnabled: navigator.pdfViewerEnabled,
    webdriver: navigator.webdriver || false
  };
};

export const getStorageInfo = () => {
  const info = {
    localStorage: 'available',
    sessionStorage: 'available',
    indexedDB: 'available',
    webSQL: 'unavailable',
    cookies: 'available',
    serviceWorkers: 'available'
  };
  
  // Test localStorage
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
  } catch (e) {
    info.localStorage = 'blocked';
  }
  
  // Test sessionStorage
  try {
    sessionStorage.setItem('test', 'test');
    sessionStorage.removeItem('test');
  } catch (e) {
    info.sessionStorage = 'blocked';
  }
  
  // Test IndexedDB
  if ('indexedDB' in window) {
    info.indexedDB = 'available';
  } else {
    info.indexedDB = 'unavailable';
  }
  
  // Test WebSQL
  if ('openDatabase' in window) {
    info.webSQL = 'available';
  }
  
  // Test cookies
  try {
    document.cookie = 'testcookie=1; SameSite=Strict';
    const cookieEnabled = document.cookie.indexOf('testcookie') !== -1;
    document.cookie = 'testcookie=1; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    info.cookies = cookieEnabled ? 'available' : 'blocked';
  } catch (e) {
    info.cookies = 'blocked';
  }
  
  // Test Service Workers
  if ('serviceWorker' in navigator) {
    info.serviceWorkers = 'available';
  } else {
    info.serviceWorkers = 'unavailable';
  }
  
  return info;
};

// Enhanced mobile-specific authentication helpers
export const getAuthMethod = () => {
  const isMobile = isMobileDevice();
  const isIOSDevice = isIOS();
  const isAndroidDevice = isAndroid();
  const isWebViewBrowser = isWebView();
  const browserInfo = getBrowserInfo();
  
  // Determine best authentication method based on device and browser
  if (isWebViewBrowser) {
    return 'redirect'; // Always use redirect for WebViews
  } else if (isIOSDevice) {
    return 'redirect'; // iOS works better with redirect
  } else if (isAndroidDevice && window.screen.width <= 768) {
    return 'redirect'; // Android mobile: use redirect
  } else if (isMobile) {
    return 'redirect'; // General mobile: prefer redirect
  } else if (browserInfo.name === 'Safari' || browserInfo.name === 'Firefox') {
    return 'redirect'; // Some desktop browsers work better with redirect
  } else {
    return 'popup'; // Desktop: use popup
  }
};

export const shouldUseRedirect = () => {
  return getAuthMethod() === 'redirect';
};

// Get device type
export const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) return 'mobile';
  return 'desktop';
};

// Get operating system
export const getOperatingSystem = () => {
  const ua = navigator.userAgent;
  if (/windows/i.test(ua)) return 'Windows';
  if (/mac/i.test(ua)) return 'MacOS';
  if (/linux/i.test(ua)) return 'Linux';
  if (/android/i.test(ua)) return 'Android';
  if (/ios|iphone|ipad|ipod/i.test(ua)) return 'iOS';
  return 'Unknown';
};

// Get browser name
export const getBrowserName = () => {
  const ua = navigator.userAgent;
  if (/chrome/.test(ua) && !/edg/.test(ua)) return 'Chrome';
  if (/safari/.test(ua) && !/chrome/.test(ua)) return 'Safari';
  if (/firefox/.test(ua)) return 'Firefox';
  if (/edg/.test(ua)) return 'Edge';
  if (/opera/.test(ua) || /opr/.test(ua)) return 'Opera';
  return 'Unknown';
};

// Check if touch device
export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Check if Safari
export const isSafari = () => {
  return /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
};

// Check if Chrome
export const isChrome = () => {
  return /Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent);
};

// Check if Firefox
export const isFirefox = () => {
  return /Firefox/.test(navigator.userAgent);
};

// Check if Edge
export const isEdge = () => {
  return /Edg/.test(navigator.userAgent);
};

// Get screen info
export const getScreenInfo = () => {
  return {
    width: window.screen.width,
    height: window.screen.height,
    availWidth: window.screen.availWidth,
    availHeight: window.screen.availHeight,
    colorDepth: window.screen.colorDepth,
    pixelDepth: window.screen.pixelDepth
  };
};

// Get network info
export const getNetworkInfo = () => {
  return {
    online: navigator.onLine,
    connection: navigator.connection || navigator.mozConnection || navigator.webkitConnection,
    language: navigator.language,
    languages: navigator.languages
  };
};

// Enhanced logDeviceInfo function
export const logDeviceInfo = () => {
  const deviceInfo = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine
  };

  const storageInfo = getStorageInfo();
  const authMethod = getAuthMethod();
  
  console.log('📱 Device Info:', deviceInfo);
  console.log('💾 Storage Info:', storageInfo);
  console.log('🔐 Recommended Auth Method:', authMethod);
  
  return { deviceInfo, storageInfo, authMethod };
};

const mobileDetectionUtils = {
  isMobileDevice,
  getDeviceType,
  getOperatingSystem,
  getBrowserName,
  isTouchDevice,
  isIOS,
  isAndroid,
  isSafari,
  isChrome,
  isFirefox,
  isEdge,
  getScreenInfo,
  getNetworkInfo,
  getAuthMethod,
  shouldUseRedirect,
  logDeviceInfo
};

export default mobileDetectionUtils;
