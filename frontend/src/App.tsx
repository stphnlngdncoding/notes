import { useState, useCallback } from 'react';
import { Note } from './types';
import NoteList from './components/NoteList';
import NoteForm from './components/NoteForm';
import SearchBar from './components/SearchBar';
import TagSelector from './components/TagSelector';
import { useNotes } from './hooks/useNotes';
import './App.css';

function App() {
  const {
    notes,
    allTags,
    loading,
    createNote,
    updateNote,
    deleteNote,
    searchNotes
  } = useNotes();

  const [searchText, setSearchText] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
    searchNotes(text, selectedTag);
  }, [searchNotes, selectedTag]);

  const handleTagFilter = useCallback((tag: string) => {
    setSelectedTag(tag);
    searchNotes(searchText, tag);
  }, [searchNotes, searchText]);

  const handleSaveNote = async (title: string, content: string, tags: string[], id?: string) => {
    try {
      setFormError(null);
      if (id) {
        await updateNote(id, { title, content, tags });
        setEditingNote(null);
      } else {
        await createNote({ title, content, tags });
        // Reset filters when creating a new note so user sees it
        setSearchText('');
        setSelectedTag('');
        searchNotes('', '');
      }
      setIsFormOpen(false);
    } catch (error) {
      setFormError(id ? 'Failed to update note. Please try again.' : 'Failed to create note. Please try again.');
    }
  };

  const handleViewClick = (note: Note) => {
    setViewingNote(note);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (note: Note) => {
    setViewingNote(null);
    setEditingNote(note);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleEditFromView = () => {
    if (viewingNote) {
      setEditingNote(viewingNote);
      setViewingNote(null);
      setFormError(null);
      setIsFormOpen(true); // Ensure form stays open
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingNote(null);
    setViewingNote(null);
    setFormError(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Notes App</h1>
        <button className="btn-primary" onClick={() => {
          setFormError(null);
          setIsFormOpen(true);
        }}>
          + New Note
        </button>
      </header>

      <div className="app-container">
        <div className="filters">
          <SearchBar value={searchText} onChange={handleSearch} />
          <TagSelector
            allTags={allTags}
            selectedTag={selectedTag}
            onChange={handleTagFilter}
          />
        </div>

        {loading && <div className="loading">Loading...</div>}

        <NoteList
          notes={notes}
          onView={handleViewClick}
          onEdit={handleEditClick}
          onDelete={deleteNote}
        />

        {isFormOpen && (
          <NoteForm
            note={viewingNote || editingNote}
            viewMode={!!viewingNote}
            onSave={handleSaveNote}
            onClose={handleCloseForm}
            onEdit={viewingNote ? handleEditFromView : undefined}
            apiError={formError}
          />
        )}
      </div>
    </div>
  );
}

export default App;
