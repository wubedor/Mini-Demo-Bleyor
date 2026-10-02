import { isMobileDevice } from './mobileDetection';

/**
 * Detect if user should be redirected to mobile authentication
 * @returns {boolean} - True if user should use mobile auth
 */
export const shouldUseMobileAuth = () => {
  // Check if it's a mobile device
  if (!isMobileDevice()) {
    return false;
  }

  // Check if user is on a mobile browser (not WebView)
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Detect common mobile browsers
  const mobileBrowsers = [
    'mobile safari',
    'crios', // Chrome iOS
    'fxios', // Firefox iOS
    'edgios', // Edge iOS
    'samsungbrowser',
    'miuibrowser',
    'huaweibrowser',
    'oppobrowser',
    'vivobrowser',
    'xiaomibrowser'
  ];

  const isMobileBrowser = mobileBrowsers.some(browser => 
    userAgent.includes(browser)
  );

  // Also check for standalone web apps
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                      window.navigator.standalone === true;

  // Use mobile auth for mobile browsers and standalone apps
  return isMobileBrowser || isStandalone;
};

/**
 * Get the appropriate auth route based on device
 * @returns {string} - Route path for authentication
 */
export const getAuthRoute = () => {
  return shouldUseMobileAuth() ? '/mobile-auth' : '/login';
};

/**
 * Redirect to appropriate auth page
 * @param {function} navigate - React Router navigate function
 */
export const redirectToAuth = (navigate) => {
  const authRoute = getAuthRoute();
  navigate(authRoute);
};

/**
 * Check if device supports biometric authentication
 * @returns {Promise<boolean>} - True if biometrics are available
 */
export const checkBiometricSupport = async () => {
  try {
    // Check if WebAuthn is available
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      // Check for platform authenticator (biometrics)
      const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return available;
    }
    return false;
  } catch (error) {
    console.log('Biometric support check failed:', error);
    return false;
  }
};

/**
 * Get device-specific auth preferences
 * @returns {object} - Device-specific preferences
 */
export const getDeviceAuthPreferences = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  
  return {
    isIOS,
    isAndroid,
    prefersBiometric: isIOS || isAndroid,
    prefersGoogleSignIn: true,
    prefersEmailAuth: true,
    supportsRememberMe: true,
    supportsPasswordToggle: true,
    prefersLargeButtons: true,
    prefersLargeText: true,
    prefersSimpleLayout: true
  };
};

/**
 * Get mobile auth configuration
 * @returns {object} - Mobile auth configuration
 */
export const getMobileAuthConfig = () => {
  const preferences = getDeviceAuthPreferences();
  
  return {
    showBiometricOption: preferences.prefersBiometric,
    showGoogleSignIn: preferences.prefersGoogleSignIn,
    showEmailAuth: preferences.prefersEmailAuth,
    showRememberMe: preferences.supportsRememberMe,
    showPasswordToggle: preferences.supportsPasswordToggle,
    useLargeButtons: preferences.prefersLargeButtons,
    useLargeText: preferences.prefersLargeText,
    useSimpleLayout: preferences.prefersSimpleLayout,
    autoFocusEmail: true,
    autoCapitalizeName: true,
    autoCompleteEmail: true,
    autoCompletePassword: true,
    requireEmailVerification: false, // More lenient for mobile
    passwordMinLength: 6,
    passwordRequireNumbers: true,
    passwordRequireLetters: true,
    sessionTimeout: 30 * 24 * 60 * 60 * 1000, // 30 days
    enableBiometric: true,
    enableFaceID: preferences.isIOS,
    enableFingerprint: preferences.isAndroid,
    enableTouchID: preferences.isIOS
  };
};

/**
 * Initialize mobile auth detection
 * @param {function} navigate - React Router navigate function
 */
export const initializeMobileAuth = (navigate) => {
  // Check if we should redirect to mobile auth
  if (shouldUseMobileAuth()) {
    const currentPath = window.location.pathname;
    
    // Only redirect if not already on mobile auth or other auth pages
    if (!currentPath.includes('/mobile-auth') && 
        !currentPath.includes('/login') && 
        !currentPath.includes('/register') &&
        !currentPath.includes('/reset-password')) {
      
      console.log('📱 Mobile Auth: Redirecting to mobile authentication');
      redirectToAuth(navigate);
    }
  }
};

/**
 * Get mobile auth analytics data
 * @returns {object} - Analytics data for mobile auth
 */
export const getMobileAuthAnalytics = () => {
  return {
    userAgent: navigator.userAgent,
    isMobile: isMobileDevice(),
    shouldUseMobileAuth: shouldUseMobileAuth(),
    deviceType: getDeviceType(),
    browserType: getBrowserType(),
    platform: navigator.platform,
    language: navigator.language,
    timestamp: new Date().toISOString()
  };
};

/**
 * Get device type for analytics
 * @returns {string} - Device type
 */
const getDeviceType = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/iphone/.test(userAgent)) return 'iPhone';
  if (/ipad/.test(userAgent)) return 'iPad';
  if (/android/.test(userAgent)) return 'Android';
  if (/windows phone/.test(userAgent)) return 'Windows Phone';
  
  return 'Unknown';
};

/**
 * Get browser type for analytics
 * @returns {string} - Browser type
 */
const getBrowserType = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/chrome/.test(userAgent) && !/edg/.test(userAgent)) return 'Chrome';
  if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) return 'Safari';
  if (/firefox/.test(userAgent)) return 'Firefox';
  if (/edg/.test(userAgent)) return 'Edge';
  if (/opera/.test(userAgent) || /opr/.test(userAgent)) return 'Opera';
  
  return 'Unknown';
};

const mobileAuthUtils = {
  shouldUseMobileAuth,
  getAuthRoute,
  redirectToAuth,
  checkBiometricSupport,
  getDeviceAuthPreferences,
  getMobileAuthConfig,
  initializeMobileAuth,
  getMobileAuthAnalytics
};

export default mobileAuthUtils;
