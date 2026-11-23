import { describe, expect, it } from 'vitest';
import { money, ORDER_STEPS, ORDER_STATUS, cn } from '../src/lib/format.js';

describe('format helpers', () => {
  it('formats rupees in Indian grouping', () => {
    expect(money(1250000.5)).toBe('₹12,50,000.50');
    expect(money(undefined)).toBe('₹0.00');
  });
  it('has a label for every order step', () => {
    ORDER_STEPS.forEach((s) => expect(ORDER_STATUS[s]).toBeTruthy());
    expect(ORDER_STATUS.CANCELLED).toBe('Cancelled');
  });
  it('cn joins only truthy classes', () => {
    expect(cn('a', false, null, 'b')).toBe('a b');
  });
});
