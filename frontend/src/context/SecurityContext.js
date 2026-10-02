import React, { createContext, useContext, useState, useEffect } from 'react';

const SecurityContext = createContext();

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

export const SecurityProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userPermissions, setUserPermissions] = useState({});
  const [securityLevel, setSecurityLevel] = useState('public');
  const [auditLog, setAuditLog] = useState([]);

  // Security levels
  const SECURITY_LEVELS = {
    PUBLIC: 'public',
    USER: 'user',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin'
  };

  // Check if user is authenticated (backend-only mode)
  const isAuthenticated = () => {
    return localStorage.getItem('accessToken') !== null;
  };

  // Check if current user is admin (backend-only mode)
  const checkAdminStatus = () => {
    const userRole = localStorage.getItem('userRole');
    const isAdminUser = userRole === 'admin' || userRole === 'super_admin';
    setIsAdmin(isAdminUser);
    
    if (isAdminUser) {
      setSecurityLevel(userRole === 'super_admin' ? SECURITY_LEVELS.SUPER_ADMIN : SECURITY_LEVELS.ADMIN);
    } else if (isAuthenticated()) {
      setSecurityLevel(SECURITY_LEVELS.USER);
    } else {
      setSecurityLevel(SECURITY_LEVELS.PUBLIC);
    }
  };

  // Log security events
  const logSecurityEvent = (eventType, details = {}) => {
    const event = {
      timestamp: new Date().toISOString(),
      eventType,
      userId: currentUser?.id || 'anonymous',
      details
    };
    
    setAuditLog(prev => [...prev, event]);
    console.log('Security Event:', event);
  };

  // Check if user has required permission
  const hasPermission = (permission) => {
    if (!currentUser) return false;
    
    // Admins have all permissions
    if (isAdmin) return true;
    
    // Check user's specific permissions
    return userPermissions[permission] === true;
  };

  // Check if user has required role level
  const hasRoleLevel = (requiredRole) => {
    const roleHierarchy = {
      [SECURITY_LEVELS.PUBLIC]: 0,
      [SECURITY_LEVELS.USER]: 1,
      [SECURITY_LEVELS.ADMIN]: 2,
      [SECURITY_LEVELS.SUPER_ADMIN]: 3
    };

    const userRoleLevel = roleHierarchy[securityLevel] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

    return userRoleLevel >= requiredRoleLevel;
  };

  // Monitor auth state changes (backend-only mode)
  useEffect(() => {
    // Check for stored user data from backend authentication
    const userData = localStorage.getItem('userData');
    const userRole = localStorage.getItem('userRole');
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setCurrentUser(parsedUser);
        setIsAdmin(userRole === 'admin' || userRole === 'super_admin');
        setSecurityLevel(userRole === 'admin' || userRole === 'super_admin' ? SECURITY_LEVELS.ADMIN : SECURITY_LEVELS.AUTHENTICATED);
        logSecurityEvent('user_authenticated', { uid: parsedUser.id, email: parsedUser.email });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else {
      setIsAdmin(false);
      setSecurityLevel(SECURITY_LEVELS.PUBLIC);
      setUserPermissions({});
    }
  }, []);

  const value = {
    currentUser,
    isAdmin,
    securityLevel,
    userPermissions,
    auditLog,
    isAuthenticated,
    hasPermission,
    hasRoleLevel,
    logSecurityEvent,
    sanitizeInput: (input) => {
      if (typeof input !== 'string') return input;
      return input.replace(/[<>]/g, '');
    }
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};
