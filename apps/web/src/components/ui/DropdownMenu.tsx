'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger';
  separator?: boolean;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  align?: 'left' | 'right';
  className?: string;
}

/**
 * DropdownMenu component - Custom dropdown menu with flexible trigger and items
 *
 * Based on design-guide.md line 681-740
 *
 * @example
 * ```tsx
 * <DropdownMenu
 *   trigger={
 *     <button className="flex items-center gap-2">
 *       <User className="w-5 h-5" />
 *       <span>Profile</span>
 *     </button>
 *   }
 *   items={[
 *     { label: '내 정보', onClick: () => {} },
 *     { label: '설정', onClick: () => {} },
 *     { label: '로그아웃', onClick: handleLogout, variant: 'danger', separator: true },
 *   ]}
 * />
 * ```
 */
export function DropdownMenu({ trigger, items, align = 'right', className = '' }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  const handleItemClick = (item: DropdownMenuItem) => {
    item.onClick();
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            absolute top-full mt-2
            w-48
            bg-white dark:bg-dark-2
            border border-gray-200 dark:border-dark-3
            rounded-lg
            shadow-xl
            py-2
            z-50
            animate-slide-down
            ${align === 'right' ? 'right-0' : 'left-0'}
          `.trim().replace(/\s+/g, ' ')}
        >
          {items.map((item, index) => (
            <div key={index}>
              {item.separator && index > 0 && <div className="h-px bg-gray-200 dark:bg-dark-3 my-1" />}
              <button
                onClick={() => handleItemClick(item)}
                className={`
                  w-full px-4 py-2
                  text-left text-sm
                  flex items-center gap-2
                  transition-colors
                  cursor-pointer
                  ${
                    item.variant === 'danger'
                      ? 'text-error hover:bg-error-light'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-3'
                  }
                `.trim().replace(/\s+/g, ' ')}
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * DropdownButton component - Predefined button-style trigger for DropdownMenu
 *
 * @example
 * ```tsx
 * <DropdownButton
 *   label="옵션"
 *   items={[
 *     { label: '편집하기', onClick: () => {} },
 *     { label: '삭제하기', onClick: () => {}, variant: 'danger' },
 *   ]}
 * />
 * ```
 */
export function DropdownButton({
  label,
  icon,
  items,
  align = 'right',
  className = '',
}: {
  label: string;
  icon?: React.ReactNode;
  items: DropdownMenuItem[];
  align?: 'left' | 'right';
  className?: string;
}) {
  return (
    <DropdownMenu
      trigger={
        <button
          className={`
            px-4 py-2
            bg-white border border-gray-300
            rounded-lg
            flex items-center gap-2
            hover:bg-gray-50
            transition-colors
            cursor-pointer
            ${className}
          `.trim().replace(/\s+/g, ' ')}
        >
          {icon}
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <ChevronDown className="w-4 h-4 text-gray-600" />
        </button>
      }
      items={items}
      align={align}
    />
  );
}
