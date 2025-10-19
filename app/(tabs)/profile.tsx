import { GenderDropdown } from "@/components/GenderDropdown";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { email, isAuthenticated, logout, isLoading } = useAuth();
  const {
    userProfile,
    isLoading: profileLoading,
    error,
    updateUserProfile,
    refreshUserProfile,
  } = useUserProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    nick_name: "",
    language: "",
    gender: null as "Male" | "Female" | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = () => {
    Alert.alert("退出登录", "确定要退出登录吗？", [
      { text: "取消", style: "cancel" },
      {
        text: "退出",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            // User will be redirected to login screen automatically via the layout
          } catch (error) {
            console.error("Logout failed:", error);
            Alert.alert("错误", "退出登录失败，请重试。");
          }
        },
      },
    ]);
  };

  const handleEdit = () => {
    if (userProfile) {
      setEditForm({
        first_name: userProfile.first_name || "",
        last_name: userProfile.last_name || "",
        nick_name: userProfile.nick_name || "",
        language: userProfile.language || "",
        gender: userProfile.gender || null,
      });
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      first_name: "",
      last_name: "",
      nick_name: "",
      language: "",
      gender: null,
    });
  };

  const handleSaveProfile = async () => {
    if (!userProfile) return;

    setIsSubmitting(true);
    try {
      await updateUserProfile(editForm);
      setIsEditing(false);
      Alert.alert("成功", "个人资料已更新");
    } catch (err) {
      console.error("Failed to update profile:", err);
      Alert.alert("错误", "更新个人资料失败，请重试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    refreshUserProfile();
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
            onPress={() => router.push("/login")}
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

  if (error && !userProfile) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText type="title" style={styles.errorTitle}>
            出错了
          </ThemedText>
          <ThemedText type="default" style={styles.errorText}>
            {error}
          </ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <ThemedText type="defaultSemiBold" style={styles.retryButtonText}>
              重试
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.profileSection}>
        <View style={styles.emailContainer}>
          <ThemedText type="defaultSemiBold" style={styles.emailLabel}>
            邮箱
          </ThemedText>
          <ThemedText type="default" style={styles.emailValue}>
            {email || "加载中..."}
          </ThemedText>
        </View>

        {isAuthenticated && userProfile && (
          <View style={styles.profileInfoContainer}>
            <View style={styles.profileInfoHeader}>
              <ThemedText type="subtitle" style={styles.profileInfoTitle}>
                个人信息
              </ThemedText>
              {!isEditing && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={handleEdit}
                  disabled={profileLoading}
                >
                  <ThemedText
                    type="defaultSemiBold"
                    style={styles.editButtonText}
                  >
                    编辑
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>

            {isEditing ? (
              <View style={styles.editForm}>
                <View style={styles.formRow}>
                  <ThemedText type="defaultSemiBold" style={styles.formLabel}>
                    名字
                  </ThemedText>
                  <TextInput
                    style={styles.textInput}
                    value={editForm.first_name}
                    onChangeText={(text) =>
                      setEditForm((prev) => ({ ...prev, first_name: text }))
                    }
                    placeholder="请输入名字"
                  />
                </View>

                <View style={styles.formRow}>
                  <ThemedText type="defaultSemiBold" style={styles.formLabel}>
                    姓氏
                  </ThemedText>
                  <TextInput
                    style={styles.textInput}
                    value={editForm.last_name}
                    onChangeText={(text) =>
                      setEditForm((prev) => ({ ...prev, last_name: text }))
                    }
                    placeholder="请输入姓氏"
                  />
                </View>

                <View style={styles.formRow}>
                  <ThemedText type="defaultSemiBold" style={styles.formLabel}>
                    昵称
                  </ThemedText>
                  <TextInput
                    style={styles.textInput}
                    value={editForm.nick_name}
                    onChangeText={(text) =>
                      setEditForm((prev) => ({ ...prev, nick_name: text }))
                    }
                    placeholder="请输入昵称"
                  />
                </View>

                <View style={styles.formRow}>
                  <ThemedText type="defaultSemiBold" style={styles.formLabel}>
                    语言
                  </ThemedText>
                  <TextInput
                    style={styles.textInput}
                    value={editForm.language}
                    onChangeText={(text) =>
                      setEditForm((prev) => ({ ...prev, language: text }))
                    }
                    placeholder="请输入语言"
                  />
                </View>

                <View style={styles.formRow}>
                  <ThemedText type="defaultSemiBold" style={styles.formLabel}>
                    性别
                  </ThemedText>
                  <GenderDropdown
                    value={editForm.gender}
                    onChange={(gender) =>
                      setEditForm((prev) => ({ ...prev, gender }))
                    }
                    placeholder="请选择性别"
                  />
                </View>

                <View style={styles.editButtons}>
                  <TouchableOpacity
                    style={[styles.editActionButton, styles.cancelButton]}
                    onPress={handleCancelEdit}
                    disabled={isSubmitting}
                  >
                    <ThemedText
                      type="defaultSemiBold"
                      style={styles.cancelButtonText}
                    >
                      取消
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.editActionButton, styles.saveButton]}
                    onPress={handleSaveProfile}
                    disabled={isSubmitting}
                  >
                    <ThemedText
                      type="defaultSemiBold"
                      style={styles.saveButtonText}
                    >
                      {isSubmitting ? "保存中..." : "保存"}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.profileFields}>
                <View style={styles.profileField}>
                  <ThemedText type="defaultSemiBold" style={styles.fieldLabel}>
                    名字
                  </ThemedText>
                  <ThemedText type="default" style={styles.fieldValue}>
                    {userProfile.first_name || "未设置"}
                  </ThemedText>
                </View>

                <View style={styles.profileField}>
                  <ThemedText type="defaultSemiBold" style={styles.fieldLabel}>
                    姓氏
                  </ThemedText>
                  <ThemedText type="default" style={styles.fieldValue}>
                    {userProfile.last_name || "未设置"}
                  </ThemedText>
                </View>

                <View style={styles.profileField}>
                  <ThemedText type="defaultSemiBold" style={styles.fieldLabel}>
                    昵称
                  </ThemedText>
                  <ThemedText type="default" style={styles.fieldValue}>
                    {userProfile.nick_name || "未设置"}
                  </ThemedText>
                </View>

                <View style={styles.profileField}>
                  <ThemedText type="defaultSemiBold" style={styles.fieldLabel}>
                    语言
                  </ThemedText>
                  <ThemedText type="default" style={styles.fieldValue}>
                    {userProfile.language || "未设置"}
                  </ThemedText>
                </View>

                <View style={styles.profileField}>
                  <ThemedText type="defaultSemiBold" style={styles.fieldLabel}>
                    性别
                  </ThemedText>
                  <ThemedText type="default" style={styles.fieldValue}>
                    {userProfile.gender || "未设置"}
                  </ThemedText>
                </View>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoading}
        >
          <ThemedText type="defaultSemiBold" style={styles.logoutButtonText}>
            {isLoading ? "正在退出..." : "退出登录"}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  editButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: "white",
    fontSize: 14,
  },
  profileSection: {
    flex: 1,
    paddingTop: 32,
    gap: 32,
  },
  emailContainer: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 122, 255, 0.2)",
  },
  emailLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  emailValue: {
    fontSize: 16,
  },
  profileInfoContainer: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 122, 255, 0.2)",
    marginTop: 16,
  },
  profileInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  profileInfoTitle: {
    fontSize: 16,
    opacity: 0.8,
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
  editButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  editActionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    minWidth: 80,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#8E8E93",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  saveButtonText: {
    color: "white",
    fontSize: 14,
  },
  profileFields: {
    gap: 12,
  },
  profileField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 122, 255, 0.1)",
  },
  fieldLabel: {
    fontSize: 14,
    opacity: 0.7,
    width: 80,
  },
  fieldValue: {
    flex: 1,
    fontSize: 14,
    textAlign: "right",
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  unauthorizedTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  unauthorizedText: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.7,
  },
  loginButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: "white",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  errorText: {
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.7,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
  },
});
