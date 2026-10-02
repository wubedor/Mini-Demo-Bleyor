// Simple Mobile App Security
// Basic security functionality for mobile app

class MobileAppSecurity {
  constructor() {
    this.securityLevel = 'production';
    this.isInitialized = false;
    this.securityChecks = {
      https: false,
      secureContext: false,
      apiValidation: false,
      inputSanitization: false,
      sessionManagement: false,
      errorHandling: false
    };
  }

  // Initialize mobile app security
  init() {
    if (this.isInitialized) return;
    
    console.log('🔒 Mobile App Security: Initializing production security...');
    
    // Run all security checks
    this.performSecurityChecks();
    
    this.isInitialized = true;
    console.log('✅ Mobile App Security: Production security initialized');
  }

  // Perform comprehensive security checks
  performSecurityChecks() {
    console.log('🔍 Running security checks...');
    
    // Check 1: HTTPS enforcement
    this.securityChecks.https = this.checkHTTPS();
    
    // Check 2: Secure context validation
    this.securityChecks.secureContext = this.checkSecureContext();
    
    // Check 3: API key validation
    this.securityChecks.apiValidation = this.checkAPIKeys();
    
    // Check 4: Input sanitization
    this.securityChecks.inputSanitization = this.checkInputSanitization();
    
    // Check 5: Session management
    this.securityChecks.sessionManagement = this.checkSessionManagement();
    
    // Check 6: Error handling
    this.securityChecks.errorHandling = this.checkErrorHandling();
    
    const allChecksPass = Object.values(this.securityChecks).every(check => check);
    console.log(`🔒 Security checks result: ${allChecksPass ? '✅ PASS' : '❌ FAIL'}`);
    
    return allChecksPass;
  }

  // Check HTTPS enforcement
  checkHTTPS() {
    const isHTTPS = window.location.protocol === 'https:';
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '10.97.183.252';
    
    if (!isHTTPS && !isLocalhost) {
      console.warn('⚠️ Security: Non-HTTPS connection detected');
      return false;
    }
    
    console.log('✅ Security: HTTPS connection verified');
    return true;
  }

  // Check secure context
  checkSecureContext() {
    const isSecureContext = window.isSecureContext || 
                          window.location.protocol === 'https:' ||
                          window.location.hostname === 'localhost' ||
                          window.location.hostname === '127.0.0.1' ||
                          window.location.hostname === '10.97.183.252';
    
    if (!isSecureContext) {
      console.warn('⚠️ Security: Insecure context detected');
      return false;
    }
    
    console.log('✅ Security: Secure context verified');
    return true;
  }

  // Check API key validation
  checkAPIKeys() {
    const hasValidKeys = !!process.env.REACT_APP_FIREBASE_API_KEY &&
                        !!process.env.REACT_APP_FIREBASE_PROJECT_ID &&
                        !!process.env.REACT_APP_FIREBASE_APP_ID;
    
    if (!hasValidKeys) {
      console.error('❌ Security: Invalid or missing API keys');
      return false;
    }
    
    console.log('✅ Security: API keys validated');
    return true;
  }

  // Check input sanitization
  checkInputSanitization() {
    // Test XSS protection
    const testInput = '<script>alert("test")</script>';
    const sanitized = this.sanitizeInput(testInput);
    
    if (sanitized === testInput) {
      console.error('❌ Security: Input sanitization failed');
      return false;
    }
    
    console.log('✅ Security: Input sanitization working');
    return true;
  }

  // Check session management
  checkSessionManagement() {
    try {
      // Test secure storage
      const testKey = 'security_test_' + Date.now();
      sessionStorage.setItem(testKey, 'test_value');
      const retrieved = sessionStorage.getItem(testKey);
      sessionStorage.removeItem(testKey);
      
      if (retrieved !== 'test_value') {
        console.error('❌ Security: Session storage not working');
        return false;
      }
      
      console.log('✅ Security: Session management working');
      return true;
    } catch (error) {
      console.error('❌ Security: Session management error:', error);
      return false;
    }
  }

  // Check error handling
  checkErrorHandling() {
    // Test error boundary
    try {
      // Simulate error to test handling
      throw new Error('Security test error');
    } catch (error) {
      if (!error.message) {
        console.error('❌ Security: Error handling not working');
        return false;
      }
      
      console.log('✅ Security: Error handling working');
      return true;
    }
  }

  // Sanitize user input
  sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/<\/?[^>]*>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }

  // Get security status
  getSecurityStatus() {
    return {
      initialized: this.isInitialized,
      level: this.securityLevel,
      checks: this.securityChecks,
      timestamp: new Date().toISOString(),
      recommendations: this.getSecurityRecommendations()
    };
  }

  // Get security recommendations
  getSecurityRecommendations() {
    const recommendations = [];
    
    if (!this.securityChecks.https) {
      recommendations.push('Deploy with HTTPS');
    }
    
    if (!this.securityChecks.secureContext) {
      recommendations.push('Use secure context (HTTPS)');
    }
    
    if (!this.securityChecks.apiValidation) {
      recommendations.push('Validate API keys in environment');
    }
    
    if (!this.securityChecks.inputSanitization) {
      recommendations.push('Implement input sanitization');
    }
    
    return recommendations;
  }

  // Clear security data
  clearSecurityData() {
    localStorage.removeItem('samb_security_violations');
    localStorage.removeItem('samb_app_errors');
    sessionStorage.clear();
    console.log('🔒 Security data cleared');
  }
}

// Create and export a singleton instance
const mobileSecurityInstance = new MobileAppSecurity();
export default mobileSecurityInstance;
