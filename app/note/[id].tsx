import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useNotes } from '@/contexts/NotesContext';
import { usePreventRemove } from '@react-navigation/native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { currentNote, isLoading, error, loadNote, updateNote } = useNotes();
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const titleInputRef = useRef<TextInput>(null);
  const contentInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (id) {
      loadNote(id);
    }
  }, [id]);

  useEffect(() => {
    if (currentNote) {
      setEditedTitle(currentNote.title);
      setEditedContent(currentNote.content);
      setHasUnsavedChanges(false);
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
            numberOfLines={10}
            editable={!isSaving}
          />
        </View>

        <View style={styles.actions}>
          {hasUnsavedChanges && (
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={saveChanges}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <ThemedText type="defaultSemiBold" style={styles.actionButtonText}>
                  Save Changes
                </ThemedText>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
    minHeight: 200,
    textAlignVertical: 'top',
  },
  actions: {
    marginTop: 24,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
});
