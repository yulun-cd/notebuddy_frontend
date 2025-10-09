import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { VoiceInput } from '@/components/VoiceInput';
import { useTranscripts } from '@/contexts/TranscriptsContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CreateTranscriptScreen() {
  const router = useRouter();
  const { createTranscript } = useTranscripts();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in both title and content');
      return;
    }

    setIsSubmitting(true);
    try {
      await createTranscript(title.trim(), content.trim());
      Alert.alert(
        'Success',
        'Transcript created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create transcript';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard this transcript?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <ThemedText type="title">Create Transcript</ThemedText>
            <ThemedText type="default" style={styles.subtitle}>
              Add a new transcript with title and content
            </ThemedText>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Title
              </ThemedText>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter transcript title"
                placeholderTextColor="#999"
                maxLength={200}
                autoFocus
              />
              <ThemedText type="default" style={styles.charCount}>
                {title.length}/200
              </ThemedText>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Content
              </ThemedText>
              <VoiceInput
                value={content}
                onChangeText={setContent}
                placeholder="Enter transcript content..."
              />
              <ThemedText type="default" style={styles.charCount}>
                {content.length}/5000
              </ThemedText>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={isSubmitting}
            >
              <ThemedText type="defaultSemiBold" style={styles.cancelButtonText}>
                Cancel
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                (!title.trim() || !content.trim() || isSubmitting) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!title.trim() || !content.trim() || isSubmitting}
            >
              <ThemedText
                type="defaultSemiBold"
                style={[
                  styles.submitButtonText,
                  (!title.trim() || !content.trim() || isSubmitting) && styles.submitButtonTextDisabled,
                ]}
              >
                {isSubmitting ? 'Creating...' : 'Create Transcript'}
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
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  cancelButtonText: {
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(0, 122, 255, 0.5)',
  },
  submitButtonText: {
    color: 'white',
  },
  submitButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
