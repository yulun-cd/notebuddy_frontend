import { Stack } from "expo-router";
import "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotesProvider } from "@/contexts/NotesContext";
import { TranscriptsProvider } from "@/contexts/TranscriptsContext";
import { UserProfileProvider } from "@/contexts/UserProfileContext";
import { ActivityIndicator } from "react-native";

export const unstable_settings = {
  anchor: "(tabs)",
};

export function LoadingScreen() {
  return (
    <ThemedView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <ActivityIndicator size="large" />
      <ThemedText type="default" style={{ marginTop: 16 }}>
        正在加载...
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
        <TranscriptsProvider>
          <NotesProvider>
            <AppContent />
          </NotesProvider>
        </TranscriptsProvider>
      </UserProfileProvider>
    </AuthProvider>
  );
}
