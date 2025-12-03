# Notes App

A full-stack notes application with tagging, search, and filtering capabilities. Built with React, TypeScript, Node.js, and Express.

## Features

- **CRUD Operations** - Create, read, update, and delete notes
- **View Mode** - Click on any note to view in read-only mode
- **Tagging System** - Add multiple tags to notes with chip-based input
- **Search** - Debounced text search across note titles and content
- **Filter** - Single-select dropdown to filter notes by tag
- **Optimistic Updates** - Instant UI feedback with automatic rollback on errors
- **Input Validation** - Zod-based validation on the backend

## Tech Stack

**Backend:**
- Node.js + Express
- TypeScript
- Zod (validation)
- In-memory storage

**Frontend:**
- React 18
- TypeScript
- Vite
- CSS Modules

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation & Running

**1. Backend Setup**

```bash
cd backend
npm install
npm run dev
```

Server runs on `http://localhost:3001`

**2. Frontend Setup**

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | Get all notes (supports `?search=text&tags=tag` query params) |
| POST | `/api/notes` | Create a new note |
| PUT | `/api/notes/:id` | Update a note |
| DELETE | `/api/notes/:id` | Delete a note |
| GET | `/api/tags` | Get all unique tags |

### Example Request

**Create Note:**
```bash
curl -X POST http://localhost:3001/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Meeting Notes",
    "content": "Discussed project timeline",
    "tags": ["work", "important"]
  }'
```

## Project Structure

```
/notes
├── backend/
│   └── src/
│       ├── server.ts              # Express app setup
│       ├── routes.ts              # HTTP routes & validation
│       ├── controller.ts          # Business logic
│       ├── InMemoryStorageRepository.ts  # Data layer
│       ├── types.ts               # TypeScript types & Zod schemas
│       └── errors.ts              # Custom error classes
│
└── frontend/
    └── src/
        ├── App.tsx                # Main application
        ├── components/
        │   ├── NoteList.tsx       # Grid of note cards
        │   ├── NoteCard.tsx       # Individual note display
        │   ├── NoteForm.tsx       # Create/edit/view modal
        │   ├── SearchBar.tsx      # Debounced search input
        │   └── TagSelector.tsx    # Tag filter dropdown
        ├── hooks/
        │   └── useNotes.ts        # API calls & optimistic updates
        └── types.ts               # TypeScript types
```

## Key Features Explained

### Optimistic Updates

The app updates the UI immediately when you create, edit, or delete notes. If the API call fails, changes are automatically rolled back.

### Debounced Search

Search input waits 300ms after you stop typing before making an API call, reducing unnecessary requests.

### View Mode

- **Click on a note card** → Opens in read-only view mode
- **Click "Edit" button** → Opens in edit mode
- **In view mode** → Click "Edit" to switch to editing

### Tag Management

- Add tags by typing and pressing Enter or clicking "Add"
- Duplicate tags are prevented
- Tags are trimmed and validated
- Empty tags are filtered out

## Edge Cases Handled

- Empty title/content validation
- Whitespace trimming on inputs
- Duplicate tag prevention
- Case-insensitive search
- Content truncation (100 characters in card view)
- Failed API calls with rollback
- Empty states (no notes, no search results)
- Loading states

## Known Limitations

- **No persistence** - Data is lost on server restart (in-memory storage)
- **No pagination** - All notes load at once; won't scale beyond ~200 notes
- **Single user** - No authentication or multi-user support
- **No real-time sync** - Multiple tabs don't update automatically
- **Case-sensitive tags** - "Work" and "work" are different tags
- **No rate limiting** - API can be spammed
- **Limited error feedback** - Optimistic updates fail silently if server is down
- **No offline support** - Requires active connection

## Productionization Guide

Key changes needed for production:

### Database Migration (PostgreSQL)

Replace in-memory storage with PostgreSQL using normalized schema:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE notes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tags (
  id UUID PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE note_tags (
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

-- Indexes for performance
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_updated_at ON notes(updated_at);
CREATE INDEX idx_note_tags_tag_id ON note_tags(tag_id);
```

### Pagination

Add pagination to `/api/notes`:

```typescript
GET /api/notes?page=1&limit=20&search=text&tags=work

Response:
{
  "notes": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Frontend:** Implement infinite scroll or pagination controls in `useNotes` hook.

### Additional Production Needs

- **Authentication:** JWT-based auth with user-scoped queries
- **Caching:** Redis for tags list
- **Search:** PostgreSQL full-text search or Elasticsearch
- **Security:** Rate limiting and input sanitization
- **Monitoring:** Structured logging, error tracking
- **Infrastructure:** Docker, CI/CD, environment variables
- **Testing:** Unit, integration, and E2E tests
