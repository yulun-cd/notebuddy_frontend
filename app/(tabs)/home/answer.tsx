import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { VoiceInput } from '@/components/VoiceInput';
import { notesService } from '@/services/notesService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

export default function AnswerScreen() {
  const { note_id } = useLocalSearchParams<{ note_id: string }>();
  const { question } = useLocalSearchParams<{ question: string }>();
  const router = useRouter();

  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!note_id || !question || !answer.trim()) {
      Alert.alert('Error', 'Please provide an answer before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);
      await notesService.updateWithAnswer(note_id, question, answer.trim());

      Alert.alert(
        'Success',
        'Your answer has been submitted successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to the note screen
              router.back();
            }
          }
        ]
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit answer';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.questionTitle}>
            {question || 'Question'}
          </ThemedText>
        </View>

        <View style={styles.answerSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Your Answer
          </ThemedText>
          <VoiceInput
            value={answer}
            onChangeText={setAnswer}
            placeholder="Enter your answer here..."
          />
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!answer.trim() || isSubmitting) && styles.disabledButton
          ]}
          onPress={handleSubmit}
          disabled={!answer.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <ThemedText type="defaultSemiBold" style={styles.submitButtonText}>
              Submit Answer
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
  header: {
    marginBottom: 24,
  },
  questionTitle: {
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
  },
  answerSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    opacity: 0.8,
  },
  answerInput: {
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
  bottomActions: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#C7C7CC',
    opacity: 0.6,
  },
});
