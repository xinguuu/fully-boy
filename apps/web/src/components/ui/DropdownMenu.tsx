'use client';

import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
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
  align?: 'start' | 'end' | 'left' | 'right';
  className?: string;
}

/**
 * DropdownMenu component - Radix UI based dropdown with full accessibility
 *
 * Features:
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Screen reader support (ARIA attributes)
 * - Focus management
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
export function DropdownMenu({ trigger, items, align = 'end', className = '' }: DropdownMenuProps) {
  // Convert legacy 'left'/'right' to Radix 'start'/'end'
  const radixAlign = align === 'left' ? 'start' : align === 'right' ? 'end' : align;

  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <div className={`cursor-pointer ${className}`}>{trigger}</div>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={radixAlign}
          sideOffset={8}
          className="z-50 min-w-[12rem] overflow-hidden rounded-lg border border-gray-200 bg-white py-2 shadow-xl animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
        >
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {item.separator && index > 0 && (
                <DropdownMenuPrimitive.Separator className="h-px bg-gray-200 my-1" />
              )}
              <DropdownMenuPrimitive.Item
                onClick={item.onClick}
                className={`
                  relative flex items-center gap-2 px-4 py-2 text-sm outline-none cursor-pointer
                  transition-colors select-none
                  data-[highlighted]:outline-none
                  ${
                    item.variant === 'danger'
                      ? 'text-red-600 data-[highlighted]:bg-red-50'
                      : 'text-gray-700 data-[highlighted]:bg-gray-100'
                  }
                `}
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
              </DropdownMenuPrimitive.Item>
            </React.Fragment>
          ))}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
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
  align = 'end',
  className = '',
}: {
  label: string;
  icon?: React.ReactNode;
  items: DropdownMenuItem[];
  align?: 'start' | 'end' | 'left' | 'right';
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
