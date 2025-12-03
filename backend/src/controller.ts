import type { Note, CreateNoteInput, UpdateNoteInput } from './types.js';
import storage from './InMemoryStorageRepository.js';
import { NotFoundError } from './errors.js';

export class NotesController {
  getNotes(searchText?: string, filterTags?: string[]): Note[] {
    return storage.searchNotes(searchText, filterTags);
  }

  createNote(input: CreateNoteInput): Note {
    return storage.createNote(input);
  }

  updateNote(id: string, input: UpdateNoteInput): Note {
    const note = storage.updateNote(id, input);

    if (!note) {
      throw new NotFoundError('Note not found');
    }

    return note;
  }

  deleteNote(id: string): void {
    const deleted = storage.deleteNote(id);

    if (!deleted) {
      throw new NotFoundError('Note not found');
    }
  }

  getAllTags(): string[] {
    return storage.getAllTags();
  }
}

export default new NotesController();
