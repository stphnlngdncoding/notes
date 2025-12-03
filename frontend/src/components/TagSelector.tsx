import './TagSelector.css';

interface TagSelectorProps {
  allTags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

function TagSelector({ allTags, selectedTags, onChange }: TagSelectorProps) {
  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter(t => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  if (allTags.length === 0) {
    return null;
  }

  return (
    <div className="tag-selector">
      <div className="tag-selector-label">Filter by tags:</div>
      <div className="tag-list">
        {allTags.map(tag => (
          <button
            key={tag}
            className={`tag-chip ${selectedTags.includes(tag) ? 'selected' : ''}`}
            onClick={() => handleTagClick(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TagSelector;
