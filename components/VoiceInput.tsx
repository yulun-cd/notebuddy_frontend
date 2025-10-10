import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface VoiceInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onModeChange?: (isVoiceMode: boolean) => void;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Tap the microphone to speak',
  onModeChange,
}) => {
  const {
    isRecording,
    isProcessing,
    transcribedText,
    error,
    startRecording,
    stopRecording,
    reset,
    setTranscribedText,
  } = useSpeechRecognition();

  const [mode, setMode] = React.useState<'voice' | 'text'>('voice');
  const isVoiceMode = mode === 'voice';

  const handleToggleMode = () => {
    if (isVoiceMode) {
      // Switching to text mode
      setMode('text');
      onModeChange?.(false);
    } else {
      // Switching to voice mode
      setMode('voice');
      reset();
      onChangeText('');
      onModeChange?.(true);
    }
  };

  const handleRecordingToggle = async () => {
    if (isRecording) {
      await stopRecording();
      // Update the parent component with the transcribed text
      if (transcribedText) {
        onChangeText(transcribedText);
      }
    } else {
      await startRecording();
    }
  };

  const handleTextChange = (text: string) => {
    onChangeText(text);
    setTranscribedText(text);
  };

  // Show error if any
  React.useEffect(() => {
    if (error) {
      Alert.alert('Speech Recognition Error', error);
    }
  }, [error]);

  return (
    <ThemedView style={styles.container}>
      {isVoiceMode ? (
        // Voice Mode - Default View
        <View style={styles.voiceModeContainer}>
          <TouchableOpacity
            style={[
              styles.microphoneButton,
              isRecording && styles.recordingButton,
            ]}
            onPress={handleRecordingToggle}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="large" color="white" />
            ) : (
              <ThemedText type="title" style={styles.microphoneIcon}>
                🎤
              </ThemedText>
            )}
          </TouchableOpacity>

          <ThemedText type="subtitle" style={styles.instructionText}>
            {isRecording ? 'Listening... Speak now' : 'Tap to start speaking'}
          </ThemedText>

          {isRecording && (
            <ThemedText type="default" style={styles.recordingIndicator}>
              ● Recording
            </ThemedText>
          )}

          <TouchableOpacity
            style={styles.switchModeButton}
            onPress={handleToggleMode}
          >
            <ThemedText type="default" style={styles.switchModeText}>
              Switch to text input
            </ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        // Text Mode - Show transcribed text for editing
        <View style={styles.textModeContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Edit your text
          </ThemedText>

          <TextInput
            style={styles.textInput}
            value={value || transcribedText}
            onChangeText={handleTextChange}
            placeholder={placeholder}
            multiline
            textAlignVertical="top"
            editable={!isRecording}
          />

          <View style={styles.textModeActions}>
            <TouchableOpacity
              style={styles.voiceButton}
              onPress={handleRecordingToggle}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <ThemedText type="defaultSemiBold" style={styles.voiceButtonText}>
                  {isRecording ? 'Stop Recording' : 'Record More'}
                </ThemedText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchModeButton}
              onPress={handleToggleMode}
            >
              <ThemedText type="default" style={styles.switchModeText}>
                Back to voice input
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  voiceModeContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(88, 86, 214, 0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(88, 86, 214, 0.2)',
  },
  microphoneButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recordingButton: {
    backgroundColor: '#FF3B30',
    transform: [{ scale: 1.1 }],
  },
  microphoneIcon: {
    fontSize: 36,
    color: 'white',
  },
  instructionText: {
    textAlign: 'center',
    marginBottom: 8,
    opacity: 0.8,
  },
  recordingIndicator: {
    color: '#FF3B30',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  switchModeButton: {
    padding: 8,
  },
  switchModeText: {
    color: '#5856D6',
    textDecorationLine: 'underline',
  },
  textModeContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    marginBottom: 12,
    opacity: 0.8,
  },
  textInput: {
    fontSize: 16,
    lineHeight: 24,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  textModeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voiceButton: {
    backgroundColor: '#5856D6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  voiceButtonText: {
    color: 'white',
    fontSize: 14,
  },
});
