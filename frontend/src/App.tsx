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

  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
    searchNotes(text, selectedTag);
  }, [searchNotes, selectedTag]);

  const handleTagFilter = useCallback((tag: string) => {
    setSelectedTag(tag);
    searchNotes(searchText, tag);
  }, [searchNotes, searchText]);

  const handleCreateNote = async (title: string, content: string, tags: string[]) => {
    await createNote({ title, content, tags });
    setIsFormOpen(false);
  };

  const handleUpdateNote = async (id: string, title: string, content: string, tags: string[]) => {
    await updateNote(id, { title, content, tags });
    setEditingNote(null);
    setIsFormOpen(false);
  };

  const handleViewClick = (note: Note) => {
    setViewingNote(note);
    setIsFormOpen(true);
  };

  const handleEditClick = (note: Note) => {
    setViewingNote(null);
    setEditingNote(note);
    setIsFormOpen(true);
  };

  const handleEditFromView = () => {
    if (viewingNote) {
      setEditingNote(viewingNote);
      setViewingNote(null);
      setIsFormOpen(true); // Ensure form stays open
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingNote(null);
    setViewingNote(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Notes App</h1>
        <button className="btn-primary" onClick={() => setIsFormOpen(true)}>
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
            onSave={editingNote ? handleUpdateNote : handleCreateNote}
            onClose={handleCloseForm}
            onEdit={viewingNote ? handleEditFromView : undefined}
          />
        )}
      </div>
    </div>
  );
}

export default App;
