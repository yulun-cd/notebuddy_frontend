import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { email, isAuthenticated, logout, isLoading } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      '退出登录',
      '确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '退出',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // User will be redirected to login screen automatically via the layout
            } catch (error) {
              console.error('Logout failed:', error);
              Alert.alert('错误', '退出登录失败，请重试。');
            }
          },
        },
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.unauthorizedContainer}>
          <ThemedText type="title" style={styles.unauthorizedTitle}>
            欢迎使用 NoteBuddy
          </ThemedText>
          <ThemedText type="default" style={styles.unauthorizedText}>
            请登录以访问您的个人资料并管理账户。
          </ThemedText>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/login' as any)}
            disabled={isLoading}
          >
            <ThemedText type="defaultSemiBold" style={styles.loginButtonText}>
              登录
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">个人资料</ThemedText>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.emailContainer}>
          <ThemedText type="defaultSemiBold" style={styles.emailLabel}>
            邮箱
          </ThemedText>
          <ThemedText type="default" style={styles.emailValue}>
            {email || '加载中...'}
          </ThemedText>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoading}
        >
          <ThemedText type="defaultSemiBold" style={styles.logoutButtonText}>
            {isLoading ? '正在退出...' : '退出登录'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  profileSection: {
    flex: 1,
    paddingTop: 32,
    gap: 24,
  },
  emailContainer: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.2)',
  },
  emailLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  emailValue: {
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  unauthorizedTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  unauthorizedText: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: 'white',
  },
});
