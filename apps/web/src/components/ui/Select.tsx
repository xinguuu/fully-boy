'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Select component - Custom dropdown with DropdownMenu styling
 *
 * Based on design-guide.md line 681-740
 *
 * @example
 * ```tsx
 * <Select
 *   value={sortBy}
 *   onChange={setSortBy}
 *   options={[
 *     { value: 'popular', label: '인기순' },
 *     { value: 'newest', label: '최신순' },
 *   ]}
 * />
 * ```
 */
export function Select({
  options,
  value,
  onChange,
  placeholder = '선택하세요',
  error,
  fullWidth,
  disabled,
  className = '',
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={`relative ${fullWidth ? 'w-full' : 'inline-block'} ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          h-11 px-4 pr-10
          border rounded-lg
          bg-white
          text-sm font-medium
          transition-all duration-200 ease-out
          hover:bg-gray-50
          focus:outline-none focus:ring-2 focus:ring-primary-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          cursor-pointer
          ${error ? 'border-error focus:ring-error text-error' : 'border-gray-300 text-gray-700'}
          ${fullWidth ? 'w-full' : ''}
          ${selectedOption ? '' : 'text-gray-400'}
        `.trim().replace(/\s+/g, ' ')}
      >
        <span className="text-left block truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
      </button>

      {/* Chevron Icon */}
      <ChevronDown
        className={`
          absolute right-3 top-1/2 -translate-y-1/2
          w-4 h-4 text-gray-600
          pointer-events-none
          transition-transform duration-200
          ${isOpen ? 'rotate-180' : ''}
          ${disabled ? 'opacity-50' : ''}
        `.trim().replace(/\s+/g, ' ')}
      />

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div
          className={`
            absolute top-full mt-2
            w-full min-w-[180px]
            bg-white dark:bg-dark-2
            border border-gray-200 dark:border-dark-3
            rounded-lg
            shadow-xl
            py-2
            z-50
            animate-slide-down
            max-h-60
            overflow-y-auto
          `.trim().replace(/\s+/g, ' ')}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full px-4 py-2
                  text-left text-sm
                  flex items-center justify-between gap-2
                  transition-colors
                  cursor-pointer
                  ${
                    isSelected
                      ? 'bg-primary-50 text-primary-600 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-3'
                  }
                `.trim().replace(/\s+/g, ' ')}
              >
                <span>{option.label}</span>
                {isSelected && <Check className="w-4 h-4 text-primary-600 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
