import { Note } from '@/types';
import { apiService } from './api';

export class NotesService {
  async getNote(noteId: string): Promise<Note> {
    const response = await apiService.get<Note>(`/notes/${noteId}`);

    if (response.status >= 200 && response.status < 300) {
      // Handle different response formats
      let note: Note;

      if (response.data.data) {
        // If response has data property
        note = response.data.data as Note;
      } else {
        // If response is directly the note
        note = response.data as Note;
      }

      return note;
    }

    throw new Error(response.data.error || 'Failed to fetch note');
  }

  async updateNote(noteId: string, noteData: Partial<Note>): Promise<Note> {
    const response = await apiService.put<Note>(`/notes/${noteId}`, noteData);

    if (response.status >= 200 && response.status < 300) {
      // Handle different response formats
      let note: Note;

      if (response.data.data) {
        // If response has data property
        note = response.data.data as Note;
      } else {
        // If response is directly the note
        note = response.data as Note;
      }

      return note;
    }

    throw new Error(response.data.error || 'Failed to update note');
  }

  async getNoteByTranscriptId(transcriptId: string): Promise<Note | null> {
    try {
      const response = await apiService.get<Note>(`/notes/transcript/${transcriptId}`);

      if (response.status >= 200 && response.status < 300) {
        // Handle different response formats
        let note: Note;

        if (response.data.data) {
          // If response has data property
          note = response.data.data as Note;
        } else {
          // If response is directly the note
          note = response.data as Note;
        }

        return note;
      }
    } catch (error) {
      // If no note exists for this transcript, return null
      console.log('No note found for transcript:', transcriptId);
    }

    return null;
  }

  async generateQuestions(noteId: string): Promise<string[]> {
    const response = await apiService.post<string[]>(`/notes/${noteId}/generate-questions`);

    if (response.status >= 200 && response.status < 300) {
      // Handle different response formats
      let questions: string[];

      if (response.data.data) {
        // If response has data property
        questions = response.data.data as string[];
      } else {
        // If response is directly the questions array
        questions = response.data as string[];
      }

      return questions;
    }

    throw new Error(response.data.error || 'Failed to generate questions');
  }

  async updateWithAnswer(noteId: string, question: string, answer: string): Promise<void> {
    const response = await apiService.post(`/notes/${noteId}/update-with-answer`, {
      question,
      answer,
    });

    if (response.status >= 200 && response.status < 300) {
      return;
    }

    throw new Error(response.data.error || 'Failed to update note with answer');
  }
}

export const notesService = new NotesService();
