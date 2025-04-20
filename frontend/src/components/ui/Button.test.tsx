import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary-600');
  });
  
  it('renders different variants correctly', () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-secondary-600');
    
    rerender(<Button variant="tertiary">Tertiary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-gray-800');
    
    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-transparent');
    
    rerender(<Button variant="gradient">Gradient</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-gradient-to-r');
    
    rerender(<Button variant="neon">Neon</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-gray-900');
    
    rerender(<Button variant="glass">Glass</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-white/10');
    
    rerender(<Button variant="cosmic">Cosmic</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-black');
  });
  
  it('applies different sizes correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-3 py-2 text-sm');
    
    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-4 py-2.5 text-base');
    
    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-6 py-3 text-lg');
  });
  
  it('applies full width class when fullWidth is true', () => {
    render(<Button fullWidth>Full Width</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });
  
  it('applies custom class name when provided', () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });
  
  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
  
  it('renders with children correctly', () => {
    render(
      <Button>
        <span data-testid="child-element">Child Element</span>
      </Button>
    );
    
    expect(screen.getByTestId('child-element')).toBeInTheDocument();
  });
}); 