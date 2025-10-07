import { notesService } from '@/services/notesService';
import { Note } from '@/types';
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface NotesContextType {
  currentNote: Note | null;
  isLoading: boolean;
  error: string | null;
  loadNote: (noteId: string) => Promise<void>;
  updateNote: (noteId: string, noteData: Partial<Note>) => Promise<Note>;
  clearError: () => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

interface NotesProviderProps {
  children: ReactNode;
}

export const NotesProvider: React.FC<NotesProviderProps> = ({ children }) => {
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNote = async (noteId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const note = await notesService.getNote(noteId);
      setCurrentNote(note);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load note';
      setError(errorMessage);
      console.error('Failed to load note:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateNote = async (noteId: string, noteData: Partial<Note>): Promise<Note> => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedNote = await notesService.updateNote(noteId, noteData);
      // Update the note in local state
      setCurrentNote(updatedNote);
      return updatedNote;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update note';
      setError(errorMessage);
      console.error('Failed to update note:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: NotesContextType = {
    currentNote,
    isLoading,
    error,
    loadNote,
    updateNote,
    clearError,
  };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
};

export const useNotes = (): NotesContextType => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
