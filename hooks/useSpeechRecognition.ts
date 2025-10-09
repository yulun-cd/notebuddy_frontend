import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';

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
    transcribedText: '',
    isProcessing: false,
    error: null,
  });

  const recognitionRef = useRef<any>(null);
  const recognitionTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    // Check if Web Speech API is available
    if (Platform.OS === 'web' && !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setState(prev => ({
        ...prev,
        error: 'Speech recognition is not supported in this browser',
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

      setState(prev => ({
        ...prev,
        isRecording: false,
        isProcessing: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to stop speech recognition';
      setState(prev => ({
        ...prev,
        isRecording: false,
        isProcessing: false,
        error: errorMessage,
      }));
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        isRecording: false,
        isProcessing: true,
        error: null,
        transcribedText: '',
      }));

      if (Platform.OS !== 'web') {
        throw new Error('Speech recognition is only available on web platform in Expo Go');
      }

      // Initialize Web Speech API
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error('Speech recognition is not supported in this browser');
      }

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setState(prev => ({
          ...prev,
          isRecording: true,
          isProcessing: false,
        }));
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setState(prev => ({
          ...prev,
          transcribedText: transcript,
        }));
      };

      recognitionRef.current.onerror = (event: any) => {
        setState(prev => ({
          ...prev,
          isRecording: false,
          isProcessing: false,
          error: event.error,
        }));
      };

      recognitionRef.current.onend = () => {
        setState(prev => ({
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to start speech recognition';
      setState(prev => ({
        ...prev,
        isRecording: false,
        isProcessing: false,
        error: errorMessage,
      }));
      Alert.alert('Speech Recognition Error', errorMessage);
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
      transcribedText: '',
      isProcessing: false,
      error: null,
    });
  }, []);

  const setTranscribedText = useCallback((text: string) => {
    setState(prev => ({
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

// Mock implementation for native platforms in Expo Go
const useMockSpeechRecognition = () => {
  const [state, setState] = useState<SpeechRecognitionState>({
    isRecording: false,
    transcribedText: '',
    isProcessing: false,
    error: null,
  });

  const recognitionTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        isRecording: false,
        isProcessing: true,
        error: null,
        transcribedText: '',
      }));

      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      setState(prev => ({
        ...prev,
        isRecording: true,
        isProcessing: false,
      }));

      // Auto-stop after 5 seconds with mock transcription
      recognitionTimeoutRef.current = setTimeout(() => {
        stopRecording();
        // Simulate transcribed text
        setState(prev => ({
          ...prev,
          transcribedText: "This is a mock transcription. For full speech recognition functionality, please use the web version or create a development build.",
        }));
      }, 5000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start speech recognition';
      setState(prev => ({
        ...prev,
        isRecording: false,
        isProcessing: false,
        error: errorMessage,
      }));
      Alert.alert('Speech Recognition Error', errorMessage);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      if (recognitionTimeoutRef.current) {
        clearTimeout(recognitionTimeoutRef.current);
      }

      setState(prev => ({
        ...prev,
        isRecording: false,
        isProcessing: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to stop speech recognition';
      setState(prev => ({
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

    setState({
      isRecording: false,
      transcribedText: '',
      isProcessing: false,
      error: null,
    });
  }, []);

  const setTranscribedText = useCallback((text: string) => {
    setState(prev => ({
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
export const useSpeechRecognition = Platform.OS === 'web' ? useWebSpeechRecognition : useMockSpeechRecognition;
