import { useState, useEffect } from 'react';
import { Note } from '../types';
import './NoteForm.css';

interface NoteFormProps {
  note: Note | null;
  viewMode?: boolean;
  onSave: (id: string, title: string, content: string, tags: string[]) => void | ((title: string, content: string, tags: string[]) => void);
  onClose: () => void;
  onEdit?: () => void;
}

function NoteForm({ note, viewMode = false, onSave, onClose, onEdit }: NoteFormProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags);
    }
  }, [note]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();

    if (!trimmedTag) {
      return;
    }

    if (tags.includes(trimmedTag)) {
      setError('Tag already exists');
      return;
    }

    setTags([...tags, trimmedTag]);
    setTagInput('');
    setError('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    if (note) {
      (onSave as (id: string, title: string, content: string, tags: string[]) => void)(
        note.id,
        title.trim(),
        content.trim(),
        tags
      );
    } else {
      (onSave as (title: string, content: string, tags: string[]) => void)(
        title.trim(),
        content.trim(),
        tags
      );
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{viewMode ? 'View Note' : note ? 'Edit Note' : 'Create Note'}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title"
              className="form-input"
              disabled={viewMode}
              readOnly={viewMode}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter note content"
              className="form-textarea"
              rows={6}
              disabled={viewMode}
              readOnly={viewMode}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            {!viewMode && (
              <div className="tag-input-container">
                <input
                  id="tags"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add a tag and press Enter"
                  className="form-input"
                />
                <button type="button" onClick={handleAddTag} className="btn-add-tag">
                  Add
                </button>
              </div>
            )}

            {tags.length > 0 && (
              <div className="tag-chips">
                {tags.map(tag => (
                  <span key={tag} className="tag-chip-form">
                    {tag}
                    {!viewMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="tag-remove"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              {viewMode ? 'Close' : 'Cancel'}
            </button>
            {viewMode && onEdit ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit();
                }}
                className="btn-primary"
              >
                Edit
              </button>
            ) : !viewMode && (
              <button type="submit" className="btn-primary">
                {note ? 'Update' : 'Create'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default NoteForm;
