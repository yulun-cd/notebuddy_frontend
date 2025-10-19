export interface User {
  id: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  nick_name?: string;
  language?: string;
  gender?: "Male" | "Female" | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  first_name?: string;
  last_name?: string;
  nick_name?: string;
  language?: string;
  gender?: "Male" | "Female" | null;
}

export interface Transcript {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  note_id?: string;
  note?: Note | null;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  user_id: string;
  transcript_id: string;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  language: string;
  nick_name?: string | null;
  gender?: "Male" | "Female" | null;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
