import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, authAPI, tokenManager } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (tokenManager.isAuthenticated()) {
        try {
          const userData = await authAPI.getProfile();
          setUser(userData);
        } catch (error) {
          console.error('Failed to get user profile:', error);
          tokenManager.removeToken();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login({ username, password });
      tokenManager.setToken(response.token);
      setUser(response.user);
      
      toast({
        title: "로그인 성공",
        description: "환영합니다!",
      });
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "로그인 실패",
        description: "아이디 또는 비밀번호를 확인해주세요.",
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (data: any): Promise<boolean> => {
    try {
      await authAPI.register(data);
      
      toast({
        title: "회원가입 성공",
        description: "로그인해주세요.",
      });
      
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        title: "회원가입 실패",
        description: "입력 정보를 확인해주세요.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    tokenManager.removeToken();
    setUser(null);
    toast({
      title: "로그아웃",
      description: "안전하게 로그아웃되었습니다.",
    });
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};