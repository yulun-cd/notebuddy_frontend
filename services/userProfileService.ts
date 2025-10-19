import { User, UserProfile } from "@/types";
import { apiService } from "./api";

export class UserProfileService {
  async getUserProfile(): Promise<User> {
    const response = await apiService.get<User>("/users/profile");

    if (response.status >= 200 && response.status < 300) {
      // Handle different response formats
      let user: User;

      if (response.data.data) {
        // If response has data property
        user = response.data.data as User;
      } else {
        // If response is directly the user
        user = response.data as User;
      }

      return user;
    }

    throw new Error(response.data.error || "Failed to fetch user profile");
  }

  async updateUserProfile(profileData: UserProfile): Promise<User> {
    const response = await apiService.put<User>("/users/profile", profileData);

    if (response.status >= 200 && response.status < 300) {
      // Handle different response formats
      let user: User;

      if (response.data.data) {
        // If response has data property
        user = response.data.data as User;
      } else {
        // If response is directly the user
        user = response.data as User;
      }

      return user;
    }

    throw new Error(response.data.error || "Failed to update user profile");
  }
}

export const userProfileService = new UserProfileService();
