import { describe, it, expect, beforeEach } from '@jest/globals';
import repository from '../InMemoryStorageRepository.js';

beforeEach(() => {
  // Reset the notes array before each test
  (repository as any).notes = [];
});

describe('InMemoryStorageRepository', () => {
  describe('createNote', () => {
    it('should create a note with all fields', () => {
      const input = { title: 'Test', content: 'Content', tags: ['work'] };
      const note = repository.createNote(input);

      expect(note.id).toBeDefined();
      expect(note.title).toBe('Test');
      expect(note.content).toBe('Content');
      expect(note.tags).toEqual(['work']);
      expect(note.createdAt).toBeInstanceOf(Date);
      expect(note.updatedAt).toBeInstanceOf(Date);
    });

    it('should remove duplicate tags', () => {
      const input = { title: 'Test', content: 'Content', tags: ['work', 'work', 'urgent'] };
      const note = repository.createNote(input);

      expect(note.tags).toEqual(['work', 'urgent']);
    });

    it('should filter out empty tags', () => {
      const input = { title: 'Test', content: 'Content', tags: ['work', '', 'urgent'] };
      const note = repository.createNote(input);

      expect(note.tags).toEqual(['work', 'urgent']);
    });
  });

  describe('getNoteById', () => {
    it('should return note by id', () => {
      const created = repository.createNote({ title: 'Test', content: 'Content', tags: [] });
      const found = repository.getNoteById(created.id);

      expect(found).toEqual(created);
    });

    it('should return undefined for non-existent id', () => {
      const found = repository.getNoteById('non-existent');

      expect(found).toBeUndefined();
    });
  });

  describe('updateNote', () => {
    it('should update note fields', () => {
      const created = repository.createNote({ title: 'Old', content: 'Old content', tags: ['old'] });
      const updated = repository.updateNote(created.id, { title: 'New', content: 'New content', tags: ['new'] });

      expect(updated?.title).toBe('New');
      expect(updated?.content).toBe('New content');
      expect(updated?.tags).toEqual(['new']);
    });

    it('should return null for non-existent note', () => {
      const result = repository.updateNote('non-existent', { title: 'Test' });

      expect(result).toBeNull();
    });

    it('should keep existing fields if not provided', () => {
      const created = repository.createNote({ title: 'Title', content: 'Content', tags: ['tag'] });
      const updated = repository.updateNote(created.id, { title: 'New Title' });

      expect(updated?.title).toBe('New Title');
      expect(updated?.content).toBe('Content');
      expect(updated?.tags).toEqual(['tag']);
    });
  });

  describe('deleteNote', () => {
    it('should delete existing note', () => {
      const created = repository.createNote({ title: 'Test', content: 'Content', tags: [] });
      const deleted = repository.deleteNote(created.id);

      expect(deleted).toBe(true);
      expect(repository.getNoteById(created.id)).toBeUndefined();
    });

    it('should return false for non-existent note', () => {
      const deleted = repository.deleteNote('non-existent');

      expect(deleted).toBe(false);
    });
  });

  describe('searchNotes', () => {
    beforeEach(() => {
      repository.createNote({ title: 'Work Meeting', content: 'Discuss project', tags: ['work'] });
      repository.createNote({ title: 'Personal Note', content: 'Buy groceries', tags: ['personal'] });
      repository.createNote({ title: 'Urgent Work', content: 'Fix bug', tags: ['work', 'urgent'] });
    });

    it('should return all notes when no filters', () => {
      const results = repository.searchNotes();

      expect(results).toHaveLength(3);
    });

    it('should filter by search text in title', () => {
      const results = repository.searchNotes('Work');

      expect(results).toHaveLength(2);
      expect(results.every((n: any) => n.title.toLowerCase().includes('work'))).toBe(true);
    });

    it('should filter by search text in content', () => {
      const results = repository.searchNotes('groceries');

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Personal Note');
    });

    it('should filter by single tag', () => {
      const results = repository.searchNotes(undefined, 'work');

      expect(results).toHaveLength(2);
      expect(results.every((n: any) => n.tags.includes('work'))).toBe(true);
    });

    it('should filter by search text and tag', () => {
      const results = repository.searchNotes('Work', 'urgent');

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Urgent Work');
    });

    it('should be case insensitive', () => {
      const results = repository.searchNotes('WORK');

      expect(results).toHaveLength(2);
    });
  });

  describe('getAllTags', () => {
    it('should return empty array when no notes', () => {
      const tags = repository.getAllTags();

      expect(tags).toEqual([]);
    });

    it('should return unique tags sorted', () => {
      repository.createNote({ title: 'Note 1', content: 'Content', tags: ['work', 'urgent'] });
      repository.createNote({ title: 'Note 2', content: 'Content', tags: ['personal', 'urgent'] });

      const tags = repository.getAllTags();

      expect(tags).toEqual(['personal', 'urgent', 'work']);
    });
  });
});
