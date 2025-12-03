import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TagSelector from './TagSelector';

describe('TagSelector', () => {
  it('should render tag dropdown with all tags', () => {
    render(
      <TagSelector
        allTags={['work', 'personal', 'urgent']}
        selectedTag=""
        onChange={vi.fn()}
      />
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('All tags')).toBeInTheDocument();
    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('personal')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
  });

  it('should call onChange when tag is selected', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <TagSelector
        allTags={['work', 'personal']}
        selectedTag=""
        onChange={onChange}
      />
    );

    await user.selectOptions(screen.getByRole('combobox'), 'work');

    expect(onChange).toHaveBeenCalledWith('work');
  });

  it('should call onChange with empty string when All tags selected', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <TagSelector
        allTags={['work', 'personal']}
        selectedTag="work"
        onChange={onChange}
      />
    );

    await user.selectOptions(screen.getByRole('combobox'), '');

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('should show selected tag', () => {
    render(
      <TagSelector
        allTags={['work', 'personal']}
        selectedTag="work"
        onChange={vi.fn()}
      />
    );

    expect(screen.getByRole('combobox')).toHaveValue('work');
  });

  it('should not render when no tags available', () => {
    const { container } = render(
      <TagSelector
        allTags={[]}
        selectedTag=""
        onChange={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
