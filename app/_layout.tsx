import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { NotesProvider } from '@/contexts/NotesContext';
import { TranscriptsProvider } from '@/contexts/TranscriptsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {!isAuthenticated ? (
          <Stack.Screen name="login" options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen
              name="transcript/[id]"
              options={{
                title: 'Transcript',
                headerBackTitle: 'Back'
              }}
            />
            <Stack.Screen
              name="note/[id]"
              options={{
                title: 'Note',
                headerBackTitle: 'Back'
              }}
            />
          </>
        )}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <TranscriptsProvider>
        <NotesProvider>
          <RootLayoutNav />
        </NotesProvider>
      </TranscriptsProvider>
    </AuthProvider>
  );
}
