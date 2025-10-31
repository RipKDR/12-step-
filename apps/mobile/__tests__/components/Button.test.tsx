/**
 * Example Test File
 * Shows testing patterns for mobile components
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from '@repo/ui';
import { renderWithProviders } from '../utils/test-utils';

describe('Button Component', () => {
  it('renders with title', () => {
    renderWithProviders(<Button title="Test Button" onPress={() => {}} />);
    expect(screen.getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    renderWithProviders(<Button title="Test" onPress={mockOnPress} />);
    
    const button = screen.getByText('Test');
    fireEvent.press(button);
    
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('renders with different variants', () => {
    const { rerender } = renderWithProviders(
      <Button title="Primary" variant="primary" onPress={() => {}} />
    );
    expect(screen.getByText('Primary')).toBeTruthy();

    rerender(
      <Button title="Secondary" variant="secondary" onPress={() => {}} />
    );
    expect(screen.getByText('Secondary')).toBeTruthy();
  });
});

