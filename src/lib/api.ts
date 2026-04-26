import type { Course } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

type RequestOptions = RequestInit & { token?: string | null };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (options.token) headers.set('Authorization', `Bearer ${options.token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || 'API request failed');
  }
  return payload as T;
}

export type AuthResponse = {
  token: string;
  admin: { id: string; name?: string; email: string };
};

export type CoursesResponse = {
  items: Course[];
  total: number;
  cached?: boolean;
};

export type Recommendation = {
  courseId?: string;
  courseName: string;
  universityName: string;
  matchScore: number;
  rationale: string;
};

export function loginAdmin(email: string, password: string) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function signupAdmin(email: string, password: string, name = 'Admin') {
  return request<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

export function fetchCourses(params: Record<string, string | number | undefined> = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  const suffix = query.toString() ? `?${query}` : '';
  return request<CoursesResponse>(`/courses${suffix}`);
}

export function uploadCourses(file: File, token: string) {
  const formData = new FormData();
  formData.append('file', file);
  return request<{ imported: number }>('/courses/upload', {
    method: 'POST',
    token,
    body: formData,
  });
}

export function fetchRecommendations(description: string, skillLevel = 'beginner') {
  return request<{ recommendations: Recommendation[]; source: string; note?: string }>('/recommendations', {
    method: 'POST',
    body: JSON.stringify({ description, topics: description, skillLevel }),
  });
}
