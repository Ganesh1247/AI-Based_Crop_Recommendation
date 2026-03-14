import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

interface User {
  id: string;
  name: string;
  phone: string;
  username?: string;
  email?: string;
  location?: {
    city: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  signupDate?: string;
}

interface AuthContextType {
  user: User | null;
  login: (phone: string, password?: string) => Promise<void>;
  signup: (name: string, phone: string, username?: string, password?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for saved auth state on app load
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const login = useCallback(async (phone: string, password?: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const userData: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: "Demo User", // In a real app, this comes from DB
        phone,
        signupDate: new Date().toISOString()
      };
      
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
    } catch (error) {
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (name: string, phone: string, username?: string, password?: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const userData: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        phone,
        username,
        signupDate: new Date().toISOString()
      };
      
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
    } catch (error) {
      throw new Error('Signup failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('currentUser');
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  }, [user]);

  const contextValue = useMemo(() => ({
    user,
    login,
    signup,
    logout,
    isLoading,
    updateUser
  }), [user, login, signup, logout, isLoading, updateUser]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}