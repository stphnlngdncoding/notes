import { useState } from 'react';
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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const handleSearch = (text: string) => {
    setSearchText(text);
    searchNotes(text, selectedTags);
  };

  const handleTagFilter = (tags: string[]) => {
    setSelectedTags(tags);
    searchNotes(searchText, tags);
  };

  const handleCreateNote = async (title: string, content: string, tags: string[]) => {
    await createNote({ title, content, tags });
    setIsFormOpen(false);
  };

  const handleUpdateNote = async (id: string, title: string, content: string, tags: string[]) => {
    await updateNote(id, { title, content, tags });
    setEditingNote(null);
    setIsFormOpen(false);
  };

  const handleEditClick = (note: Note) => {
    setEditingNote(note);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingNote(null);
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
            selectedTags={selectedTags}
            onChange={handleTagFilter}
          />
        </div>

        {loading && <div className="loading">Loading...</div>}

        <NoteList
          notes={notes}
          onEdit={handleEditClick}
          onDelete={deleteNote}
        />

        {isFormOpen && (
          <NoteForm
            note={editingNote}
            onSave={editingNote ? handleUpdateNote : handleCreateNote}
            onClose={handleCloseForm}
          />
        )}
      </div>
    </div>
  );
}

export default App;
