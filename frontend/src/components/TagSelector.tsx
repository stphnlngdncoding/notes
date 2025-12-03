import './TagSelector.css';

interface TagSelectorProps {
  allTags: string[];
  selectedTag: string;
  onChange: (tag: string) => void;
}

function TagSelector({ allTags, selectedTag, onChange }: TagSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
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
        value={selectedTag}
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
