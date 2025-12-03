import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NoteCard from './NoteCard';
import type { Note } from '../types';

const mockNote: Note = {
  id: '1',
  title: 'Test Note',
  content: 'This is test content',
  tags: ['work', 'urgent'],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('NoteCard', () => {
  it('should render note details', () => {
    render(
      <NoteCard
        note={mockNote}
        onView={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Test Note')).toBeInTheDocument();
    expect(screen.getByText('This is test content')).toBeInTheDocument();
    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
  });

  it('should truncate long content', () => {
    const longNote = { ...mockNote, content: 'a'.repeat(150) };

    render(
      <NoteCard
        note={longNote}
        onView={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const content = screen.getByText(/a+\.\.\./);
    expect(content.textContent?.length).toBe(103); // 100 chars + "..."
  });

  it('should call onView when card is clicked', async () => {
    const onView = vi.fn();
    const user = userEvent.setup();

    render(
      <NoteCard
        note={mockNote}
        onView={onView}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    await user.click(screen.getByText('Test Note'));

    expect(onView).toHaveBeenCalledWith(mockNote);
  });

  it('should call onEdit when Edit button is clicked', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();

    render(
      <NoteCard
        note={mockNote}
        onView={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />
    );

    await user.click(screen.getByText('Edit'));

    expect(onEdit).toHaveBeenCalledWith(mockNote);
  });

  it('should call onDelete when Delete button is clicked', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();

    render(
      <NoteCard
        note={mockNote}
        onView={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );

    await user.click(screen.getByText('Delete'));

    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('should not call onView when action buttons are clicked', async () => {
    const onView = vi.fn();
    const user = userEvent.setup();

    render(
      <NoteCard
        note={mockNote}
        onView={onView}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    await user.click(screen.getByText('Edit'));

    expect(onView).not.toHaveBeenCalled();
  });
});
