import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useNotes } from '@/contexts/NotesContext';
import { notesService } from '@/services/notesService';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, usePreventRemove } from '@react-navigation/native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Menu, MenuItem } from 'react-native-material-menu';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { currentNote, isLoading, error, loadNote, updateNote } = useNotes();
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [transcriptId, setTranscriptId] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

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
            View Original Transcript
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to update note';
      Alert.alert('Error', errorMessage);
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
      const generatedQuestions = await notesService.generateQuestions(currentNote.id);
      setQuestions(generatedQuestions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate questions';
      setQuestionsError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsGeneratingQuestions(false);
      Alert.alert('Questions Generated', 'New questions have been generated. Scroll to the bottom to view them.', );
    }
  };

  const handleQuestionPress = (question: string, index: number) => {
    if (!currentNote) return;

    // Navigate to the answering screen with the question and note_id
    router.push({
      pathname: `/answer/${currentNote.id}`,
      params: { question }
    } as any);
  };

  const handleViewTranscript = () => {
    hideMenu();

    // Check for unsaved changes before navigating
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to discard them?',
        [
          {
            text: "Don't leave",
            style: 'cancel',
            onPress: () => {
              // User stays on the note screen
            },
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              // Discard changes and navigate to transcript
              setHasUnsavedChanges(false);
              if (transcriptId) {
                router.push(`/transcript/${transcriptId}` as any);
              } else {
                Alert.alert('Error', 'No transcript found for this note');
              }
            },
          },
        ]
      );
    } else {
      // No unsaved changes, navigate directly
      if (transcriptId) {
        router.push(`/transcript/${transcriptId}` as any);
      } else {
        Alert.alert('Error', 'No transcript found for this note');
      }
    }
  };

  // Handle navigation away with unsaved changes using usePreventRemove hook
  usePreventRemove(hasUnsavedChanges, () => {
    if (!hasUnsavedChanges) {
      return;
    }

    // Show confirmation dialog
    Alert.alert(
      'Unsaved Changes',
      'You have unsaved changes. Do you want to discard them?',
      [
        {
          text: "Don't leave",
          style: 'cancel',
          onPress: () => {
            // Navigation is automatically prevented by usePreventRemove
            // User stays on the note screen
          },
        },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            // Discard changes and navigate back immediately
            setHasUnsavedChanges(false);
            // Use setTimeout to ensure state update happens before navigation
            setTimeout(() => {
              router.back();
            }, 0);
          },
        },
      ]
    );
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <ThemedText type="default" style={styles.loadingText}>
            Loading note...
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
            {error || 'Note not found'}
          </ThemedText>
          <ThemedText type="default" style={styles.errorText}>
            {error
              ? 'There was a problem loading this note.'
              : 'The note you are looking for does not exist.'
            }
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
            placeholder="Enter note title"
            multiline
            editable={!isSaving}
          />
          <ThemedText type="default" style={styles.date}>
            Created {formatDate(currentNote.created_at)}
            {'\n'}
            {hasUnsavedChanges && ' • Unsaved changes'}
            {isSaving && ' • Saving...'}
          </ThemedText>
        </View>

        <View style={styles.contentSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Content
          </ThemedText>
          <TextInput
            ref={contentInputRef}
            style={styles.contentInput}
            value={editedContent}
            onChangeText={handleContentChange}
            onBlur={handleContentBlur}
            placeholder="Enter note content"
            multiline
            textAlignVertical="top"
            editable={!isSaving}
          />
        </View>

        {questions.length > 0 && (
          <View style={styles.questionsSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Generated Questions
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
              (isSaving||!hasUnsavedChanges) && styles.disabledButton
            ]}
            onPress={saveChanges}
            disabled={(isSaving||!hasUnsavedChanges)}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <ThemedText type="defaultSemiBold" style={styles.actionButtonText}>
                Save Changes
              </ThemedText>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.generateQuestionsButton,
              (isSaving || isGeneratingQuestions) && styles.disabledButton
            ]}
            onPress={generateQuestions}
            disabled={isSaving || isGeneratingQuestions}
          >
            {isGeneratingQuestions ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <ThemedText type="defaultSemiBold" style={styles.actionButtonText}>
                Generate Questions
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
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  header: {
    marginBottom: 24,
  },
  titleInput: {
    fontSize: 24,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
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
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    flex: 1,
    textAlignVertical: 'top',
  },
  actions: {
    marginTop: 24,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 32,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 44,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  disabledButton: {
    backgroundColor: '#C7C7CC',
    opacity: 0.6,
  },
  generateQuestionsButton: {
    backgroundColor: '#5856D6',
  },
  questionsSection: {
    marginBottom: 24,
  },
  questionsList: {
    gap: 8,
  },
  questionItem: {
    backgroundColor: 'rgba(88, 86, 214, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(88, 86, 214, 0.2)',
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
