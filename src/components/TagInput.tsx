import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { POPULAR_SKILLS } from '../data/skills';

interface TagInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    suggestions?: string[];
}

export const TagInput: React.FC<TagInputProps> = ({
    value = [],
    onChange,
    placeholder = "Type and press Enter...",
    suggestions = POPULAR_SKILLS
}) => {
    const [input, setInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (input.trim()) {
            const lowerInput = input.toLowerCase();
            const filtered = suggestions.filter(s =>
                s.toLowerCase().includes(lowerInput) &&
                !value.includes(s) // Don't suggest already added
            ).slice(0, 5); // Limit to 5 suggestions
            setFilteredSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setShowSuggestions(false);
        }
    }, [input, suggestions, value]);

    // Handle clicking outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const addTag = (tag: string) => {
        const trimmed = tag.trim();
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed]);
        }
        setInput('');
        setShowSuggestions(false);
    };

    const removeTag = (tagToRemove: string) => {
        onChange(value.filter(tag => tag !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // If suggestions are open and one matches exactly? Or just take input?
            // Let's take the first suggestion if it matches what was typed (case insensitive) or just the input
            if (showSuggestions && filteredSuggestions.length > 0) {
                // If the user hit enter and there's a perfect match or they selected one (logic for selection missing, simple enter takes input)
                // Let's just take the input value unless they arrow keyed (not implementing arrow keys yet for simplicity)
                addTag(input);
            } else {
                addTag(input);
            }
        } else if (e.key === 'Backspace' && !input && value.length > 0) {
            // Remove last tag if input is empty
            removeTag(value[value.length - 1]);
        }
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative' }}>
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                padding: '8px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg)',
                minHeight: '42px'
            }}>
                {value.map(tag => (
                    <span key={tag} className="tag" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--color-accent-subtle)', color: 'var(--color-accent)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', border: 'none', background: 'transparent', color: 'currentColor' }}
                        >
                            <X size={12} />
                        </button>
                    </span>
                ))}

                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={value.length === 0 ? placeholder : ''}
                    style={{
                        border: 'none',
                        outline: 'none',
                        flex: 1,
                        minWidth: '120px',
                        background: 'transparent',
                        fontSize: '0.9rem'
                    }}
                    onFocus={() => input && setShowSuggestions(true)}
                />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    marginTop: '4px',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    maxHeight: '200px',
                    overflowY: 'auto'
                }}>
                    {filteredSuggestions.map(suggestion => (
                        <div
                            key={suggestion}
                            onClick={() => addTag(suggestion)}
                            style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                borderBottom: '1px solid var(--color-border-subtle)',
                            }}
                            className="hover-bg-accent-subtle"
                        >
                            {suggestion}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
