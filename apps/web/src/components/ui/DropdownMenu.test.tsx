import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DropdownMenu, DropdownButton } from './DropdownMenu';
import type { DropdownMenuItem } from './DropdownMenu';

describe('DropdownMenu Component', () => {
  const mockItems: DropdownMenuItem[] = [
    { label: 'Profile', onClick: vi.fn() },
    { label: 'Settings', onClick: vi.fn() },
    { label: 'Logout', onClick: vi.fn(), variant: 'danger', separator: true },
  ];

  it('renders trigger element', () => {
    render(<DropdownMenu trigger={<button>Menu</button>} items={mockItems} />);

    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  it('does not show menu items initially', () => {
    render(<DropdownMenu trigger={<button>Menu</button>} items={mockItems} />);

    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('shows menu items when trigger is clicked', async () => {
    render(<DropdownMenu trigger={<button>Menu</button>} items={mockItems} />);

    const trigger = screen.getByText('Menu');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });

  it('calls onClick handler when menu item is clicked', async () => {
    const mockOnClick = vi.fn();
    const items: DropdownMenuItem[] = [{ label: 'Test Item', onClick: mockOnClick }];

    render(<DropdownMenu trigger={<button>Menu</button>} items={items} />);

    fireEvent.click(screen.getByText('Menu'));

    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Item'));

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('closes menu after item is clicked', async () => {
    const items: DropdownMenuItem[] = [{ label: 'Test Item', onClick: vi.fn() }];

    render(<DropdownMenu trigger={<button>Menu</button>} items={items} />);

    fireEvent.click(screen.getByText('Menu'));
    await waitFor(() => expect(screen.getByText('Test Item')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Test Item'));

    await waitFor(() => {
      expect(screen.queryByText('Test Item')).not.toBeInTheDocument();
    });
  });

  it('closes menu when clicking outside', async () => {
    render(
      <div>
        <DropdownMenu trigger={<button>Menu</button>} items={mockItems} />
        <div data-testid="outside">Outside</div>
      </div>
    );

    fireEvent.click(screen.getByText('Menu'));
    await waitFor(() => expect(screen.getByText('Profile')).toBeInTheDocument());

    fireEvent.mouseDown(screen.getByTestId('outside'));

    await waitFor(() => {
      expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    });
  });

  it('closes menu when Escape key is pressed', async () => {
    render(<DropdownMenu trigger={<button>Menu</button>} items={mockItems} />);

    fireEvent.click(screen.getByText('Menu'));
    await waitFor(() => expect(screen.getByText('Profile')).toBeInTheDocument());

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    });
  });

  it('renders separator before item when separator is true', async () => {
    render(<DropdownMenu trigger={<button>Menu</button>} items={mockItems} />);

    fireEvent.click(screen.getByText('Menu'));

    await waitFor(() => {
      const logoutItem = screen.getByText('Logout');
      expect(logoutItem).toBeInTheDocument();

      const separators = document.querySelectorAll('.h-px');
      expect(separators.length).toBeGreaterThan(0);
    });
  });

  it('applies danger variant styles', async () => {
    render(<DropdownMenu trigger={<button>Menu</button>} items={mockItems} />);

    fireEvent.click(screen.getByText('Menu'));

    await waitFor(() => {
      const logoutButton = screen.getByText('Logout').closest('button');
      expect(logoutButton?.className).toContain('text-error');
      expect(logoutButton?.className).toContain('hover:bg-error-light');
    });
  });

  it('renders icon when provided', async () => {
    const items: DropdownMenuItem[] = [
      {
        label: 'With Icon',
        onClick: vi.fn(),
        icon: <span data-testid="test-icon">🔍</span>,
      },
    ];

    render(<DropdownMenu trigger={<button>Menu</button>} items={items} />);

    fireEvent.click(screen.getByText('Menu'));

    await waitFor(() => {
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });
  });

  it('aligns menu to the right by default', async () => {
    const { container } = render(<DropdownMenu trigger={<button>Menu</button>} items={mockItems} />);

    fireEvent.click(screen.getByText('Menu'));

    await waitFor(() => {
      const menu = container.querySelector('.absolute');
      expect(menu?.className).toContain('right-0');
    });
  });

  it('aligns menu to the left when align="left"', async () => {
    const { container } = render(<DropdownMenu trigger={<button>Menu</button>} items={mockItems} align="left" />);

    fireEvent.click(screen.getByText('Menu'));

    await waitFor(() => {
      const menu = container.querySelector('.absolute');
      expect(menu?.className).toContain('left-0');
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <DropdownMenu trigger={<button>Menu</button>} items={mockItems} className="custom-class" />
    );

    const wrapper = container.querySelector('.relative');
    expect(wrapper?.className).toContain('custom-class');
  });
});

describe('DropdownButton Component', () => {
  const mockItems: DropdownMenuItem[] = [
    { label: 'Edit', onClick: vi.fn() },
    { label: 'Delete', onClick: vi.fn(), variant: 'danger' },
  ];

  it('renders button with label', () => {
    render(<DropdownButton label="Options" items={mockItems} />);

    expect(screen.getByText('Options')).toBeInTheDocument();
  });

  it('renders ChevronDown icon', () => {
    const { container } = render(<DropdownButton label="Options" items={mockItems} />);

    const chevronIcon = container.querySelector('svg');
    expect(chevronIcon).toBeInTheDocument();
  });

  it('renders custom icon when provided', () => {
    render(<DropdownButton label="Options" icon={<span data-testid="custom-icon">⚙️</span>} items={mockItems} />);

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('opens menu when button is clicked', async () => {
    render(<DropdownButton label="Options" items={mockItems} />);

    fireEvent.click(screen.getByText('Options'));

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  it('applies custom className to button', () => {
    const { container } = render(<DropdownButton label="Options" items={mockItems} className="custom-btn-class" />);

    const button = container.querySelector('button');
    expect(button?.className).toContain('custom-btn-class');
  });

  it('aligns menu based on align prop', async () => {
    const { container } = render(<DropdownButton label="Options" items={mockItems} align="left" />);

    fireEvent.click(screen.getByText('Options'));

    await waitFor(() => {
      const menu = container.querySelector('.absolute');
      expect(menu?.className).toContain('left-0');
    });
  });
});
