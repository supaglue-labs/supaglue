import { describe, expect, test } from '@jest/globals';
import { getFullName } from './name';

describe('getFullName', () => {
  test('returns full name when both first name and last name are provided', () => {
    const result = getFullName('John', 'Doe');
    expect(result).toBe('John Doe');
  });

  test('returns only first name when no last name is provided', () => {
    const result = getFullName('John');
    expect(result).toBe('John');
  });

  test('returns only last name when no first name is provided', () => {
    const result = getFullName(null, 'Doe');
    expect(result).toBe('Doe');
  });

  test('returns null when neither first name nor last name is provided', () => {
    const result = getFullName();
    expect(result).toBeNull();
  });

  test('returns null when both first name and last name are null', () => {
    const result = getFullName(null, null);
    expect(result).toBeNull();
  });
});
