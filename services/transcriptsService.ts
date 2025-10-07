import { Note, PaginatedResponse, Transcript } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './api';

const CACHE_KEY = 'transcripts_cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export class TranscriptsService {
  private async getCachedTranscripts(): Promise<{ data: Transcript[]; timestamp: number } | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Check if cache is still valid
        if (Date.now() - parsed.timestamp < CACHE_EXPIRY) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Failed to get cached transcripts:', error);
    }
    return null;
  }

  private async setCachedTranscripts(transcripts: Transcript[]): Promise<void> {
    try {
      const cacheData = {
        data: transcripts,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to cache transcripts:', error);
    }
  }

  async getTranscripts(useCache: boolean = true): Promise<Transcript[]> {
    // Try to get from cache first if requested
    if (useCache) {
      const cached = await this.getCachedTranscripts();
      if (cached) {
        return cached.data;
      }
    }

    // Fetch from API
    const response = await apiService.get<PaginatedResponse<Transcript>>('/transcripts/');

    if (response.status >= 200 && response.status < 300) {
      // Handle different response formats
      let transcripts: Transcript[];

      if (response.data.data) {
        // If response has data property with pagination
        transcripts = response.data.data.data || response.data.data;
      } else if (Array.isArray(response.data)) {
        // If response is directly an array
        transcripts = response.data;
      } else {
        throw new Error('Unexpected response format');
      }

      // Cache the results
      await this.setCachedTranscripts(transcripts);
      return transcripts;
    }

    throw new Error(response.data.error || 'Failed to fetch transcripts');
  }

  async getTranscript(id: string): Promise<Transcript> {
    const response = await apiService.get<Transcript>(`/transcripts/${id}`);

    if (response.status >= 200 && response.status < 300) {
      // Handle different response formats
      let transcript: Transcript;

      if (response.data.data) {
        // If response has data property
        transcript = response.data.data as Transcript;
      } else {
        // If response is directly the transcript
        transcript = response.data as Transcript;
      }

      return transcript;
    }

    throw new Error(response.data.error || 'Failed to fetch transcript');
  }

  async createTranscript(transcriptData: { title: string; content: string }): Promise<Transcript> {
    const response = await apiService.post<Transcript>('/transcripts/', transcriptData);

    if (response.status >= 200 && response.status < 300) {
      // Handle different response formats
      let transcript: Transcript;

      if (response.data.data) {
        // If response has data property
        transcript = response.data.data as Transcript;
      } else {
        // If response is directly the transcript
        transcript = response.data as Transcript;
      }

      // Invalidate cache since we added a new transcript
      await AsyncStorage.removeItem(CACHE_KEY);
      return transcript;
    }

    throw new Error(response.data.error || 'Failed to create transcript');
  }

  async updateTranscript(id: string, transcriptData: Partial<Transcript>): Promise<Transcript> {
    const response = await apiService.put<Transcript>(`/transcripts/${id}`, transcriptData);

    if (response.status >= 200 && response.status < 300) {
      // Handle different response formats
      let transcript: Transcript;

      if (response.data.data) {
        // If response has data property
        transcript = response.data.data as Transcript;
      } else {
        // If response is directly the transcript
        transcript = response.data as Transcript;
      }

      // Invalidate cache since we updated a transcript
      await AsyncStorage.removeItem(CACHE_KEY);
      return transcript;
    }

    throw new Error(response.data.error || 'Failed to update transcript');
  }

  async deleteTranscript(id: string): Promise<void> {
    const response = await apiService.delete(`/transcripts/${id}`);

    if (response.status >= 200 && response.status < 300) {
      // Invalidate cache since we deleted a transcript
      await AsyncStorage.removeItem(CACHE_KEY);
      return;
    }

    throw new Error(response.data.error || 'Failed to delete transcript');
  }

  async generateNote(transcriptId: string): Promise<Note> {
    console.log('Generating note for transcript ID:', transcriptId);
    const response = await apiService.post<Note>(
      `/transcripts/${transcriptId}/generate-note`,
    );

    if (response.status >= 200 && response.status < 300) {
      // Handle different response formats
      let noteData: Note;

      if (response.data.data) {
        // If response has data property
        noteData = response.data.data as Note;
      } else {
        // If response is directly the note data
        noteData = response.data as Note;
      }

      return noteData;
    }

    throw new Error(response.data.error || 'Failed to generate note');
  }

  async clearCache(): Promise<void> {
    await AsyncStorage.removeItem(CACHE_KEY);
  }
}

export const transcriptsService = new TranscriptsService();
