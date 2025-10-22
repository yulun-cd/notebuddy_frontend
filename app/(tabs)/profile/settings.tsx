import { GenderDropdown } from "@/components/GenderDropdown";
import { LanguageDropdown } from "@/components/LanguageDropdown";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useColorScheme } from "@/hooks/use-color-scheme.web";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");

  const {
    userProfile,
    isLoading: profileLoading,
    error,
    updateUserProfile,
  } = useUserProfile();

  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    nick_name: "",
    language: "",
    gender: null as "Male" | "Female" | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (userProfile) {
      setEditForm({
        first_name: userProfile.first_name || "",
        last_name: userProfile.last_name || "",
        nick_name: userProfile.nick_name || "",
        language: userProfile.language || "",
        gender: userProfile.gender || null,
      });
    }
  }, [userProfile]);

  const handleSaveProfile = async () => {
    if (!userProfile) return;

    setIsSubmitting(true);
    try {
      await updateUserProfile(editForm);
      Alert.alert(t("common.success"), t("profile.updateSuccess"));
    } catch (err) {
      console.error("Failed to update profile:", err);
      Alert.alert(t("common.error"), t("profile.updateError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDarkModeToggle = (value: boolean) => {
    setIsDarkMode(value);
    // Note: In a real implementation, you would save this preference and apply it
    // This is a placeholder for the dark mode functionality
    Alert.alert(
      t("settings.darkMode"),
      value ? t("settings.darkModeEnabled") : t("settings.darkModeDisabled")
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Dark Mode Toggle */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t("settings.appearance")}
          </ThemedText>
          <View style={styles.settingRow}>
            <ThemedText type="default" style={styles.settingLabel}>
              {t("settings.darkMode")}
            </ThemedText>
            <Switch
              value={isDarkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isDarkMode ? "#007AFF" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Profile Editing Section */}
        {userProfile && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t("profile.personalInfo")}
            </ThemedText>

            <View style={styles.editForm}>
              <View style={styles.formRow}>
                <ThemedText type="defaultSemiBold" style={styles.formLabel}>
                  {t("profile.firstName")}
                </ThemedText>
                <TextInput
                  style={styles.textInput}
                  value={editForm.first_name}
                  onChangeText={(text) =>
                    setEditForm((prev) => ({ ...prev, first_name: text }))
                  }
                  placeholder={t("profile.firstName")}
                />
              </View>

              <View style={styles.formRow}>
                <ThemedText type="defaultSemiBold" style={styles.formLabel}>
                  {t("profile.lastName")}
                </ThemedText>
                <TextInput
                  style={styles.textInput}
                  value={editForm.last_name}
                  onChangeText={(text) =>
                    setEditForm((prev) => ({ ...prev, last_name: text }))
                  }
                  placeholder={t("profile.lastName")}
                />
              </View>

              <View style={styles.formRow}>
                <ThemedText type="defaultSemiBold" style={styles.formLabel}>
                  {t("profile.nickName")}
                </ThemedText>
                <TextInput
                  style={styles.textInput}
                  value={editForm.nick_name}
                  onChangeText={(text) =>
                    setEditForm((prev) => ({ ...prev, nick_name: text }))
                  }
                  placeholder={t("profile.nickName")}
                />
              </View>

              <View style={styles.formRow}>
                <ThemedText type="defaultSemiBold" style={styles.formLabel}>
                  {t("profile.language")}
                </ThemedText>
                <LanguageDropdown
                  value={editForm.language}
                  onChange={(language) =>
                    setEditForm((prev) => ({ ...prev, language }))
                  }
                  placeholder={t("language.select")}
                />
              </View>

              <View style={styles.formRow}>
                <ThemedText type="defaultSemiBold" style={styles.formLabel}>
                  {t("profile.gender")}
                </ThemedText>
                <GenderDropdown
                  value={editForm.gender}
                  onChange={(gender) =>
                    setEditForm((prev) => ({ ...prev, gender }))
                  }
                  placeholder={t("gender.select")}
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
                disabled={isSubmitting || profileLoading}
              >
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.saveButtonText}
                >
                  {isSubmitting ? t("common.loading") : t("common.save")}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
    paddingTop: 16,
  },
  section: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 122, 255, 0.2)",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
  },
  editForm: {
    gap: 16,
  },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  formLabel: {
    fontSize: 14,
    opacity: 0.7,
    width: 80,
  },
  textInput: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
  },
});
