import { ApiResponse, AuthTokens } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance, AxiosResponse } from "axios";

const API_BASE_URL = `${process.env.BASE_URL}`;
console.log("API_BASE_URL:", API_BASE_URL);

class ApiService {
  private client: AxiosInstance;
  private tokens: AuthTokens | null = null;
  private authStatusChangeCallback:
    | ((isAuthenticated: boolean) => void)
    | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
    this.loadTokens();
  }

  setAuthStatusChangeCallback(callback: (isAuthenticated: boolean) => void) {
    this.authStatusChangeCallback = callback;
  }

  private notifyAuthStatusChange(isAuthenticated: boolean) {
    if (this.authStatusChangeCallback) {
      this.authStatusChangeCallback(isAuthenticated);
    }
  }

  private async loadTokens() {
    try {
      const tokens = await AsyncStorage.getItem("auth_tokens");
      if (tokens) {
        this.tokens = JSON.parse(tokens);
        this.setAuthorizationHeader();
      }
    } catch (error) {
      console.error("Failed to load tokens:", error);
    }
  }

  private setAuthorizationHeader() {
    if (this.tokens?.access_token) {
      this.client.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${this.tokens.access_token}`;
    } else {
      delete this.client.defaults.headers.common["Authorization"];
    }
  }

  private setupInterceptors() {
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle both 401 (Unauthorized) and 403 (Forbidden) errors for token refresh
        if (
          (error.response?.status === 401 || error.response?.status === 403) &&
          !originalRequest._retry &&
          this.tokens?.refresh_token
        ) {
          originalRequest._retry = true;

          try {
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refresh_token: this.tokens.refresh_token,
            });

            if (response.status > 299) {
              // clear tokens and notify auth status change, let the user log in again
              console.log(
                "Refresh token request failed with status:",
                response.status
              );
              await this.clearTokens();
              this.notifyAuthStatusChange(false);
              return Promise.reject(error);
            }
            const newTokens = response.data;
            await this.setTokens(newTokens);

            // Update the authorization header for the retry
            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${newTokens.access_token}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            await this.clearTokens();
            // Emit an event or use a callback to notify AuthContext about auth status change
            this.notifyAuthStatusChange(false);
            throw refreshError;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async setTokens(tokens: AuthTokens, email?: string) {
    this.tokens = tokens;
    this.setAuthorizationHeader();
    if (tokens) {
      await AsyncStorage.setItem("auth_tokens", JSON.stringify(tokens));
    }
    if (email) {
      await AsyncStorage.setItem("user_email", email);
    }
  }

  async clearTokens() {
    this.tokens = null;
    this.setAuthorizationHeader();
    await AsyncStorage.removeItem("auth_tokens");
    await AsyncStorage.removeItem("user_email");
  }

  async getStoredEmail(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("user_email");
    } catch (error) {
      console.error("Failed to get stored email:", error);
      return null;
    }
  }

  getTokens(): AuthTokens | null {
    return this.tokens;
  }

  async get<T>(
    url: string,
    params?: any
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.get(url, { params });
  }

  async post<T>(
    url: string,
    data?: any
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.post(url, data);
  }

  async put<T>(
    url: string,
    data?: any
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.put(url, data);
  }

  async patch<T>(
    url: string,
    data?: any
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.patch(url, data);
  }

  async delete<T>(url: string): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.delete(url);
  }
}

export const apiService = new ApiService();
