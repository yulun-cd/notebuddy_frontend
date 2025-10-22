import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { email, isAuthenticated, logout, isLoading } = useAuth();
  const {
    userProfile,
    isLoading: profileLoading,
    error,
    refreshUserProfile,
  } = useUserProfile();

  const handleLogout = () => {
    Alert.alert(t("alert.confirmLogout"), t("alert.logoutMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("auth.logout"),
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            // User will be redirected to login screen automatically via the layout
          } catch (error) {
            console.error("Logout failed:", error);
            Alert.alert(t("common.error"), t("error.unknown"));
          }
        },
      },
    ]);
  };

  const handleRetry = () => {
    refreshUserProfile();
  };

  if (!isAuthenticated) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.unauthorizedContainer}>
          <ThemedText type="title" style={styles.unauthorizedTitle}>
            {t("home.welcome")}
          </ThemedText>
          <ThemedText type="default" style={styles.unauthorizedText}>
            {t("error.unauthorized")}
          </ThemedText>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/login")}
            disabled={isLoading}
          >
            <ThemedText type="defaultSemiBold" style={styles.loginButtonText}>
              {t("auth.login")}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  if (error && !userProfile) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText type="title" style={styles.errorTitle}>
            {t("common.error")}
          </ThemedText>
          <ThemedText type="default" style={styles.errorText}>
            {error}
          </ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <ThemedText type="defaultSemiBold" style={styles.retryButtonText}>
              {t("common.retry")}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.profileSection}>
        <View style={styles.emailContainer}>
          <ThemedText type="defaultSemiBold" style={styles.emailLabel}>
            {t("auth.email")}
          </ThemedText>
          <ThemedText type="default" style={styles.emailValue}>
            {email || t("common.loading")}
          </ThemedText>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoading}
        >
          <ThemedText type="defaultSemiBold" style={styles.logoutButtonText}>
            {isLoading ? t("common.loading") : t("auth.logout")}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  profileSection: {
    flex: 1,
    paddingTop: 32,
    gap: 32,
  },
  emailContainer: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 122, 255, 0.2)",
  },
  profileInfoContainer: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 122, 255, 0.2)",
    marginTop: 16,
  },
  profileInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  profileInfoTitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  emailLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  emailValue: {
    fontSize: 16,
  },
  profileFields: {
    gap: 12,
  },
  profileField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 122, 255, 0.1)",
  },
  fieldLabel: {
    fontSize: 14,
    opacity: 0.7,
    width: 80,
  },
  fieldValue: {
    flex: 1,
    fontSize: 14,
    textAlign: "right",
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  unauthorizedTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  unauthorizedText: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.7,
  },
  loginButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: "white",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  errorText: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.7,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
  },
});
