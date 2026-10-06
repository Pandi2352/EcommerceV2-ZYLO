import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import Button from './Button';
import { cn } from '../utils/cn';

export interface TagInputProps {
  label?: string;
  helperText?: string;
  placeholder?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  className?: string;
  disabled?: boolean;
}

/**
 * Reusable chip / tag input for keywords, search facets, and badges.
 * Supports Enter key submission, duplicate trimming, and clear buttons.
 */
export const TagInput: React.FC<TagInputProps> = ({
  label,
  helperText,
  placeholder = 'Type and press Enter...',
  tags,
  onChange,
  maxTags,
  className = '',
  disabled = false,
}) => {
  const [inputVal, setInputVal] = useState('');

  const handleAddTag = (raw: string) => {
    const trimmed = raw.trim().toLowerCase();
    if (!trimmed) return;
    if (tags.includes(trimmed)) {
      setInputVal('');
      return;
    }
    if (maxTags && tags.length >= maxTags) return;

    onChange([...tags, trimmed]);
    setInputVal('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(inputVal);
    } else if (e.key === 'Backspace' && !inputVal && tags.length > 0) {
      handleRemoveTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            {label}
          </label>
          {maxTags && (
            <span className="text-[11px] text-slate-400">
              {tags.length}/{maxTags}
            </span>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={inputVal}
          disabled={disabled || (maxTags !== undefined && tags.length >= maxTags)}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={maxTags && tags.length >= maxTags ? 'Maximum tags reached' : placeholder}
          className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-md outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors disabled:bg-slate-50 disabled:cursor-not-allowed text-slate-800"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || !inputVal.trim() || (maxTags !== undefined && tags.length >= maxTags)}
          onClick={() => handleAddTag(inputVal)}
          className="rounded-md shadow-none px-3"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add
        </Button>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50/80 border border-slate-200 rounded-md min-h-[38px] items-center">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-700 shadow-none"
            >
              <span>{tag}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-slate-400 hover:text-rose-500 transition-colors"
                  aria-label={`Remove tag ${tag}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {helperText && <p className="text-[11px] text-slate-400">{helperText}</p>}
    </div>
  );
};

export default TagInput;
