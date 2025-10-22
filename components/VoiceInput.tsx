import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface VoiceInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  value,
  onChangeText,
  placeholder = "Enter text or use voice input...",
}) => {
  const { t } = useTranslation();
  const {
    isRecording,
    isProcessing,
    transcribedText,
    error,
    startRecording,
    stopRecording,
    reset,
  } = useSpeechRecognition();

  const handleRecordingToggle = async () => {
    if (isRecording) {
      await stopRecording();
      // Append the transcribed text to existing content
      if (transcribedText) {
        const newText = value ? `${value} ${transcribedText}` : transcribedText;
        onChangeText(newText);
        reset();
      }
    } else {
      await startRecording();
    }
  };

  const handleTextChange = (text: string) => {
    onChangeText(text);
  };

  // Show error if any
  React.useEffect(() => {
    if (error) {
      Alert.alert(t("voice.recognitionError"), error);
    }
  }, [error, t]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          multiline
          textAlignVertical="top"
          editable={!isRecording}
        />

        <View style={styles.voiceControls}>
          <TouchableOpacity
            style={[
              styles.microphoneButton,
              isRecording && styles.recordingButton,
            ]}
            onPress={handleRecordingToggle}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <ThemedText type="default" style={styles.microphoneIcon}>
                🎤
              </ThemedText>
            )}
          </TouchableOpacity>

          <ThemedText type="default" style={styles.instructionText}>
            {isRecording ? t("voice.listening") : t("voice.tapToSpeak")}
          </ThemedText>
        </View>
      </View>

      {isRecording && (
        <ThemedText type="default" style={styles.recordingIndicator}>
          ● {t("voice.recordingInProgress")}
        </ThemedText>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "white",
    minHeight: 120,
    textAlignVertical: "top",
  },
  voiceControls: {
    alignItems: "center",
    gap: 8,
    paddingTop: 8,
  },
  microphoneButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#34C759",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recordingButton: {
    backgroundColor: "#FF3B30",
    transform: [{ scale: 1.1 }],
  },
  microphoneIcon: {
    fontSize: 20,
    color: "white",
  },
  instructionText: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
  },
  recordingIndicator: {
    color: "#FF3B30",
    fontWeight: "bold",
    marginTop: 8,
    fontSize: 14,
  },
});
