import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { safeLocalStorage, safeSessionStorage } from '../utils/mobileSafeStorage';

// Initial state structure
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  storageWarning: false,
  storageType: 'localStorage'
};

// Action types
const actionTypes = {
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  LOGOUT: 'LOGOUT',
  SET_STORAGE_WARNING: 'SET_STORAGE_WARNING',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
        error: null
      };
    
    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: action.payload ? null : state.error
      };
    
    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    
    case actionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    
    case actionTypes.SET_STORAGE_WARNING:
      return {
        ...state,
        storageWarning: action.payload
      };
    
    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Safe state persistence
const persistState = (state) => {
  try {
    const stateToPersist = {
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      timestamp: Date.now()
    };
    
    // Try localStorage first
    if (safeLocalStorage.getStorageType() === 'localStorage') {
      safeLocalStorage.setItem('appState', JSON.stringify(stateToPersist));
    } else {
      // Fallback to sessionStorage
      safeSessionStorage.setItem('appState', JSON.stringify(stateToPersist));
    }
    
    return true;
  } catch (error) {
    console.warn('Failed to persist state:', error);
    return false;
  }
};

// Load persisted state
const loadPersistedState = () => {
  try {
    // Try localStorage first
    let storedState = safeLocalStorage.getItem('appState');
    let storageType = 'localStorage';
    
    if (!storedState) {
      // Fallback to sessionStorage
      storedState = safeSessionStorage.getItem('appState');
      storageType = 'sessionStorage';
    }
    
    if (storedState) {
      const parsedState = JSON.parse(storedState);
      
      // Check if state is recent (not older than 24 hours)
      const stateAge = Date.now() - (parsedState.timestamp || 0);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (stateAge < maxAge) {
        return {
          ...initialState,
          user: parsedState.user,
          isAuthenticated: parsedState.isAuthenticated,
          loading: false,
          storageType
        };
      }
    }
    
    return {
      ...initialState,
      storageType,
      storageWarning: true
    };
  } catch (error) {
    console.warn('Failed to load persisted state:', error);
    return {
      ...initialState,
      storageWarning: true
    };
  }
};

// Context provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, loadPersistedState());

  // Persist state changes
  useEffect(() => {
    if (state.user && state.isAuthenticated) {
      persistState(state);
    }
  }, [state.user, state.isAuthenticated]);

  // Monitor storage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'appState') {
        const newState = loadPersistedState();
        dispatch({
          type: actionTypes.SET_USER,
          payload: newState.user
        });
      }
    };

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Action creators
  const actions = {
    setUser: (user) => {
      dispatch({
        type: actionTypes.SET_USER,
        payload: user
      });
    },
    
    setLoading: (loading) => {
      dispatch({
        type: actionTypes.SET_LOADING,
        payload: loading
      });
    },
    
    setError: (error) => {
      dispatch({
        type: actionTypes.SET_ERROR,
        payload: error
      });
    },
    
    clearError: () => {
      dispatch({
        type: actionTypes.CLEAR_ERROR
      });
    },
    
    logout: () => {
      dispatch({
        type: actionTypes.LOGOUT
      });
      
      // Clear persisted state
      try {
        safeLocalStorage.removeItem('appState');
        safeSessionStorage.removeItem('appState');
      } catch (error) {
        console.warn('Failed to clear persisted state:', error);
      }
    },
    
    setStorageWarning: (warning) => {
      dispatch({
        type: actionTypes.SET_STORAGE_WARNING,
        payload: warning
      });
    }
  };

  const value = {
    ...state,
    ...actions
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  
  return context;
};

// Export for convenience
export default AppContext;
