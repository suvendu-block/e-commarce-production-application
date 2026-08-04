import { describe, it, expect } from 'vitest';
import { dbProducts, clone } from '../api/mockData';
import { getProducts, getTopProducts } from '../api/productApi';

/**
 * Regression: Redux Toolkit freezes everything stored in state. If the mock
 * API handed live dbProducts references to the store, those objects became
 * frozen and later mutations (decrementStock, admin edits) threw
 * "Cannot assign to read only property". Every read path must return copies.
 */
describe('mock DB freeze-safety', () => {
  it('getProducts returns copies, never live references', async () => {
    const { products } = await getProducts({});
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]).not.toBe(dbProducts[0]);
    expect(dbProducts.includes(products[0])).toBe(false);
  });

  it('getTopProducts returns copies', async () => {
    const top = await getTopProducts();
    expect(top.length).toBeGreaterThan(0);
    expect(dbProducts.includes(top[0])).toBe(false);
  });

  it('clone deep-copies so mutations cannot leak back', () => {
    const copy = clone(dbProducts[0]);
    copy.countInStock = 1;
    copy.reviews = [];
    expect(dbProducts[0].countInStock).not.toBe(1);
    expect(dbProducts[0].reviews).not.toBe(copy.reviews);
  });
});
