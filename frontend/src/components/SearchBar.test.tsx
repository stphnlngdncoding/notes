import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from './SearchBar';

describe('SearchBar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render search input', () => {
    render(<SearchBar value="" onChange={vi.fn()} />);

    expect(screen.getByPlaceholderText('Search notes...')).toBeInTheDocument();
  });

  it('should debounce onChange calls', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup({ delay: null });

    render(<SearchBar value="" onChange={onChange} />);

    const input = screen.getByPlaceholderText('Search notes...');
    await user.type(input, 'test');

    expect(onChange).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('test');
  });

  it('should reset debounce timer on each keystroke', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup({ delay: null });

    render(<SearchBar value="" onChange={onChange} />);

    const input = screen.getByPlaceholderText('Search notes...');

    await user.type(input, 't');
    vi.advanceTimersByTime(200);

    await user.type(input, 'e');
    vi.advanceTimersByTime(200);

    await user.type(input, 's');
    vi.advanceTimersByTime(200);

    expect(onChange).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('should display initial value', () => {
    render(<SearchBar value="initial" onChange={vi.fn()} />);

    expect(screen.getByDisplayValue('initial')).toBeInTheDocument();
  });
});
