import { userProfileService } from "@/services/userProfileService";
import { User, UserProfile } from "@/types";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

interface UserProfileContextType {
  userProfile: User | null;
  isLoading: boolean;
  error: string | null;
  refreshUserProfile: () => Promise<void>;
  updateUserProfile: (profileData: UserProfile) => Promise<User>;
  clearError: () => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(
  undefined
);

interface UserProfileProviderProps {
  children: ReactNode;
}

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      refreshUserProfile();
    } else {
      // Clear user profile when user logs out
      setUserProfile(null);
      setError(null);
    }
  }, [isAuthenticated]);

  const refreshUserProfile = async () => {
    // Only fetch user profile if user is authenticated
    if (!isAuthenticated) {
      setUserProfile(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const fetchedUserProfile = await userProfileService.getUserProfile();
      setUserProfile(fetchedUserProfile);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch user profile";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (profileData: UserProfile): Promise<User> => {
    if (!isAuthenticated) {
      throw new Error("You must be logged in to update your profile");
    }

    setIsLoading(true);
    setError(null);
    try {
      const updatedUserProfile = await userProfileService.updateUserProfile(
        profileData
      );
      setUserProfile(updatedUserProfile);
      return updatedUserProfile;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update user profile";
      setError(errorMessage);
      console.error("Failed to update user profile:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: UserProfileContextType = {
    userProfile,
    isLoading,
    error,
    refreshUserProfile,
    updateUserProfile,
    clearError,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = (): UserProfileContextType => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
};
