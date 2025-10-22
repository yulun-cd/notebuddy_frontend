import { Stack } from "expo-router";
import "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { NotesProvider } from "@/contexts/NotesContext";
import { TranscriptsProvider } from "@/contexts/TranscriptsContext";
import { UserProfileProvider } from "@/contexts/UserProfileContext";
import "@/services/i18n"; // Import i18n configuration
import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native";

export const unstable_settings = {
  anchor: "(tabs)",
};

export function LoadingScreen() {
  const { t } = useTranslation();

  return (
    <ThemedView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <ActivityIndicator size="large" />
      <ThemedText type="default" style={{ marginTop: 16 }}>
        {t("common.loading")}
      </ThemedText>
    </ThemedView>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  ) : (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProfileProvider>
        <I18nProvider>
          <TranscriptsProvider>
            <NotesProvider>
              <AppContent />
            </NotesProvider>
          </TranscriptsProvider>
        </I18nProvider>
      </UserProfileProvider>
    </AuthProvider>
  );
}
