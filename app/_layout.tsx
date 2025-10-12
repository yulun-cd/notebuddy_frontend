import { Stack } from 'expo-router';
import 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { NotesProvider } from '@/contexts/NotesContext';
import { TranscriptsProvider } from '@/contexts/TranscriptsContext';
import { ActivityIndicator } from 'react-native';

export const unstable_settings = {
  anchor: '(tabs)',
};

function LoadingScreen() {
  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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

  return (
    <Stack>
      {isAuthenticated ? (
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="login" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <TranscriptsProvider>
        <NotesProvider>
          <AppContent />
        </NotesProvider>
      </TranscriptsProvider>
    </AuthProvider>
  );
}
