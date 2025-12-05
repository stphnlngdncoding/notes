import { useState, useEffect, useCallback } from 'react';
import { Note, CreateNoteInput, UpdateNoteInput } from '../types';

const API_BASE = '/api';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to update tags locally from current notes
  const updateTagsFromNotes = useCallback((currentNotes: Note[]) => {
    const tagSet = new Set<string>();
    currentNotes.forEach(note => {
      note.tags.forEach(tag => tagSet.add(tag));
    });
    setAllTags(Array.from(tagSet).sort());
  }, []);

  const fetchNotes = useCallback(async (searchText?: string, filterTag?: string) => {
    try {
      const params = new URLSearchParams();
      if (searchText) params.append('search', searchText);
      if (filterTag) params.append('tag', filterTag);

      const response = await fetch(`${API_BASE}/notes?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch notes');

      const data = await response.json();
      setNotes(data);
      updateTagsFromNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  }, [updateTagsFromNotes]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await fetch(`${API_BASE}/notes`);

        if (response.ok) {
          const notesData = await response.json();
          setNotes(notesData);
          updateTagsFromNotes(notesData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [updateTagsFromNotes]);

  const searchNotes = useCallback((searchText?: string, filterTag?: string) => {
    fetchNotes(searchText, filterTag);
  }, [fetchNotes]);

  const createNote = async (input: CreateNoteInput) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticNote: Note = {
      id: tempId,
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setNotes(prev => [optimisticNote, ...prev]);

    try {
      const response = await fetch(`${API_BASE}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });

      if (!response.ok) throw new Error('Failed to create note');

      const createdNote = await response.json();

      setNotes(prev => {
        const updated = prev.map(note =>
          note.id === tempId ? createdNote : note
        );
        updateTagsFromNotes(updated);
        return updated;
      });
    } catch (error) {
      console.error('Error creating note:', error);
      setNotes(prev => prev.filter(note => note.id !== tempId));
      throw error;
    }
  };

  const updateNote = async (id: string, input: UpdateNoteInput) => {
    const previousNotes = [...notes];
    const noteIndex = notes.findIndex(n => n.id === id);

    if (noteIndex === -1) return;

    const updatedNote: Note = {
      ...notes[noteIndex],
      ...input,
      updatedAt: new Date().toISOString()
    };

    setNotes(prev => prev.map(note =>
      note.id === id ? updatedNote : note
    ));

    try {
      const response = await fetch(`${API_BASE}/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });

      if (!response.ok) throw new Error('Failed to update note');

      const serverNote = await response.json();

      setNotes(prev => {
        const updated = prev.map(note =>
          note.id === id ? serverNote : note
        );
        updateTagsFromNotes(updated);
        return updated;
      });
    } catch (error) {
      console.error('Error updating note:', error);
      setNotes(previousNotes);
      throw error;
    }
  };

  const deleteNote = async (id: string) => {
    const previousNotes = [...notes];

    setNotes(prev => {
      const updated = prev.filter(note => note.id !== id);
      updateTagsFromNotes(updated);
      return updated;
    });

    try {
      const response = await fetch(`${API_BASE}/notes/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete note');
    } catch (error) {
      console.error('Error deleting note:', error);
      setNotes(previousNotes);
      updateTagsFromNotes(previousNotes);
      throw error;
    }
  };

  return {
    notes,
    allTags,
    loading,
    createNote,
    updateNote,
    deleteNote,
    searchNotes
  };
}
