import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  role: 'student' | 'admin';
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, role: 'student' | 'admin') => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface UserCredentials {
  password: string;
  name: string;
}

interface Credentials {
  student: Record<string, UserCredentials>;
  admin: Record<string, UserCredentials>;
}

// Sample credentials - In a real application, these would be stored securely in a database
const CREDENTIALS: Credentials = {
  student: {
    'johndoe': { password: 'johndoe123', name: 'John Doe' },
    'janedoe': { password: 'janedoe123', name: 'Jane Doe' },
  },
  admin: {
    'admin': { password: 'admin123', name: 'System Administrator' }
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password: string, role: 'student' | 'admin'): Promise<boolean> => {
    try {
      // Check if the user exists in the credentials
      const userCredentials = CREDENTIALS[role][username];
      
      if (userCredentials && userCredentials.password === password) {
        setUser({
          id: username,
          role,
          name: userCredentials.name
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 