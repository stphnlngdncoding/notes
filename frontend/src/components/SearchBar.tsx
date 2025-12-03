import { useState, useEffect, useRef } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

function SearchBar({ value, onChange }: SearchBarProps) {
  const [inputValue, setInputValue] = useState(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChangeRef.current(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search notes..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="search-input"
      />
    </div>
  );
}

export default SearchBar;
