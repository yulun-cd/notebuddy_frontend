import AsyncStorage from '@react-native-async-storage/async-storage';

export async function clearAuthTokens() {
  try {
    await AsyncStorage.removeItem('auth_tokens');
    console.log('Auth tokens cleared successfully');
  } catch (error) {
    console.error('Failed to clear auth tokens:', error);
  }
}

// Run this function to clear tokens for testing
// clearAuthTokens();
