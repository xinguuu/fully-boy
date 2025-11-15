'use client';

import { ChevronDown } from 'lucide-react';
import { forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  fullWidth?: boolean;
}

/**
 * Select component - Native dropdown wrapper with consistent styling
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
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, value, onChange, placeholder, error, fullWidth, className = '', disabled, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div className={`relative inline-block ${fullWidth ? 'w-full' : ''}`}>
        <select
          ref={ref}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={`
            appearance-none
            h-11 pl-4 pr-10
            border rounded-lg
            bg-white
            text-sm font-medium text-gray-700
            transition-all duration-200 ease-out
            hover:bg-gray-50
            focus:outline-none focus:ring-2 focus:ring-primary-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            cursor-pointer
            ${error ? 'border-error focus:ring-error' : 'border-gray-300'}
            ${fullWidth ? 'w-full' : ''}
            ${className}
          `.trim().replace(/\s+/g, ' ')}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className={`
            absolute right-3 top-1/2 -translate-y-1/2
            w-4 h-4 text-gray-600
            pointer-events-none
            ${disabled ? 'opacity-50' : ''}
          `.trim().replace(/\s+/g, ' ')}
        />
      </div>
    );
  }
);

Select.displayName = 'Select';
