import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";

interface User {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: 'admin' | 'regional' | 'staff';
  permissions: string[];
  cityId?: number;
  cityName?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  const isAuthenticated = !!user;

  useEffect(() => {
    // Check for existing auth token on app load
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("adminUser");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem("authToken");
        localStorage.removeItem("adminUser");
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("adminUser", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("adminUser");
    setUser(null);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};