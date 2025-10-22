import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useNotes } from "@/contexts/NotesContext";
import { notesService } from "@/services/notesService";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, usePreventRemove } from "@react-navigation/native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import { Menu, MenuItem } from "react-native-material-menu";

export default function NoteDetailScreen() {
  const { t, i18n } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { currentNote, isLoading, error, loadNote, updateNote } = useNotes();
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [transcriptId, setTranscriptId] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const titleInputRef = useRef<TextInput>(null);
  const contentInputRef = useRef<TextInput>(null);

  const hideMenu = () => setMenuVisible(false);
  const showMenu = () => setMenuVisible(true);

  // Set up navigation header with dropdown button
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Menu
          visible={menuVisible}
          anchor={
            <TouchableOpacity
              style={styles.headerDropdownButton}
              onPress={showMenu}
            >
              <Ionicons name="ellipsis-vertical" size={24} color="#007AFF" />
            </TouchableOpacity>
          }
          onRequestClose={hideMenu}
          style={styles.menuStyle}
        >
          <MenuItem onPress={handleViewTranscript}>
            {t("note.viewTranscript")}
          </MenuItem>
        </Menu>
      ),
    });
  }, [navigation, menuVisible, transcriptId]);

  useEffect(() => {
    if (id) {
      loadNote(id);
    }
  }, [id]);

  // Refresh data when screen comes into focus (e.g., when returning from answering screen)
  useFocusEffect(
    React.useCallback(() => {
      if (id) {
        loadNote(id);
      }
    }, [id])
  );

  useEffect(() => {
    if (currentNote) {
      setEditedTitle(currentNote.title);
      setEditedContent(currentNote.content);
      setHasUnsavedChanges(false);

      // Get transcript ID from note data
      if (currentNote.transcript_id) {
        setTranscriptId(currentNote.transcript_id);
      }
    }
  }, [currentNote]);

  const handleTitleChange = (text: string) => {
    setEditedTitle(text);
    setHasUnsavedChanges(true);
  };

  const handleContentChange = (text: string) => {
    setEditedContent(text);
    setHasUnsavedChanges(true);
  };

  const saveChanges = async () => {
    if (!currentNote || !hasUnsavedChanges) return;

    try {
      setIsSaving(true);
      await updateNote(currentNote.id, {
        title: editedTitle,
        content: editedContent,
      });

      setHasUnsavedChanges(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("note.updateError");
      Alert.alert(t("common.error"), errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleBlur = () => {
    // No auto-save - changes remain unsaved until manual save
    // hasUnsavedChanges remains true until user explicitly saves
  };

  const handleContentBlur = () => {
    // No auto-save - changes remain unsaved until manual save
    // hasUnsavedChanges remains true until user explicitly saves
  };

  const generateQuestions = async () => {
    if (!currentNote) return;

    try {
      setIsGeneratingQuestions(true);
      setQuestionsError(null);
      const generatedQuestions = await notesService.generateQuestions(
        currentNote.id
      );
      setQuestions(generatedQuestions);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("note.generateQuestionsError");
      setQuestionsError(errorMessage);
      Alert.alert(t("common.error"), errorMessage);
    } finally {
      setIsGeneratingQuestions(false);
      Alert.alert(
        t("note.questionsGenerated"),
        t("note.questionsGeneratedMessage")
      );
    }
  };

  const handleQuestionPress = (question: string, index: number) => {
    if (!currentNote) return;

    // Navigate to the answering screen with the question and note_id
    router.push(
      `/home/answer?note_id=${currentNote.id}&question=${encodeURIComponent(
        question
      )}`
    );
  };

  const handleViewTranscript = () => {
    hideMenu();

    // Check for unsaved changes before navigating
    if (hasUnsavedChanges) {
      Alert.alert(t("alert.unsavedChanges"), t("alert.discardMessage"), [
        {
          text: t("common.dontLeave"),
          style: "cancel",
          onPress: () => {
            // User stays on the note screen
          },
        },
        {
          text: t("common.discard"),
          style: "destructive",
          onPress: () => {
            // Discard changes and navigate to transcript
            setHasUnsavedChanges(false);
            if (transcriptId) {
              router.push(`/home/transcript?id=${transcriptId}`);
            } else {
              Alert.alert(t("common.error"), t("note.noTranscript"));
            }
          },
        },
      ]);
    } else {
      // No unsaved changes, navigate directly
      if (transcriptId) {
        router.push(`/home/transcript?id=${transcriptId}`);
      } else {
        Alert.alert(t("common.error"), t("note.noTranscript"));
      }
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
          // User stays on the note screen
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

  if (error || !currentNote) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText type="title" style={styles.errorTitle}>
            {error || t("note.notFound")}
          </ThemedText>
          <ThemedText type="default" style={styles.errorText}>
            {error ? t("note.loadError") : t("note.notExist")}
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
            onBlur={handleTitleBlur}
            placeholder={t("note.titlePlaceholder")}
            multiline
            editable={!isSaving && !isGeneratingQuestions}
          />
          <ThemedText type="default" style={styles.date}>
            {t("note.created")} {formatDate(currentNote.created_at)}
            {"\n"}
            {hasUnsavedChanges && ` • ${t("note.unsavedChanges")}`}
            {isSaving && ` • ${t("note.saving")}`}
          </ThemedText>
        </View>

        <View style={styles.contentSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t("note.content")}
          </ThemedText>
          <TextInput
            ref={contentInputRef}
            style={styles.contentInput}
            value={editedContent}
            onChangeText={handleContentChange}
            onBlur={handleContentBlur}
            placeholder={t("note.contentPlaceholder")}
            multiline
            textAlignVertical="top"
            editable={!isSaving && !isGeneratingQuestions}
          />
        </View>

        {questions.length > 0 && (
          <View style={styles.questionsSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t("note.generatedQuestions")}
            </ThemedText>
            {questionsError && (
              <ThemedText type="default" style={styles.errorText}>
                {questionsError}
              </ThemedText>
            )}
            <View style={styles.questionsList}>
              {questions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.questionItem}
                  onPress={() => handleQuestionPress(question, index)}
                >
                  <ThemedText type="default" style={styles.questionText}>
                    {question}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
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
              {t("note.saveChanges")}
            </ThemedText>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.generateQuestionsButton,
            (isSaving || isGeneratingQuestions) && styles.disabledButton,
          ]}
          onPress={generateQuestions}
          disabled={isSaving || isGeneratingQuestions}
        >
          {isGeneratingQuestions ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <ThemedText type="defaultSemiBold" style={styles.actionButtonText}>
              {t("note.generateQuestions")}
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
  headerDropdownButton: {
    padding: 8,
    marginRight: 16,
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
    backgroundColor: "#18612aff",
  },
  disabledButton: {
    backgroundColor: "#C7C7CC",
    opacity: 0.6,
  },
  generateQuestionsButton: {
    backgroundColor: "#28266dff",
  },
  questionsSection: {
    marginBottom: 24,
  },
  questionsList: {
    gap: 8,
  },
  questionItem: {
    backgroundColor: "rgba(88, 86, 214, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(88, 86, 214, 0.2)",
    borderRadius: 8,
    padding: 12,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 22,
  },
  menuStyle: {
    marginTop: 60, // Position below navigation bar
  },
});
