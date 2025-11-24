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
        // ✅ 서버에서 보낸 에러 메시지 파싱
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // JSON 파싱 실패 시 기본 메시지 사용
        }

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

        throw new Error(errorMessage);
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

  async delete<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

//
// ✅ 타입 정의
//
export interface User {
  id?: string;
  email: string;
  username: string;
  level?: number;
  exp?: number;
  profileImageUrl?: string;
  profileImage?: string;
  bio?: string;
  studyFields?: string[];
  studyField?: string;
  notificationEnabled?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  checkPassword: string;
  profileImageFile?: File | string;
  studyField: string;
  bio?: string;
  checkPw: boolean;
}

// ✅ 오픈 스터디룸 타입 (백엔드 스키마 기준)
export interface OpenStudyRoom {
  id: number;
  title: string; // ✅ 프론트에서 사용하는 필드명
  roomName?: string; // ✅ 백엔드 응답 필드명
  description?: string;
  maxParticipants: number;
  currentParticipants: number;
  studyField: string;
  isFull: boolean;
  creatorUsername: string;
  createdAt?: string;
  isActive?: boolean;
  createdBy?: string;
}

// ✅ 그룹 스터디룸 타입 (백엔드 스키마 기준)
export interface GroupStudyRoom {
  id: number;
  groupId: number;
  roomName: string; // ✅ 백엔드는 roomName 사용
  studyField: string;
  studyHours: number;
  maxMembers: number;
  currentMembers: number;
  creatorId: number;
  createdAt: string;
  endTime: string;
  status: string;
  remainingMinutes: number;
}

export interface Group {
  id: number;
  groupName: string;
  leaderId: number;
  createdAt: string;
}

export interface GroupMember {
  id: number;
  memberId: number;
  role: string;
  joinedAt: string;
}

// ✅ 체크리스트 타입
export interface Checklist {
  id: string;
  content: string;
  targetDate: string;
  completed: boolean;
  createdAt: string;
}

//
// ✅ API 함수들
//

// 🔐 인증 관련
export const authAPI = {
  login: (data: LoginRequest) => apiClient.post<User>("/api/loginAct", data),
  register: (data: RegisterRequest) => {
    if (data.profileImageFile && data.profileImageFile instanceof File) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null)
          formData.append(key, value as any);
      });
      return apiClient.post<{ message: string }>("/api/registerAct", formData);
    } else {
      const jsonData = { ...data };
      delete jsonData.profileImageFile;
      return apiClient.post<{ message: string }>("/api/registerAct", jsonData);
    }
  },
  getProfile: () => apiClient.get<User>("/api/profile"),
  logout: () => apiClient.post<{ message: string }>("/api/logout"),

  updateProfile: (data: {
    profileImage?: string;
    studyField?: string;
    bio?: string;
    profileImageFile?: File;
  }) => {
    const formData = new FormData();
    if (data.profileImage) formData.append("profileImage", data.profileImage);
    if (data.studyField) formData.append("studyField", data.studyField);
    if (data.bio) formData.append("bio", data.bio);
    if (data.profileImageFile)
      formData.append("profileImageFile", data.profileImageFile);
    return apiClient.put<User>("/api/update/profile", formData);
  },

  updatePassword: (data: {
    currentPassword: string;
    newPassword: string;
    newPasswordCheck: string;
  }) => apiClient.put<{ message: string }>("/api/update/password", data),

  deleteAccount: (password: string) =>
    apiClient.delete<{ message: string }>("/api/delete/account", { password }),
};

// 👥 그룹 관련
export const groupAPI = {
  getAllGroups: () => apiClient.get<Group[]>("/api/groups"),
  getMyGroups: () => apiClient.get<Group[]>("/api/groups/my"),
  getMyGroupsWithId: (leaderId: number) =>
    apiClient.get<Group[]>(`/api/groups/my?leaderId=${leaderId}`),
  createGroup: (data: { groupName: string; leaderId: number }) =>
    apiClient.post<Group>("/api/groups", data),
  getGroup: (groupId: number) => apiClient.get<Group>(`/api/groups/${groupId}`),
  deleteGroup: (groupId: number, userId: number) =>
    apiClient.delete<{ message: string }>(
      `/api/groups/${groupId}?userId=${userId}`
    ),
  getMembers: (groupId: number) =>
    apiClient.get<GroupMember[]>(`/api/groups/${groupId}/members`),
  addMember: (groupId: number, memberId: number) =>
    apiClient.post<GroupMember>(`/api/groups/${groupId}/members`, {
      groupId,
      memberId,
    }),
  removeMember: (groupId: number, memberId: number, requesterId: number) =>
    apiClient.delete<{ message: string }>(
      `/api/groups/${groupId}/members/${memberId}?requesterId=${requesterId}`
    ),
};

