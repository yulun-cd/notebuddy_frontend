import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { login, register, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('错误', '请填写所有必填字段');
      return;
    }

    if (!isLoginMode && !name.trim()) {
      Alert.alert('错误', '请输入您的姓名');
      return;
    }

    try {
      if (isLoginMode) {
        await login(email.trim(), password.trim());
        router.replace('/(tabs)');
      } else {
        await register(email.trim(), password.trim(), name.trim());
        router.replace('/(tabs)');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '认证失败';
      Alert.alert('错误', errorMessage);
    }
  };

  const switchAuthMode = () => {
    setIsLoginMode(!isLoginMode);
    setName('');
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              NoteBuddy
            </ThemedText>
            <ThemedText type="subtitle" style={styles.subtitle}>
              {isLoginMode ? '欢迎回来' : '创建账户'}
            </ThemedText>
          </View>

          <View style={styles.form}>
            {!isLoginMode && (
              <View style={styles.inputGroup}>
                <ThemedText type="defaultSemiBold" style={styles.label}>
                  姓名
                </ThemedText>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="请输入您的姓名"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                邮箱
              </ThemedText>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="请输入您的邮箱"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                密码
              </ThemedText>
              <TextInput
                style={styles.textInput}
                value={password}
                onChangeText={setPassword}
                placeholder="请输入您的密码"
                placeholderTextColor="#999"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!email.trim() || !password.trim() || (!isLoginMode && !name.trim()) || isLoading) &&
                styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!email.trim() || !password.trim() || (!isLoginMode && !name.trim()) || isLoading}
            >
              <ThemedText type="defaultSemiBold" style={styles.submitButtonText}>
                {isLoading ? '请稍候...' : (isLoginMode ? '登录' : '创建账户')}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchModeButton}
              onPress={switchAuthMode}
              disabled={isLoading}
            >
              <ThemedText type="default" style={styles.switchModeText}>
                {isLoginMode
                  ? "还没有账户？注册"
                  : "已有账户？登录"
                }
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    opacity: 0.7,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(0, 122, 255, 0.5)',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
  },
  switchModeButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  switchModeText: {
    color: '#007AFF',
    fontSize: 14,
  },
});
