import { transcriptsService } from '@/services/transcriptsService';
import { Transcript } from '@/types';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';


interface TranscriptsContextType {
  transcripts: Transcript[];
  isLoading: boolean;
  error: string | null;
  refreshTranscripts: (useCache?: boolean) => Promise<void>;
  createTranscript: (title: string, content: string) => Promise<Transcript>;
  updateTranscript: (id: string, transcriptData: Partial<Transcript>) => Promise<Transcript>;
  deleteTranscript: (id: string) => Promise<void>;
  clearError: () => void;
}

const TranscriptsContext = createContext<TranscriptsContextType | undefined>(undefined);

interface TranscriptsProviderProps {
  children: ReactNode;
}

export const TranscriptsProvider: React.FC<TranscriptsProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      refreshTranscripts(true); // Use cache on initial load
    } else {
      // Clear transcripts and cache when user logs out
      setTranscripts([]);
      setError(null);
      transcriptsService.clearCache();
    }
  }, [isAuthenticated]);

  const refreshTranscripts = async (useCache: boolean = true) => {
    // Only fetch transcripts if user is authenticated
    if (!isAuthenticated) {
      setTranscripts([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const fetchedTranscripts = await transcriptsService.getTranscripts(useCache);
      setTranscripts(fetchedTranscripts);
    } catch (err) {
      console.error('Error fetching transcripts:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transcripts';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const createTranscript = async (title: string, content: string): Promise<Transcript> => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to create a transcript');
    }

    setIsLoading(true);
    setError(null);
    try {
      const newTranscript = await transcriptsService.createTranscript({ title, content });
      // Refresh the list to include the new transcript
      await refreshTranscripts(false); // Don't use cache since we just added a new one
      return newTranscript;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create transcript';
      setError(errorMessage);
      console.error('Failed to create transcript:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTranscript = async (id: string, transcriptData: Partial<Transcript>): Promise<Transcript> => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to update a transcript');
    }

    setIsLoading(true);
    setError(null);
    try {
      const updatedTranscript = await transcriptsService.updateTranscript(id, transcriptData);
      // Update the transcript in local state
      setTranscripts(prev => prev.map(transcript =>
        transcript.id === id ? updatedTranscript : transcript
      ));
      return updatedTranscript;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update transcript';
      setError(errorMessage);
      console.error('Failed to update transcript:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTranscript = async (id: string) => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to delete a transcript');
    }

    setIsLoading(true);
    setError(null);
    try {
      await transcriptsService.deleteTranscript(id);
      // Remove the deleted transcript from local state
      setTranscripts(prev => prev.filter(transcript => transcript.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete transcript';
      setError(errorMessage);
      console.error('Failed to delete transcript:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: TranscriptsContextType = {
    transcripts,
    isLoading,
    error,
    refreshTranscripts,
    createTranscript,
    updateTranscript,
    deleteTranscript,
    clearError,
  };

  return <TranscriptsContext.Provider value={value}>{children}</TranscriptsContext.Provider>;
};

export const useTranscripts = (): TranscriptsContextType => {
  const context = useContext(TranscriptsContext);
  if (context === undefined) {
    throw new Error('useTranscripts must be used within a TranscriptsProvider');
  }
  return context;
};