// 🧠 오픈 스터디 관련
export const openStudyAPI = {
  // ✅ GET /api/open-study/rooms - 필터링 지원
  getRooms: (studyField?: string) => {
    const params = studyField ? `?studyField=${studyField}` : "";
    return apiClient.get<OpenStudyRoom[]>(`/api/open-study/rooms${params}`);
  },

  // ✅ POST /api/open-study/rooms - 백엔드는 title 사용
  createRoom: (data: {
    title: string;
    description?: string;
    studyField: string;
    maxParticipants: number;
  }) => apiClient.post<OpenStudyRoom>("/api/open-study/rooms", data),

  // ✅ GET /api/open-study/rooms/{roomId}
  getRoom: (roomId: string | number) =>
    apiClient.get<OpenStudyRoom>(`/api/open-study/rooms/${roomId}`),

  // ✅ POST /api/open-study/rooms/{roomId}/join
  joinRoom: (roomId: string | number) =>
    apiClient.post<{ message: string }>(`/api/open-study/rooms/${roomId}/join`),

  // ✅ POST /api/open-study/rooms/{roomId}/leave
  leaveRoom: (roomId: string | number) =>
    apiClient.post<{ message: string }>(
      `/api/open-study/rooms/${roomId}/leave`
    ),

  // ✅ DELETE /api/open-study/rooms/{roomId}
  deleteRoom: (roomId: string | number) =>
    apiClient.delete<{ message: string }>(`/api/open-study/rooms/${roomId}`),

  // ✅ GET /api/open-study/study-fields
  getStudyFields: () => apiClient.get<string[]>("/api/open-study/study-fields"),
};

// 📚 그룹 스터디룸 관련
export const studyRoomAPI = {
  // ✅ GET /api/study-rooms
  getAllRooms: () => apiClient.get<GroupStudyRoom[]>("/api/study-rooms"),

  // ✅ POST /api/study-rooms - 백엔드 스키마에 맞게 수정
  createRoom: (data: {
    groupId: number;
    roomName: string;
    studyField: string;
    studyHours: number;
    maxMembers: number;
    creatorId: number;
  }) => apiClient.post<GroupStudyRoom>("/api/study-rooms", data),

  // ✅ GET /api/study-rooms/{roomId}
  getRoom: (roomId: string | number) =>
    apiClient.get<GroupStudyRoom>(`/api/study-rooms/${roomId}`),

  // ✅ POST /api/study-rooms/{roomId}/join
  joinRoom: (roomId: string | number, memberId: number) =>
    apiClient.post<{ message: string }>(
      `/api/study-rooms/${roomId}/join?memberId=${memberId}`
    ),

  // ✅ POST /api/study-rooms/{roomId}/leave
  leaveRoom: (roomId: string | number, memberId: number) =>
    apiClient.post<{ message: string }>(
      `/api/study-rooms/${roomId}/leave?memberId=${memberId}`
    ),

  // ✅ POST /api/study-rooms/{roomId}/end
  endRoom: (roomId: string | number) =>
    apiClient.post<{ message: string }>(`/api/study-rooms/${roomId}/end`),

  // ✅ GET /api/study-rooms/group/{groupId}
  getGroupRooms: (groupId: string | number) =>
    apiClient.get<GroupStudyRoom[]>(`/api/study-rooms/group/${groupId}`),

  // ✅ DELETE /api/study-rooms/{roomId}
  deleteRoom: (roomId: string | number, memberId: number) =>
    apiClient.delete<{ message: string }>(
      `/api/study-rooms/${roomId}?memberId=${memberId}`
    ),
};

// ✅ 체크리스트 관련
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
