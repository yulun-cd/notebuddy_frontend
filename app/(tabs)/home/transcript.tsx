import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTranscripts } from "@/contexts/TranscriptsContext";
import i18n from "@/services/i18n";
import { transcriptsService } from "@/services/transcriptsService";
import { Transcript } from "@/types";
import { usePreventRemove } from "@react-navigation/native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function TranscriptDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { updateTranscript } = useTranscripts();
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);

  const titleInputRef = useRef<TextInput>(null);
  const contentInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (id) {
      loadTranscript();
    }
  }, [id]);

  const loadTranscript = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const transcriptData = await transcriptsService.getTranscript(id);
      setTranscript(transcriptData);
      setEditedTitle(transcriptData.title);
      setEditedContent(transcriptData.content);

      // Note: We no longer track note state since View Note button was removed
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("transcript.loadError");
      setError(errorMessage);
      console.error("Failed to load transcript:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTitleChange = (text: string) => {
    setEditedTitle(text);
    setHasUnsavedChanges(true);
  };

  const handleContentChange = (text: string) => {
    setEditedContent(text);
    setHasUnsavedChanges(true);
  };

  const saveChanges = async () => {
    if (!transcript || !hasUnsavedChanges) return;

    try {
      setIsSaving(true);
      const updatedTranscript = await updateTranscript(transcript.id, {
        title: editedTitle,
        content: editedContent,
      });

      setTranscript(updatedTranscript);
      setHasUnsavedChanges(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("transcript.updateError");
      Alert.alert(t("common.error"), errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateNote = async () => {
    if (!transcript) return;

    // Check if transcript already has a note
    if (transcript.note_id) {
      Alert.alert(
        t("transcript.overwriteNote"),
        t("transcript.overwriteMessage"),
        [
          {
            text: t("common.cancel"),
            style: "cancel",
          },
          {
            text: t("transcript.overwrite"),
            style: "destructive",
            onPress: async () => {
              await generateNewNote();
            },
          },
        ]
      );
    } else {
      // No existing note, generate directly
      await generateNewNote();
    }
  };

  const generateNewNote = async () => {
    if (!transcript) return;

    try {
      setIsGeneratingNote(true);
      const result = await transcriptsService.generateNote(transcript.id);
      // Auto-navigate to the new note screen
      router.push(`/home/note?id=${result.id}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("transcript.generateNoteError");
      Alert.alert(t("common.error"), errorMessage);
    } finally {
      setIsGeneratingNote(false);
    }
  };

  // Handle navigation away with unsaved changes using usePreventRemove hook
  usePreventRemove(hasUnsavedChanges, () => {
    if (!hasUnsavedChanges) {
      return;
    }

    // Show confirmation dialog
    Alert.alert(t("alert.unsavedChanges"), t("alert.discardMessage"), [
      {
        text: t("common.dontLeave"),
        style: "cancel",
        onPress: () => {
          // Navigation is automatically prevented by usePreventRemove
          // User stays on the transcript screen
        },
      },
      {
        text: t("common.discard"),
        style: "destructive",
        onPress: () => {
          // Discard changes and navigate back immediately
          setHasUnsavedChanges(false);
          // Use setTimeout to ensure state update happens before navigation
          setTimeout(() => {
            router.back();
          }, 0);
        },
      },
    ]);
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <ThemedText type="default" style={styles.loadingText}>
            {t("common.loading")}
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error || !transcript) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText type="title" style={styles.errorTitle}>
            {error || t("transcript.notFound")}
          </ThemedText>
          <ThemedText type="default" style={styles.errorText}>
            {error ? t("transcript.loadError") : t("transcript.notExist")}
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TextInput
            ref={titleInputRef}
            style={styles.titleInput}
            value={editedTitle}
            onChangeText={handleTitleChange}
            placeholder={t("transcript.titlePlaceholder")}
            multiline
            editable={!isSaving && !isGeneratingNote}
          />
          <ThemedText type="default" style={styles.date}>
            {t("transcript.created")} {formatDate(transcript.created_at)}
            {"\n"}
            {hasUnsavedChanges && ` • ${t("transcript.unsavedChanges")}`}
            {isSaving && ` • ${t("transcript.saving")}`}
          </ThemedText>
        </View>

        <View style={styles.contentSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t("transcript.content")}
          </ThemedText>
          <TextInput
            ref={contentInputRef}
            style={styles.contentInput}
            value={editedContent}
            onChangeText={handleContentChange}
            placeholder={t("transcript.contentPlaceholder")}
            multiline
            textAlignVertical="top"
            editable={!isSaving && !isGeneratingNote}
          />
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.saveButton,
            (isSaving || !hasUnsavedChanges) && styles.disabledButton,
          ]}
          onPress={saveChanges}
          disabled={isSaving || !hasUnsavedChanges}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <ThemedText type="defaultSemiBold" style={styles.actionButtonText}>
              {t("transcript.saveChanges")}
            </ThemedText>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.generateNoteButton,
            (isSaving || isGeneratingNote) && styles.disabledButton,
          ]}
          onPress={handleGenerateNote}
          disabled={isSaving || isGeneratingNote}
        >
          {isGeneratingNote ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <ThemedText type="defaultSemiBold" style={styles.actionButtonText}>
              {t("transcript.generateNote")}
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    opacity: 0.7,
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
    opacity: 0.7,
  },
  header: {
    marginBottom: 24,
  },
  titleInput: {
    fontSize: 24,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "white",
  },
  date: {
    fontSize: 14,
    opacity: 0.7,
  },
  contentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    opacity: 0.8,
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "white",
    flex: 1,
    textAlignVertical: "top",
  },
  actions: {
    marginTop: 24,
  },
  bottomActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 32,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    gap: 12,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    minHeight: 44,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#34C759",
  },
  generateNoteButton: {
    backgroundColor: "#5856D6",
  },
  disabledButton: {
    backgroundColor: "#C7C7CC",
    opacity: 0.6,
  },
});
