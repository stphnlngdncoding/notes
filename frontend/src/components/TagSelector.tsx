import './TagSelector.css';

interface TagSelectorProps {
  allTags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

function TagSelector({ allTags, selectedTags, onChange }: TagSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onChange(value ? [value] : []);
  };

  if (allTags.length === 0) {
    return null;
  }

  return (
    <div className="tag-selector">
      <label htmlFor="tag-filter" className="tag-selector-label">
        Filter by tag:
      </label>
      <select
        id="tag-filter"
        value={selectedTags[0] || ''}
        onChange={handleChange}
        className="tag-dropdown"
      >
        <option value="">All tags</option>
        {allTags.map(tag => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </select>
    </div>
  );
}

export default TagSelector;
