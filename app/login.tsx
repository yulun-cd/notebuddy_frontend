import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("错误", "请填写所有必填字段");
      return;
    }

    try {
      await login(email.trim(), password.trim());
      router.replace("/home");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "认证失败";
      Alert.alert("错误", errorMessage);
    }
  };

  const isFormValid = () => {
    return email.trim() && password.trim();
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              语记
            </ThemedText>
            <ThemedText type="subtitle" style={styles.subtitle}>
              欢迎回来
            </ThemedText>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                邮箱 <ThemedText style={styles.required}>*</ThemedText>
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
                密码 <ThemedText style={styles.required}>*</ThemedText>
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
                (!isFormValid() || isLoading) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!isFormValid() || isLoading}
            >
              <ThemedText
                type="defaultSemiBold"
                style={styles.submitButtonText}
              >
                {isLoading ? "请稍候..." : "登录"}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchModeButton}
              onPress={() => router.push("/register")}
              disabled={isLoading}
            >
              <ThemedText type="default" style={styles.switchModeText}>
                还没有账户？注册
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
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
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
  required: {
    color: "red",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: "white",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "rgba(0, 122, 255, 0.5)",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
  },
  switchModeButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  switchModeText: {
    color: "#007AFF",
    fontSize: 14,
  },
});
