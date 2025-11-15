// src/lib/api.ts

// ✅ API 기본 설정
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// ✅ 공통 API 클라이언트
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // ✅ FormData면 Content-Type 자동 설정 안 함 (브라우저가 boundary 붙임)
    const isFormData = options.body instanceof FormData;

    const config: RequestInit = {
      headers: isFormData
        ? options.headers
        : {
            "Content-Type": "application/json",
            ...options.headers,
          },
      credentials: "include", // ✅ 쿠키 자동 전송 (세션 기반 인증 필수)
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // 인증 실패 시 로그인 페이지로 리다이렉트
        if (response.status === 401) {
          console.warn("세션이 만료되었습니다. 다시 로그인하세요.");

          // ✅ 공개 페이지에서는 리다이렉트하지 않음
          const publicPaths = ["/", "/login", "/register"];
          const currentPath = window.location.hash.replace("#", "") || "/";
          const isPublicPath = publicPaths.some((path) =>
            currentPath.startsWith(path)
          );

          // 보호된 페이지에서만 로그인 페이지로 리다이렉트
          if (!isPublicPath) {
            window.location.href = "#/login";
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return (await response.json()) as T;
      }

      return response.text() as unknown as T;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      method: "POST",
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      method: "PUT",
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

//
// ✅ 타입 정의
//
export interface User {
  id: string;
  username: string;
  email: string;
  age?: number;
  profileImageUrl?: string;
  bio?: string;
  studyFields?: string[];
  notificationEnabled?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  checkPassword: string;
  age?: number;
  profileImageFile?: File | string; // ✅ 파일 업로드 대응
  studyField: string;
  bio?: string;
  checkPw: boolean;
}

export interface StudyRoom {
  id: string;
  title: string;
  description?: string;
  maxParticipants: number;
  currentParticipants: number;
  studyField: string;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  memberCount: number;
}

// ✅ 체크리스트 타입 - 스키마에 맞게 수정
export interface Checklist {
  id: string;
  content: string;
  targetDate: string; // ✅ date → targetDate로 변경
  completed: boolean;
  createdAt: string;
}

//
// ✅ API 함수들
//

// 🔐 인증 관련
export const authAPI = {
  login: (data: LoginRequest) => apiClient.post<User>("/api/loginAct", data), // ✅ 세션 쿠키 저장
  register: (data: RegisterRequest) => {
    // ✅ 파일이 있을 경우 FormData 사용
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null)
        formData.append(key, value as any);
    });
    return apiClient.post<{ message: string }>("/api/registerAct", formData);
  },
  getProfile: () => apiClient.get<User>("/api/profile"),
  logout: () => apiClient.post<{ message: string }>("/api/logout"),
};

// 👥 그룹 관련
export const groupAPI = {
  getAllGroups: () => apiClient.get<Group[]>("/api/groups"),
  getMyGroups: () => apiClient.get<Group[]>("/api/groups/my"),
  createGroup: (name: string, description?: string) =>
    apiClient.post<Group>("/api/groups", { name, description }),
  getGroup: (groupId: string) => apiClient.get<Group>(`/api/groups/${groupId}`),
  deleteGroup: (groupId: string) =>
    apiClient.delete<{ message: string }>(`/api/groups/${groupId}`),
  getMembers: (groupId: string) =>
    apiClient.get<User[]>(`/api/groups/${groupId}/members`),
  addMember: (groupId: string, memberId: string) =>
    apiClient.post<{ message: string }>(`/api/groups/${groupId}/members`, {
      memberId,
    }),
  removeMember: (groupId: string, memberId: string) =>
    apiClient.delete<{ message: string }>(
      `/api/groups/${groupId}/members/${memberId}`
    ),
};

// 🧠 오픈 스터디 관련
export const openStudyAPI = {
  getRooms: () => apiClient.get<StudyRoom[]>("/api/open-study/rooms"),
  createRoom: (data: {
    title: string;
    description?: string;
    maxParticipants: number;
    studyField: string;
  }) => apiClient.post<StudyRoom>("/api/open-study/rooms", data),
  getRoom: (roomId: string) =>
    apiClient.get<StudyRoom>(`/api/open-study/rooms/${roomId}`),
  joinRoom: (roomId: string) =>
    apiClient.post<{ message: string }>(`/api/open-study/rooms/${roomId}/join`),
  leaveRoom: (roomId: string) =>
    apiClient.post<{ message: string }>(
      `/api/open-study/rooms/${roomId}/leave`
    ),
};

// 📚 그룹 스터디룸 관련
export const studyRoomAPI = {
  getAllRooms: () => apiClient.get<StudyRoom[]>("/api/study-rooms"),
  createRoom: (data: {
    title: string;
    groupId: string;
    maxParticipants: number;
    studyHours: number;
    studyField: string;
  }) => apiClient.post<StudyRoom>("/api/study-rooms", data),
  getRoom: (roomId: string) =>
    apiClient.get<StudyRoom>(`/api/study-rooms/${roomId}`),
  joinRoom: (roomId: string) =>
    apiClient.post<{ message: string }>(`/api/study-rooms/${roomId}/join`),
  leaveRoom: (roomId: string) =>
    apiClient.post<{ message: string }>(`/api/study-rooms/${roomId}/leave`),
  endRoom: (roomId: string) =>
    apiClient.post<{ message: string }>(`/api/study-rooms/${roomId}/end`),
  getGroupRooms: (groupId: string) =>
    apiClient.get<StudyRoom[]>(`/api/study-rooms/group/${groupId}`),
};

// ✅ 체크리스트 관련 - 스키마에 맞게 수정
export const checklistAPI = {
  // GET: 특정 날짜의 체크리스트 조회
  getChecklists: (date: string) =>
    apiClient.get<Checklist[]>(`/api/checklist?date=${date}`),

  // POST: 체크리스트 생성 - targetDate 사용
  createChecklist: (data: { targetDate: string; content: string }) =>
    apiClient.post<Checklist>("/api/checklist", data),

  // PUT: 체크리스트 내용 수정 - content 객체로 전달
  updateChecklist: (checklistId: string, data: { content: string }) =>
    apiClient.put<Checklist>(`/api/checklist/${checklistId}`, data),

  // DELETE: 체크리스트 삭제
  deleteChecklist: (checklistId: string) =>
    apiClient.delete<{ message: string }>(`/api/checklist/${checklistId}`),

  // PATCH: 체크리스트 완료/미완료 토글
  toggleChecklist: (checklistId: string) =>
    apiClient.patch<Checklist>(`/api/checklist/${checklistId}/toggle`),

  // GET: 월별 체크리스트 요약 (날짜 목록)
  getMonthSummary: (year: number, month: number) =>
    apiClient.get<{ dates: string[] }>(
      `/api/checklist/month-summary?year=${year}&month=${month}`
    ),
};
