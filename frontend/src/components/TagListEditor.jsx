/**
 * Editable tag/chip list component for managing string arrays
 */
import React, { useState } from 'react';
import './TagListEditor.css';

function TagListEditor({ label, items = [], onChange, placeholder = 'Add item...' }) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !items.includes(trimmed)) {
      onChange([...items, trimmed]);
      setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  return (
    <div className="tag-list-editor">
      {label && <label className="tag-list-label">{label}</label>}
      <div className="tag-list-container">
        <div className="tag-list">
          {items.map((item, index) => (
            <span key={index} className="tag">
              {item}
              <button
                type="button"
                className="tag-remove"
                onClick={() => handleRemove(index)}
                aria-label={`Remove ${item}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="tag-input-row">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="tag-input"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="tag-add-btn"
            disabled={!inputValue.trim()}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default TagListEditor;
