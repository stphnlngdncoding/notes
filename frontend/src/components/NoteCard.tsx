import { Note } from '../types';
import './NoteCard.css';

interface NoteCardProps {
  note: Note;
  onView: (note: Note) => void;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

function NoteCard({ note, onView, onEdit, onDelete }: NoteCardProps) {
  const truncateContent = (content: string, maxLength: number) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.note-actions')) {
      return;
    }
    onView(note);
  };

  return (
    <div className="note-card" onClick={handleCardClick}>
      <div className="note-card-header">
        <h3 className="note-title">{note.title}</h3>
        <div className="note-actions">
          <button className="btn-edit" onClick={(e) => { e.stopPropagation(); onEdit(note); }}>
            Edit
          </button>
          <button className="btn-delete" onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}>
            Delete
          </button>
        </div>
      </div>

      <p className="note-content">{truncateContent(note.content, 100)}</p>

      {note.tags.length > 0 && (
        <div className="note-tags">
          {note.tags.map(tag => (
            <span key={tag} className="note-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="note-date">
        Updated: {new Date(note.updatedAt).toLocaleDateString()}
      </div>
    </div>
  );
}

export default NoteCard;
