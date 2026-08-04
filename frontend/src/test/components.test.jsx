import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Message from '../components/ui/Message';
import Rating from '../components/ui/Rating';
import Paginate from '../components/ui/Paginate';

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('Message', () => {
  it('renders children with error variant', () => {
    render(<Message variant="error">Something broke</Message>);
    expect(screen.getByRole('alert')).toHaveTextContent('Something broke');
  });

  it('renders children with info variant', () => {
    render(<Message variant="info">Just so you know</Message>);
    expect(screen.getByRole('status')).toHaveTextContent('Just so you know');
  });
});

describe('Rating', () => {
  it('shows 5 stars for a perfect rating', () => {
    const { container } = wrap(<Rating value={5} />);
    expect(container.querySelectorAll('svg').length).toBe(5);
  });

  it('renders interactive mode with 5 buttons', async () => {
    const onChange = vi.fn();
    wrap(<Rating interactive value={3} onChange={onChange} />);
    const buttons = screen.getAllByRole('radio');
    expect(buttons).toHaveLength(5);
    await userEvent.click(buttons[4]);
    expect(onChange).toHaveBeenCalledWith(5);
  });
});

describe('Paginate', () => {
  it('returns nothing for a single page', () => {
    const { container } = wrap(<Paginate pages={1} page={1} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders page links when multiple pages exist', () => {
    wrap(<Paginate pages={3} page={2} />);
    expect(screen.getAllByRole('link').length).toBeGreaterThanOrEqual(3);
    expect(screen.getByRole('link', { name: '1' })).toHaveAttribute('href', '/page/1');
    expect(screen.getByRole('link', { name: '3' })).toHaveAttribute('href', '/page/3');
  });

  it('marks the current page with aria-current', () => {
    wrap(<Paginate pages={3} page={2} />);
    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page');
  });

  it('preserves keyword in page links', () => {
    wrap(<Paginate pages={2} page={1} keyword="phone" />);
    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute('href', '/page/2?keyword=phone');
  });
});
