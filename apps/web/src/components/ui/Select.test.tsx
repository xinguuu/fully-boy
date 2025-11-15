import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from './Select';
import type { SelectOption } from './Select';

describe('Select Component', () => {
  const mockOptions: SelectOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  it('renders placeholder when no value selected', () => {
    render(<Select options={mockOptions} placeholder="Select an option" />);
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('shows selected value', () => {
    render(<Select options={mockOptions} value="option2" />);
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('opens dropdown when trigger is clicked', () => {
    render(<Select options={mockOptions} />);

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // All options should be visible
    mockOptions.forEach((option) => {
      const optionElements = screen.getAllByText(option.label);
      expect(optionElements.length).toBeGreaterThan(0);
    });
  });

  it('calls onChange when option is selected', () => {
    const handleChange = vi.fn();
    render(<Select options={mockOptions} onChange={handleChange} />);

    // Open dropdown
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // Click option
    const options = screen.getAllByRole('button');
    const option2Button = options.find((btn) => btn.textContent?.includes('Option 2'));
    fireEvent.click(option2Button!);

    expect(handleChange).toHaveBeenCalledWith('option2');
  });

  it('closes dropdown after selection', () => {
    render(<Select options={mockOptions} />);

    // Open dropdown
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // Click option
    const options = screen.getAllByRole('button');
    const option1Button = options.find((btn) => btn.textContent?.includes('Option 1'));
    fireEvent.click(option1Button!);

    // Dropdown should be closed - only trigger button should remain
    const remainingButtons = screen.getAllByRole('button');
    expect(remainingButtons.length).toBe(1);
  });

  it('closes dropdown on outside click', () => {
    render(
      <div>
        <Select options={mockOptions} />
        <div data-testid="outside">Outside</div>
      </div>
    );

    // Open dropdown
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // Click outside
    const outside = screen.getByTestId('outside');
    fireEvent.mouseDown(outside);

    // Dropdown should be closed
    const remainingButtons = screen.getAllByRole('button');
    expect(remainingButtons.length).toBe(1);
  });

  it('closes dropdown on Escape key', () => {
    render(<Select options={mockOptions} />);

    // Open dropdown
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' });

    // Dropdown should be closed
    const remainingButtons = screen.getAllByRole('button');
    expect(remainingButtons.length).toBe(1);
  });

  it('renders ChevronDown icon', () => {
    const { container } = render(<Select options={mockOptions} />);
    const chevronIcon = container.querySelector('svg');
    expect(chevronIcon).toBeInTheDocument();
  });

  it('rotates chevron when dropdown is open', () => {
    const { container } = render(<Select options={mockOptions} />);

    const trigger = screen.getByRole('button');
    const chevron = container.querySelector('svg');

    // SVG className is SVGAnimatedString, need to check baseVal
    const getClassName = (el: SVGElement | null) =>
      el?.getAttribute('class') || '';

    expect(getClassName(chevron as SVGElement)).not.toContain('rotate-180');

    fireEvent.click(trigger);

    expect(getClassName(chevron as SVGElement)).toContain('rotate-180');
  });

  it('applies error styles when error prop is true', () => {
    const { container } = render(<Select options={mockOptions} error />);
    const button = container.querySelector('button');
    expect(button?.className).toContain('border-error');
  });

  it('applies fullWidth class when fullWidth prop is true', () => {
    const { container } = render(<Select options={mockOptions} fullWidth />);
    const wrapper = container.querySelector('div');
    expect(wrapper?.className).toContain('w-full');
  });

  it('disables select when disabled prop is true', () => {
    render(<Select options={mockOptions} disabled />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('does not open dropdown when disabled', () => {
    render(<Select options={mockOptions} disabled />);

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // Only trigger button should be visible
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(1);
  });

  it('applies custom className', () => {
    const { container } = render(<Select options={mockOptions} className="custom-class" />);
    const wrapper = container.querySelector('div');
    expect(wrapper?.className).toContain('custom-class');
  });

  it('shows check icon for selected option', () => {
    const { container } = render(<Select options={mockOptions} value="option2" />);

    // Open dropdown
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // Check icon should be present
    const checkIcon = container.querySelector('svg.lucide-check');
    expect(checkIcon).toBeInTheDocument();
  });

  it('highlights selected option', () => {
    render(<Select options={mockOptions} value="option2" />);

    // Open dropdown
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // Find selected option button
    const options = screen.getAllByRole('button');
    const selectedOption = options.find((btn) => btn.className.includes('bg-primary-50'));
    expect(selectedOption).toBeInTheDocument();
  });
});
