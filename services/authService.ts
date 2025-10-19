import { AuthTokens, LoginRequest, RegisterRequest } from "@/types";
import { apiService } from "./api";

export class AuthService {
  async login(
    credentials: LoginRequest
  ): Promise<{ email: string; tokens: AuthTokens }> {
    const response = await apiService.post<AuthTokens>(
      "/auth/login",
      credentials
    );

    if (response.status >= 200 && response.status < 300) {
      // Handle different response formats
      let tokens: AuthTokens;

      if (response.data.data) {
        // If response has data property (ApiResponse format)
        tokens = response.data.data as AuthTokens;
      } else {
        // If response is directly the tokens
        tokens = response.data as AuthTokens;
      }

      await apiService.setTokens(tokens, credentials.email);
      return { email: credentials.email, tokens };
    }

    throw new Error(response.data.error || "Login failed");
  }

  async register(
    userData: RegisterRequest
  ): Promise<{ email: string; tokens: AuthTokens }> {
    // Step 1: Register the user
    console.log("Trying to register user with data: ", userData);
    const registerResponse = await apiService.post("/auth/register", userData);

    if (registerResponse.status >= 200 && registerResponse.status < 300) {
      console.log("Registration successful, now logging in...");

      // Step 2: Log in the user with the same credentials
      const loginCredentials: LoginRequest = {
        email: userData.email,
        password: userData.password,
      };

      const loginResponse = await apiService.post<AuthTokens>(
        "/auth/login",
        loginCredentials
      );

      if (loginResponse.status >= 200 && loginResponse.status < 300) {
        // Handle different response formats for login
        let tokens: AuthTokens;

        if (loginResponse.data.data) {
          // If response has data property (ApiResponse format)
          tokens = loginResponse.data.data as AuthTokens;
        } else {
          // If response is directly the tokens
          tokens = loginResponse.data as AuthTokens;
        }

        await apiService.setTokens(tokens, userData.email);
        return { email: userData.email, tokens };
      } else {
        throw new Error(
          loginResponse.data.error || "Auto-login failed after registration"
        );
      }
    }

    throw new Error(registerResponse.data.error || "Registration failed");
  }

  async logout(): Promise<void> {
    try {
      // For JWT-based authentication, we simply clear the tokens locally
      // No backend logout endpoint is needed
      await apiService.clearTokens();
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  async refreshTokens(): Promise<AuthTokens> {
    const tokens = apiService.getTokens();
    if (!tokens?.refresh_token) {
      throw new Error("No refresh token available");
    }

    const response = await apiService.post<AuthTokens>("/auth/refresh", {
      refresh_token: tokens.refresh_token,
    });

    if (response.status >= 200 && response.status < 300) {
      // Handle different response formats
      let newTokens: AuthTokens;

      if (response.data.data) {
        // If response has data property (ApiResponse format)
        newTokens = response.data.data as AuthTokens;
      } else {
        // If response is directly the tokens
        newTokens = response.data as AuthTokens;
      }

      await apiService.setTokens(newTokens);
      return newTokens;
    }

    throw new Error("Token refresh failed");
  }

  isAuthenticated(): boolean {
    return apiService.getTokens() !== null;
  }

  getCurrentTokens(): AuthTokens | null {
    return apiService.getTokens();
  }
}

export const authService = new AuthService();
