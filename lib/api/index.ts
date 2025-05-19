// API 요청 관련 유틸리티 함수

type FetchMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface FetchOptions {
  method?: FetchMethod;
  body?: any;
  headers?: HeadersInit;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * 기본적인 API 요청 함수
 */
export async function fetchApi<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, headers = {} } = options;
  
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };
  
  try {
    const response = await fetch(`/api${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    const contentType = response.headers.get('content-type');
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    if (!response.ok) {
      return {
        error: data.error || '알 수 없는 오류가 발생했습니다',
        status: response.status,
      };
    }
    
    return {
      data,
      status: response.status,
    };
  } catch (error) {
    console.error('API 요청 중 오류 발생:', error);
    return {
      error: '네트워크 오류가 발생했습니다',
      status: 500,
    };
  }
}

/**
 * 사용자 관련 API
 */
export const userApi = {
  // 현재 사용자 정보 조회
  getCurrentUser: () => fetchApi('/users/me'),
  
  // 사용자 프로필 업데이트
  updateProfile: (data: { name?: string; image?: string }) =>
    fetchApi('/users/me', { method: 'PUT', body: data }),
};

/**
 * 팀 관련 API
 */
export const teamApi = {
  // 팀 목록 조회
  getTeams: () => fetchApi('/teams'),
  
  // 팀 생성
  createTeam: (data: { name: string; description?: string }) =>
    fetchApi('/teams', { method: 'POST', body: data }),
  
  // 팀 상세 정보 조회
  getTeam: (teamId: string) => fetchApi(`/teams/${teamId}`),
  
  // 팀 정보 업데이트
  updateTeam: (teamId: string, data: { name?: string; description?: string }) =>
    fetchApi(`/teams/${teamId}`, { method: 'PUT', body: data }),
  
  // 팀 삭제
  deleteTeam: (teamId: string) =>
    fetchApi(`/teams/${teamId}`, { method: 'DELETE' }),
  
  // 팀에 사용자 초대
  inviteUser: (teamId: string, email: string) =>
    fetchApi(`/teams/${teamId}/invite`, { method: 'POST', body: { email } }),
};

/**
 * 할 일 관련 API
 */
export const todoApi = {
  // 할 일 목록 조회
  getTodos: (params?: {
    teamId?: string;
    completed?: boolean;
    deadline?: string;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const query = queryParams.toString();
    return fetchApi(`/todos${query ? `?${query}` : ''}`);
  },
  
  // 할 일 생성
  createTodo: (data: {
    text: string;
    teamId?: string;
    assignedTo?: string[];
    deadline?: string;
  }) => fetchApi('/todos', { method: 'POST', body: data }),
  
  // 할 일 상세 정보 조회
  getTodo: (todoId: string) => fetchApi(`/todos/${todoId}`),
  
  // 할 일 업데이트
  updateTodo: (
    todoId: string,
    data: { text?: string; completed?: boolean; deadline?: string | null }
  ) => fetchApi(`/todos/${todoId}`, { method: 'PUT', body: data }),
  
  // 할 일 삭제
  deleteTodo: (todoId: string) =>
    fetchApi(`/todos/${todoId}`, { method: 'DELETE' }),
  
  // 할 일 할당
  assignTodo: (todoId: string, userIds: string[]) =>
    fetchApi(`/todos/${todoId}/assign`, { method: 'POST', body: { userIds } }),
};
