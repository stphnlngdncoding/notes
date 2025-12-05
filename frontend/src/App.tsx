import { useState, useCallback } from 'react';
import { Note, ModalState } from './types';
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
  const [modalState, setModalState] = useState<ModalState>({ type: 'closed' });
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
      } else {
        await createNote({ title, content, tags });
        // Reset filters when creating a new note so user sees it
        setSearchText('');
        setSelectedTag('');
        searchNotes('', '');
      }
      setModalState({ type: 'closed' });
    } catch (error) {
      setFormError(id ? 'Failed to update note. Please try again.' : 'Failed to create note. Please try again.');
    }
  };

  const handleViewClick = (note: Note) => {
    setFormError(null);
    setModalState({ type: 'viewing', note });
  };

  const handleEditClick = (note: Note) => {
    setFormError(null);
    setModalState({ type: 'editing', note });
  };

  const handleEditFromView = () => {
    if (modalState.type === 'viewing') {
      setFormError(null);
      setModalState({ type: 'editing', note: modalState.note });
    }
  };

  const handleCloseForm = () => {
    setModalState({ type: 'closed' });
    setFormError(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Notes App</h1>
        <button className="btn-primary" onClick={() => {
          setFormError(null);
          setModalState({ type: 'creating' });
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

        {modalState.type !== 'closed' && (
          <NoteForm
            note={modalState.type === 'creating' ? null : modalState.note}
            viewMode={modalState.type === 'viewing'}
            onSave={handleSaveNote}
            onClose={handleCloseForm}
            onEdit={modalState.type === 'viewing' ? handleEditFromView : undefined}
            apiError={formError}
          />
        )}
      </div>
    </div>
  );
}

export default App;
