import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { VoiceInput } from "@/components/VoiceInput";
import { useTranscripts } from "@/contexts/TranscriptsContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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

export default function CreateTranscriptScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { createTranscript } = useTranscripts();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert(t("common.error"), t("transcript.fillRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      await createTranscript(title.trim(), content.trim());
      Alert.alert(t("common.success"), t("transcript.createSuccess"), [
        {
          text: t("common.ok"),
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("transcript.createError");
      Alert.alert(t("common.error"), errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      Alert.alert(t("alert.confirmDiscard"), t("alert.discardMessage"), [
        { text: t("common.keepEditing"), style: "cancel" },
        {
          text: t("common.discard"),
          style: "destructive",
          onPress: () => router.back(),
        },
      ]);
    } else {
      router.back();
    }
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
            <ThemedText type="title">{t("transcript.create")}</ThemedText>
            <ThemedText type="default" style={styles.subtitle}>
              {t("transcript.createDescription")}
            </ThemedText>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                {t("transcript.title")}
              </ThemedText>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder={t("transcript.titlePlaceholder")}
                placeholderTextColor="#999"
                maxLength={200}
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                {t("transcript.content")}
              </ThemedText>
              <VoiceInput
                value={content}
                onChangeText={setContent}
                placeholder={t("transcript.contentPlaceholder")}
              />
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={isSubmitting}
            >
              <ThemedText
                type="defaultSemiBold"
                style={styles.cancelButtonText}
              >
                {t("common.cancel")}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                (!title.trim() || !content.trim() || isSubmitting) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!title.trim() || !content.trim() || isSubmitting}
            >
              <ThemedText
                type="defaultSemiBold"
                style={[
                  styles.submitButtonText,
                  (!title.trim() || !content.trim() || isSubmitting) &&
                    styles.submitButtonTextDisabled,
                ]}
              >
                {isSubmitting
                  ? t("transcript.creating")
                  : t("transcript.create")}
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
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 32,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  textArea: {
    minHeight: 150,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: "right",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 32,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.2)",
  },
  cancelButtonText: {
    color: "#666",
  },
  submitButton: {
    backgroundColor: "#007AFF",
  },
  submitButtonDisabled: {
    backgroundColor: "rgba(0, 122, 255, 0.5)",
  },
  submitButtonText: {
    color: "white",
  },
  submitButtonTextDisabled: {
    color: "rgba(255, 255, 255, 0.7)",
  },
});
