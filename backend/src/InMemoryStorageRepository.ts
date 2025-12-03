import { randomUUID } from 'crypto';
import type { Note, CreateNoteInput, UpdateNoteInput } from './types.js';

class InMemoryStorageRepository {
  private notes: Note[] = [];

  getAllNotes(): Note[] {
    return this.notes;
  }

  getNoteById(id: string): Note | undefined {
    return this.notes.find(note => note.id === id);
  }

  createNote(input: CreateNoteInput): Note {
    const now = new Date();
    const uniqueTags = [...new Set(input.tags.filter(tag => tag.length > 0))];

    const note: Note = {
      id: randomUUID(),
      title: input.title,
      content: input.content,
      tags: uniqueTags,
      createdAt: now,
      updatedAt: now
    };

    this.notes.push(note);
    return note;
  }

  updateNote(id: string, input: UpdateNoteInput): Note | null {
    const index = this.notes.findIndex(note => note.id === id);

    if (index === -1) {
      return null;
    }

    const existingNote = this.notes[index];
    const uniqueTags = input.tags
      ? [...new Set(input.tags.filter(tag => tag.length > 0))]
      : existingNote.tags;

    const updatedNote: Note = {
      ...existingNote,
      title: input.title ?? existingNote.title,
      content: input.content ?? existingNote.content,
      tags: uniqueTags,
      updatedAt: new Date()
    };

    this.notes[index] = updatedNote;
    return updatedNote;
  }

  deleteNote(id: string): boolean {
    const initialLength = this.notes.length;
    this.notes = this.notes.filter(note => note.id !== id);
    return this.notes.length < initialLength;
  }

  searchNotes(searchText?: string, filterTags?: string[]): Note[] {
    let results = this.notes;

    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      results = results.filter(note =>
        note.title.toLowerCase().includes(lowerSearch) ||
        note.content.toLowerCase().includes(lowerSearch)
      );
    }

    if (filterTags && filterTags.length > 0) {
      results = results.filter(note =>
        filterTags.every(tag => note.tags.includes(tag))
      );
    }

    return results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  getAllTags(): string[] {
    const tagSet = new Set<string>();
    this.notes.forEach(note => {
      note.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }
}

export default new InMemoryStorageRepository();
