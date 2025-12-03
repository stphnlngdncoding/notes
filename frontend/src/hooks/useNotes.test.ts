import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useNotes } from './useNotes';

describe('useNotes', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial load', () => {
    it('should load notes and tags on mount', async () => {
      const mockNotes = [
        { id: '1', title: 'Note 1', content: 'Content 1', tags: ['work'], createdAt: '2024-01-01', updatedAt: '2024-01-01' }
      ];
      const mockTags = ['work', 'personal'];

      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/notes')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockNotes)
          });
        }
        if (url.includes('/tags')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockTags)
          });
        }
      });

      const { result } = renderHook(() => useNotes());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.notes).toEqual(mockNotes);
      expect(result.current.allTags).toEqual(mockTags);
    });
  });

  describe('createNote', () => {
    it('should optimistically add note and then replace with server response', async () => {
      const mockNotes = [
        { id: '1', title: 'Existing', content: 'Content', tags: [], createdAt: '2024-01-01', updatedAt: '2024-01-01' }
      ];
      const newNote = { title: 'New Note', content: 'New Content', tags: ['work'] };
      const serverNote = { id: '2', ...newNote, createdAt: '2024-01-02', updatedAt: '2024-01-02' };

      (global.fetch as any).mockImplementation((url: string, options?: any) => {
        if (url.includes('/notes') && !options) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockNotes)
          });
        }
        if (url.includes('/tags') && !options) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
          });
        }
        if (url.includes('/notes') && options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(serverNote)
          });
        }
      });

      const { result } = renderHook(() => useNotes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.createNote(newNote);

      await waitFor(() => {
        expect(result.current.notes).toHaveLength(2);
        expect(result.current.notes[0].id).toBe('2');
        expect(result.current.notes[0].title).toBe('New Note');
      });
    });

    it('should rollback optimistic update on error', async () => {
      const mockNotes = [
        { id: '1', title: 'Existing', content: 'Content', tags: [], createdAt: '2024-01-01', updatedAt: '2024-01-01' }
      ];

      (global.fetch as any).mockImplementation((url: string, options?: any) => {
        if (url.includes('/notes') && !options) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockNotes)
          });
        }
        if (url.includes('/tags') && !options) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
          });
        }
        if (url.includes('/notes') && options?.method === 'POST') {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ error: 'Server error' })
          });
        }
      });

      const { result } = renderHook(() => useNotes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newNote = { title: 'New Note', content: 'New Content', tags: [] };

      await expect(result.current.createNote(newNote)).rejects.toThrow();

      await waitFor(() => {
        expect(result.current.notes).toHaveLength(1);
        expect(result.current.notes[0].id).toBe('1');
      });
    });
  });

  describe('updateNote', () => {
    it('should optimistically update note', async () => {
      const mockNotes = [
        { id: '1', title: 'Original', content: 'Content', tags: [], createdAt: '2024-01-01', updatedAt: '2024-01-01' }
      ];
      const updatedNote = { id: '1', title: 'Updated', content: 'Content', tags: [], createdAt: '2024-01-01', updatedAt: '2024-01-02' };

      (global.fetch as any).mockImplementation((url: string, options?: any) => {
        if (url.includes('/notes') && !options) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockNotes)
          });
        }
        if (url.includes('/tags')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
          });
        }
        if (url.includes('/notes/1') && options?.method === 'PUT') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(updatedNote)
          });
        }
      });

      const { result } = renderHook(() => useNotes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.updateNote('1', { title: 'Updated' });

      await waitFor(() => {
        expect(result.current.notes[0].title).toBe('Updated');
      });
    });

    it('should rollback on update error', async () => {
      const mockNotes = [
        { id: '1', title: 'Original', content: 'Content', tags: [], createdAt: '2024-01-01', updatedAt: '2024-01-01' }
      ];

      (global.fetch as any).mockImplementation((url: string, options?: any) => {
        if (url.includes('/notes') && !options) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockNotes)
          });
        }
        if (url.includes('/tags')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
          });
        }
        if (url.includes('/notes/1') && options?.method === 'PUT') {
          return Promise.resolve({
            ok: false
          });
        }
      });

      const { result } = renderHook(() => useNotes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(result.current.updateNote('1', { title: 'Updated' })).rejects.toThrow();

      await waitFor(() => {
        expect(result.current.notes[0].title).toBe('Original');
      });
    });
  });

  describe('deleteNote', () => {
    it('should optimistically delete note', async () => {
      const mockNotes = [
        { id: '1', title: 'Note 1', content: 'Content', tags: [], createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: '2', title: 'Note 2', content: 'Content', tags: [], createdAt: '2024-01-01', updatedAt: '2024-01-01' }
      ];

      (global.fetch as any).mockImplementation((url: string, options?: any) => {
        if (url.includes('/notes') && !options) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockNotes)
          });
        }
        if (url.includes('/tags')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
          });
        }
        if (url.includes('/notes/1') && options?.method === 'DELETE') {
          return Promise.resolve({
            ok: true
          });
        }
      });

      const { result } = renderHook(() => useNotes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.deleteNote('1');

      await waitFor(() => {
        expect(result.current.notes).toHaveLength(1);
        expect(result.current.notes[0].id).toBe('2');
      });
    });

    it('should rollback on delete error', async () => {
      const mockNotes = [
        { id: '1', title: 'Note 1', content: 'Content', tags: [], createdAt: '2024-01-01', updatedAt: '2024-01-01' }
      ];

      (global.fetch as any).mockImplementation((url: string, options?: any) => {
        if (url.includes('/notes') && !options) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockNotes)
          });
        }
        if (url.includes('/tags')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
          });
        }
        if (url.includes('/notes/1') && options?.method === 'DELETE') {
          return Promise.resolve({
            ok: false
          });
        }
      });

      const { result } = renderHook(() => useNotes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(result.current.deleteNote('1')).rejects.toThrow();

      await waitFor(() => {
        expect(result.current.notes).toHaveLength(1);
        expect(result.current.notes[0].id).toBe('1');
      });
    });
  });

  describe('searchNotes', () => {
    it('should fetch notes with search params', async () => {
      const mockNotes = [
        { id: '1', title: 'Work Note', content: 'Content', tags: ['work'], createdAt: '2024-01-01', updatedAt: '2024-01-01' }
      ];

      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/notes') && url.includes('search=work')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockNotes)
          });
        }
        if (url.includes('/tags')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(['work'])
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      });

      const { result } = renderHook(() => useNotes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      result.current.searchNotes('work');

      await waitFor(() => {
        expect(result.current.notes).toHaveLength(1);
        expect(result.current.notes[0].title).toBe('Work Note');
      });
    });

    it('should fetch notes with tag filter', async () => {
      const mockNotes = [
        { id: '1', title: 'Work Note', content: 'Content', tags: ['work'], createdAt: '2024-01-01', updatedAt: '2024-01-01' }
      ];

      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/notes') && url.includes('tag=work')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockNotes)
          });
        }
        if (url.includes('/tags')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(['work'])
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      });

      const { result } = renderHook(() => useNotes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      result.current.searchNotes(undefined, 'work');

      await waitFor(() => {
        expect(result.current.notes).toHaveLength(1);
        expect(result.current.notes[0].tags).toContain('work');
      });
    });
  });
});
