import Voice from "@react-native-voice/voice";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Platform } from "react-native";

export interface SpeechRecognitionState {
  isRecording: boolean;
  transcribedText: string;
  isProcessing: boolean;
  error: string | null;
}

// Web Speech API implementation for web platform
const useWebSpeechRecognition = () => {
  const [state, setState] = useState<SpeechRecognitionState>({
    isRecording: false,
    transcribedText: "",
    isProcessing: false,
    error: null,
  });

  const recognitionRef = useRef<any>(null);
  const recognitionTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    // Check if Web Speech API is available
    if (
      Platform.OS === "web" &&
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      setState((prev) => ({
        ...prev,
        error: "Speech recognition is not supported in this browser",
      }));
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current);
      }

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      setState((prev) => ({
        ...prev,
        isRecording: false,
        isProcessing: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to stop speech recognition";
      setState((prev) => ({
        ...prev,
        isRecording: false,
        isProcessing: false,
        error: errorMessage,
      }));
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setState((prev) => ({
        ...prev,
        isRecording: false,
        isProcessing: true,
        error: null,
        transcribedText: "",
      }));

      if (Platform.OS !== "web") {
        throw new Error(
          "Speech recognition is only available on web platform in Expo Go"
        );
      }

      // Initialize Web Speech API
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error("Speech recognition is not supported in this browser");
      }

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "zh-CN";

      recognitionRef.current.onstart = () => {
        setState((prev) => ({
          ...prev,
          isRecording: true,
          isProcessing: false,
        }));
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setState((prev) => ({
          ...prev,
          transcribedText: transcript,
        }));
      };

      recognitionRef.current.onerror = (event: any) => {
        setState((prev) => ({
          ...prev,
          isRecording: false,
          isProcessing: false,
          error: event.error,
        }));
      };

      recognitionRef.current.onend = () => {
        setState((prev) => ({
          ...prev,
          isRecording: false,
          isProcessing: false,
        }));
      };

      recognitionRef.current.start();

      // Auto-stop after 60 seconds
      recognitionTimeoutRef.current = setTimeout(() => {
        stopRecording();
      }, 60000);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to start speech recognition";
      setState((prev) => ({
        ...prev,
        isRecording: false,
        isProcessing: false,
        error: errorMessage,
      }));
      Alert.alert("Speech Recognition Error", errorMessage);
    }
  }, [stopRecording]);

  const reset = useCallback(() => {
    if (recognitionTimeoutRef.current) {
      clearTimeout(recognitionTimeoutRef.current);
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setState({
      isRecording: false,
      transcribedText: "",
      isProcessing: false,
      error: null,
    });
  }, []);

  const setTranscribedText = useCallback((text: string) => {
    setState((prev) => ({
      ...prev,
      transcribedText: text,
    }));
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    reset,
    setTranscribedText,
  };
};

// Native implementation using @react-native-voice/voice
const useNativeSpeechRecognition = () => {
  const [state, setState] = useState<SpeechRecognitionState>({
    isRecording: false,
    transcribedText: "",
    isProcessing: false,
    error: null,
  });

  const recognitionTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    // Set up voice recognition event handlers
    Voice.onSpeechStart = () => {
      setState((prev) => ({
        ...prev,
        isRecording: true,
        isProcessing: false,
      }));
    };

    Voice.onSpeechEnd = () => {
      setState((prev) => ({
        ...prev,
        isRecording: false,
        isProcessing: false,
      }));
    };

    Voice.onSpeechResults = (event: any) => {
      if (event.value && event.value.length > 0) {
        const transcript = event.value[0];
        setState((prev) => ({
          ...prev,
          transcribedText: transcript,
        }));
      }
    };

    Voice.onSpeechError = (event: any) => {
      setState((prev) => ({
        ...prev,
        isRecording: false,
        isProcessing: false,
        error: event.error?.message || "Speech recognition error",
      }));
    };

    // Clean up on unmount
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setState((prev) => ({
        ...prev,
        isRecording: false,
        isProcessing: true,
        error: null,
        transcribedText: "",
      }));

      // Check if voice recognition is available
      const isAvailable = await Voice.isAvailable();
      if (!isAvailable) {
        throw new Error("Speech recognition is not available on this device");
      }

      // Start listening for Chinese
      await Voice.start("zh-CN");

      setState((prev) => ({
        ...prev,
        isProcessing: false,
      }));

      // Auto-stop after 60 seconds
      recognitionTimeoutRef.current = setTimeout(() => {
        stopRecording();
      }, 60000);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to start speech recognition";
      setState((prev) => ({
        ...prev,
        isRecording: false,
        isProcessing: false,
        error: errorMessage,
      }));
      Alert.alert("Speech Recognition Error", errorMessage);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current);
      }

      await Voice.stop();

      setState((prev) => ({
        ...prev,
        isRecording: false,
        isProcessing: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to stop speech recognition";
      setState((prev) => ({
        ...prev,
        isRecording: false,
        isProcessing: false,
        error: errorMessage,
      }));
    }
  }, []);

  const reset = useCallback(() => {
    if (recognitionTimeoutRef.current) {
      clearTimeout(recognitionTimeoutRef.current);
    }

    Voice.stop();

    setState({
      isRecording: false,
      transcribedText: "",
      isProcessing: false,
      error: null,
    });
  }, []);

  const setTranscribedText = useCallback((text: string) => {
    setState((prev) => ({
      ...prev,
      transcribedText: text,
    }));
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    reset,
    setTranscribedText,
  };
};

// Export the appropriate implementation based on platform
export const useSpeechRecognition =
  Platform.OS === "web" ? useWebSpeechRecognition : useNativeSpeechRecognition;
