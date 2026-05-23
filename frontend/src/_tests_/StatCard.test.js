import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatCard from '../components/Dashboard/StatCard';

describe('StatCard', () => {
  it('renders label, value, and sub text', () => {
    render(<StatCard label="Test Label" value="42%" sub="Some subtitle" color="#A78BFA" />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();
    expect(screen.getByText('Some subtitle')).toBeInTheDocument();
  });

  it('applies the correct color to value', () => {
    render(<StatCard label="XP" value="5000" color="#FCD34D" />);
    expect(screen.getByText('5000')).toHaveStyle({ color: '#FCD34D' });
  });
});