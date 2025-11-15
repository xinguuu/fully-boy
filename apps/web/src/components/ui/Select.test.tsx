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

  it('renders select with options', () => {
    render(<Select options={mockOptions} />);

    mockOptions.forEach((option) => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  it('renders placeholder when provided', () => {
    render(<Select options={mockOptions} placeholder="Select an option" />);

    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('shows selected value', () => {
    render(<Select options={mockOptions} value="option2" />);

    const selectElement = screen.getByRole('combobox') as HTMLSelectElement;
    expect(selectElement.value).toBe('option2');
  });

  it('calls onChange when selection changes', () => {
    const handleChange = vi.fn();
    render(<Select options={mockOptions} value="option1" onChange={handleChange} />);

    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'option2' } });

    expect(handleChange).toHaveBeenCalledWith('option2');
  });

  it('renders ChevronDown icon', () => {
    const { container } = render(<Select options={mockOptions} />);

    const chevronIcon = container.querySelector('svg');
    expect(chevronIcon).toBeInTheDocument();
  });

  it('applies error styles when error prop is true', () => {
    const { container } = render(<Select options={mockOptions} error />);

    const selectElement = container.querySelector('select');
    expect(selectElement?.className).toContain('border-error');
  });

  it('applies fullWidth class when fullWidth prop is true', () => {
    const { container } = render(<Select options={mockOptions} fullWidth />);

    const wrapper = container.querySelector('div');
    expect(wrapper?.className).toContain('w-full');

    const selectElement = container.querySelector('select');
    expect(selectElement?.className).toContain('w-full');
  });

  it('disables select when disabled prop is true', () => {
    render(<Select options={mockOptions} disabled />);

    const selectElement = screen.getByRole('combobox') as HTMLSelectElement;
    expect(selectElement).toBeDisabled();
  });

  it('applies custom className', () => {
    const { container } = render(<Select options={mockOptions} className="custom-class" />);

    const selectElement = container.querySelector('select');
    expect(selectElement?.className).toContain('custom-class');
  });

  it('supports ref forwarding', () => {
    const ref = vi.fn();
    render(<Select options={mockOptions} ref={ref} />);

    expect(ref).toHaveBeenCalled();
  });

  it('renders empty select when no options provided', () => {
    render(<Select options={[]} />);

    const selectElement = screen.getByRole('combobox');
    expect(selectElement.children.length).toBe(0);
  });

  it('displays placeholder as disabled option', () => {
    render(<Select options={mockOptions} placeholder="Choose one" value="" />);

    const placeholderOption = screen.getByText('Choose one') as HTMLOptionElement;
    expect(placeholderOption).toBeInTheDocument();
    expect(placeholderOption.disabled).toBe(true);
  });
});
