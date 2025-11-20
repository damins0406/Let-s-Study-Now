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
  login: (email: string, password: string) => Promise<boolean>; // 이메일 로그인
  register: (data: any) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
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

  // 앱 시작 시 로그인 상태 확인
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

  // 이메일 기반 로그인
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await authAPI.login({ email, password });

      const userData = await authAPI.getProfile();
      setUser(userData);

      toast({
        title: "로그인 성공 🎉",
        description: `${userData.username}님 환영합니다!`,
      });

      return true;
    } catch (error: any) {
      console.error("Login failed:", error);

      const msg =
        error?.response?.data?.message === "INVALID_CREDENTIALS"
          ? "이메일 또는 비밀번호를 확인해주세요."
          : "로그인 중 오류가 발생했습니다.";

      toast({
        title: "로그인 실패",
        description: msg,
        variant: "destructive",
      });
      return false;
    }
  };

  // 회원가입 (이메일/닉네임 중복 체크)
  const register = async (data: any): Promise<boolean> => {
    try {
      await authAPI.register(data);

      toast({
        title: "회원가입 성공 🎉",
        description: "이제 로그인해주세요!",
      });

      return true;
    } catch (error: any) {
      console.error("Registration failed:", error);

      const errMsg = error?.response?.data?.message;

      let description = "입력 정보를 다시 확인해주세요.";

      if (errMsg === "EMAIL_EXISTS")
        description = "이미 사용 중인 이메일입니다.";
      if (errMsg === "USERNAME_EXISTS")
        description = "이미 사용 중인 사용자명(닉네임)입니다.";

      toast({
        title: "회원가입 실패",
        description,
        variant: "destructive",
      });

      return false;
    }
  };

  // 로그아웃
  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
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

  const updateUser = (userData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...userData } : null));
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const userData = await authAPI.getProfile();
      setUser(userData);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      setUser(null);
      toast({
        title: "세션 만료",
        description: "다시 로그인해주세요.",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
