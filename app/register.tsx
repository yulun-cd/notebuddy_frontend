import { GenderDropdown } from "@/components/GenderDropdown";
import { LanguageDropdown } from "@/components/LanguageDropdown";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/contexts/AuthContext";
import { getLocales } from "expo-localization";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      Alert.alert(t("common.error"), t("validation.required"));
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert(t("common.error"), t("validation.email"));
      return;
    }

    // Validate password length
    // if (password.length < 6) {
    //   Alert.alert(t("common.error"), t("validation.passwordLength"));
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
      const errorMessage =
        error instanceof Error ? error.message : t("error.unknown");
      Alert.alert(t("common.error"), errorMessage);
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
              NoteBuddy
            </ThemedText>
            <ThemedText type="subtitle" style={styles.subtitle}>
              {t("auth.register")}
            </ThemedText>
          </View>

          <View style={styles.form}>
            {/* Mandatory Fields */}
            <View style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                {t("auth.email")}{" "}
                <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder={t("auth.email")}
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                {t("auth.password")}{" "}
                <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={styles.textInput}
                value={password}
                onChangeText={setPassword}
                placeholder={t("auth.password")}
                placeholderTextColor="#999"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                {t("profile.firstName")}{" "}
                <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={styles.textInput}
                value={firstName}
                onChangeText={setFirstName}
                placeholder={t("profile.firstName")}
                placeholderTextColor="#999"
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                {t("profile.lastName")}{" "}
                <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={styles.textInput}
                value={lastName}
                onChangeText={setLastName}
                placeholder={t("profile.lastName")}
                placeholderTextColor="#999"
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                {t("profile.language")}{" "}
                <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <LanguageDropdown
                value={language}
                onChange={setLanguage}
                placeholder={t("language.select")}
              />
              <ThemedText type="default" style={styles.hint}>
                {t("language.detected")}: {deviceLanguage}
              </ThemedText>
            </View>

            {/* Optional Fields */}
            <View style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                {t("profile.nickName")}
              </ThemedText>
              <TextInput
                style={styles.textInput}
                value={nickName}
                onChangeText={setNickName}
                placeholder={t("profile.nickName")}
                placeholderTextColor="#999"
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                {t("profile.gender")}
              </ThemedText>
              <GenderDropdown
                value={gender}
                onChange={setGender}
                placeholder={t("gender.select")}
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
                {isLoading ? t("common.loading") : t("auth.register")}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchModeButton}
              onPress={() => router.push("/login")}
              disabled={isLoading}
            >
              <ThemedText type="default" style={styles.switchModeText}>
                {t("auth.haveAccount")} {t("auth.login")}
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
