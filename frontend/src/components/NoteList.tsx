import { Note } from '../types';
import NoteCard from './NoteCard';
import './NoteList.css';

interface NoteListProps {
  notes: Note[];
  onView: (note: Note) => void;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

function NoteList({ notes, onView, onEdit, onDelete }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="empty-state">
        <p>No notes found. Create a note!</p>
      </div>
    );
  }

  return (
    <div className="note-list">
      {notes.map(note => (
        <NoteCard
          key={note.id}
          note={note}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default NoteList;
