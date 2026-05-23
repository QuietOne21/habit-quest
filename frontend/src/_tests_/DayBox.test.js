import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DayBox from '../components/Daily/DayBox';

describe('DayBox', () => {
  it('renders unchecked state', () => {
    render(<DayBox habitId={1} day={5} completed={false} weekNum={1} onToggle={() => {}} />);
    const box = screen.getByTestId('daybox-1-5');
    expect(box).not.toHaveTextContent('✓');
    expect(box).toHaveAttribute('aria-checked', 'false');
  });

  it('renders checked state', () => {
    render(<DayBox habitId={1} day={5} completed={true} weekNum={2} onToggle={() => {}} />);
    const box = screen.getByTestId('daybox-1-5');
    expect(box).toHaveTextContent('✓');
    expect(box).toHaveClass('done', 'w2');
  });

  it('calls onToggle with correct args when clicked', () => {
    const mockToggle = jest.fn();
    render(<DayBox habitId={3} day={10} completed={false} weekNum={2} onToggle={mockToggle} />);
    fireEvent.click(screen.getByTestId('daybox-3-10'));
    expect(mockToggle).toHaveBeenCalledWith(3, 10, true);
  });
});