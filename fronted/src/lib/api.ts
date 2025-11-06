// API 기본 설정 및 유틸리티
const API_BASE_URL =
  import.meta.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

// 토큰 관리
export const tokenManager = {
  getToken: () => localStorage.getItem("accessToken"),
  setToken: (token: string) => localStorage.setItem("accessToken", token),
  removeToken: () => localStorage.removeItem("accessToken"),
  isAuthenticated: () => !!localStorage.getItem("accessToken"),
};

// API 요청 헬퍼
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
    const token = tokenManager.getToken();

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401) {
          tokenManager.removeToken();
          window.location.href = "/login";
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
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
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// API 타입 정의
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
  username: string;
  email: string;
  password: string;
  age?: number;
  studyFields?: string[];
  bio?: string;
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

export interface Checklist {
  id: string;
  content: string;
  date: string;
  completed: boolean;
  createdAt: string;
}

// API 함수들
export const authAPI = {
  login: (data: LoginRequest) =>
    apiClient.post<{ token: string; user: User }>("/api/loginAct", data),
  register: (data: RegisterRequest) =>
    apiClient.post<{ message: string }>("/api/registerAct", data),
  getProfile: () => apiClient.get<User>("/api/profile"),
  updateProfile: (data: Partial<User>) =>
    apiClient.patch<User>("/api/update/profile", data),
  updateEmail: (email: string) =>
    apiClient.put<{ message: string }>("/api/update/email", { email }),
  updatePassword: (currentPassword: string, newPassword: string) =>
    apiClient.patch<{ message: string }>("/api/update/password", {
      currentPassword,
      newPassword,
    }),
  deleteAccount: () =>
    apiClient.delete<{ message: string }>("/api/delete/account"),
};

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

export const checklistAPI = {
  getChecklists: (date: string) =>
    apiClient.get<Checklist[]>(`/api/checklist?date=${date}`),
  createChecklist: (data: { content: string; date: string }) =>
    apiClient.post<Checklist>("/api/checklist", data),
  updateChecklist: (checklistId: string, content: string) =>
    apiClient.put<Checklist>(`/api/checklist/${checklistId}`, { content }),
  deleteChecklist: (checklistId: string) =>
    apiClient.delete<{ message: string }>(`/api/checklist/${checklistId}`),
  toggleChecklist: (checklistId: string) =>
    apiClient.patch<Checklist>(`/api/checklist/${checklistId}/toggle`),
  getMonthSummary: (year: number, month: number) =>
    apiClient.get<{ dates: string[] }>(
      `/api/checklist/month-summary?year=${year}&month=${month}`
    ),
};
