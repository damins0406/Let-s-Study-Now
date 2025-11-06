import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, authAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ 앱 시작 시 로그인 상태 확인 (쿠키 기반 세션 확인)
  useEffect(() => {
    const initAuth = async () => {
      try {
        const userData = await authAPI.getProfile();
        if (userData) setUser(userData);
      } catch (error) {
        console.warn("Not logged in or failed to fetch profile:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // ✅ 로그인
  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      // 쿠키에 세션 저장됨
      await authAPI.login({ username, password });

      // 로그인 성공 후 프로필 다시 요청
      const userData = await authAPI.getProfile();
      setUser(userData);

      toast({
        title: "로그인 성공 🎉",
        description: `${userData.username}님 환영합니다!`,
      });

      return true;
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        title: "로그인 실패",
        description: "아이디 또는 비밀번호를 확인해주세요.",
        variant: "destructive",
      });
      return false;
    }
  };

  // ✅ 회원가입
  const register = async (data: any): Promise<boolean> => {
    try {
      await authAPI.register(data);
      toast({
        title: "회원가입 성공 🎉",
        description: "이제 로그인해주세요!",
      });
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      toast({
        title: "회원가입 실패",
        description: "입력 정보를 다시 확인해주세요.",
        variant: "destructive",
      });
      return false;
    }
  };

  // ✅ 로그아웃
  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout(); // 쿠키 세션 무효화
    } catch (error) {
      console.warn("Logout request failed:", error);
    } finally {
      setUser(null);
      toast({
        title: "로그아웃 완료 👋",
        description: "다음에 또 만나요!",
      });
    }
  };

  // ✅ 유저 상태 업데이트
  const updateUser = (userData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...userData } : null));
  };

  const value = { user, loading, login, register, logout, updateUser };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
