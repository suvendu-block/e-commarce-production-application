import { describe, it, expect } from 'vitest';
import { formatPrice, formatDate, getSubtotal, computeTotals, slugify, classNames } from '../utils/helpers';

describe('formatPrice', () => {
  it('formats integers with two decimals', () => {
    expect(formatPrice(10)).toBe('$10.00');
  });

  it('formats decimals', () => {
    expect(formatPrice(1299.5)).toBe('$1299.50');
  });

  it('handles invalid input', () => {
    expect(formatPrice('abc')).toBe('$0.00');
    expect(formatPrice(undefined)).toBe('$0.00');
  });
});

describe('formatDate', () => {
  it('formats an ISO date', () => {
    expect(formatDate('2026-01-05T10:00:00.000Z')).toMatch(/Jan 5, 2026/);
  });

  it('returns a dash for missing values', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate('')).toBe('—');
  });
});

describe('getSubtotal', () => {
  it('sums price × qty', () => {
    const items = [
      { price: 10, qty: 2 },
      { price: 5.5, qty: 1 },
    ];
    expect(getSubtotal(items)).toBe(25.5);
  });

  it('returns 0 for an empty cart', () => {
    expect(getSubtotal([])).toBe(0);
  });
});

describe('computeTotals', () => {
  it('applies 8% tax and flat shipping under $100', () => {
    const totals = computeTotals([{ price: 50, qty: 1 }]);
    expect(totals.itemsPrice).toBe(50);
    expect(totals.taxPrice).toBe(4);
    expect(totals.shippingPrice).toBe(10);
    expect(totals.totalPrice).toBe(64);
  });

  it('gives free shipping over $100', () => {
    const totals = computeTotals([{ price: 120, qty: 1 }]);
    expect(totals.shippingPrice).toBe(0);
    expect(totals.totalPrice).toBe(129.6);
  });
});

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('iPhone 15 Pro')).toBe('iphone-15-pro');
  });

  it('strips trailing and leading separators', () => {
    expect(slugify('  Test Phone! ')).toBe('test-phone');
  });
});

describe('classNames', () => {
  it('joins truthy values and skips falsy ones', () => {
    const skip = false;
    expect(classNames('a', skip && 'b', null, 'c', undefined)).toBe('a c');
  });
});
