import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Logo from './Logo';

test('renders Logo without crashing', () => {
  render(<Logo />);
});

test('applies custom color to Logo', () => {
  const { container } = render(<Logo color="#FF0000" />);
  const group = container.querySelector('g');
  expect(group).toHaveAttribute('fill', '#FF0000');
});
