import { GenderDropdown } from "@/components/GenderDropdown";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/contexts/AuthContext";
import { getLocales } from "expo-localization";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [language, setLanguage] = useState("");
  const [nickName, setNickName] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | null>(null);

  const [deviceLanguage, setDeviceLanguage] = useState("");

  useEffect(() => {
    // Get device language on component mount
    const locales = getLocales();
    const detectedLanguage = locales[0]?.languageCode || "en";
    setDeviceLanguage(detectedLanguage);
    setLanguage(detectedLanguage);
  }, []);

  const handleSubmit = async () => {
    // Validate mandatory fields
    if (
      !email.trim() ||
      !password.trim() ||
      !firstName.trim() ||
      !lastName.trim() ||
      !language.trim()
    ) {
      Alert.alert("错误", "请填写所有必填字段");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("错误", "请输入有效的邮箱地址");
      return;
    }

    // Validate password length
    // if (password.length < 6) {
    //   Alert.alert("错误", "密码至少需要6个字符");
    //   return;
    // }

    try {
      console.log("Register starts");
      await register(
        email.trim(),
        password.trim(),
        firstName.trim(),
        lastName.trim(),
        language.trim(),
        nickName.trim() || undefined,
        gender
      );
      console.log("Register successful");
      router.replace("/home");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "注册失败";
      Alert.alert("错误", errorMessage);
    }
  };

  const isFormValid = () => {
    return (
      email.trim() &&
      password.trim() &&
      firstName.trim() &&
      lastName.trim() &&
      language.trim()
      // password.length >= 6
    );
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
              创建账户
            </ThemedText>
          </View>

          <View style={styles.form}>
            {/* Mandatory Fields */}
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
                placeholder="请输入您的密码（至少6个字符）"
                placeholderTextColor="#999"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                名字 <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={styles.textInput}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="请输入您的名字"
                placeholderTextColor="#999"
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                姓氏 <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={styles.textInput}
                value={lastName}
                onChangeText={setLastName}
                placeholder="请输入您的姓氏"
                placeholderTextColor="#999"
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                语言 <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={styles.textInput}
                value={language}
                onChangeText={setLanguage}
                placeholder="请输入您的语言"
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <ThemedText type="default" style={styles.hint}>
                检测到的设备语言: {deviceLanguage}
              </ThemedText>
            </View>

            {/* Optional Fields */}
            <View style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                昵称（可选）
              </ThemedText>
              <TextInput
                style={styles.textInput}
                value={nickName}
                onChangeText={setNickName}
                placeholder="请输入您的昵称（可选）"
                placeholderTextColor="#999"
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                性别（可选）
              </ThemedText>
              <GenderDropdown
                value={gender}
                onChange={setGender}
                placeholder="请选择性别（可选）"
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
                {isLoading ? "请稍候..." : "创建账户"}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchModeButton}
              onPress={() => router.push("/login")}
              disabled={isLoading}
            >
              <ThemedText type="default" style={styles.switchModeText}>
                已有账户？登录
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
    paddingTop: 60, // Add top padding to avoid status bar overlap
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
  hint: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
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
