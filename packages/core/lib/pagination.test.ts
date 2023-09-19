import { describe, expect, test } from '@jest/globals';
import type { Cursor, SupaglueStandardRecord } from '.';
import { decodeCursor, getPaginatedSupaglueRecords } from '.';

describe('getPaginatedSupaglueRecords', () => {
  const TOTAL = 1000;
  const generateSampleRecords = (count: number, reverse = false, startId = 1): SupaglueStandardRecord[] => {
    const results: SupaglueStandardRecord[] = Array.from({ length: count }, (_, i) => ({
      _supaglue_application_id: 'appId',
      _supaglue_provider_name: 'salesforce',
      _supaglue_customer_id: 'customerId',
      _supaglue_id: (startId + i).toString(),
      _supaglue_emitted_at: new Date(),
      _supaglue_last_modified_at: new Date(),
      _supaglue_is_deleted: false,
      _supaglue_raw_data: {},
    }));
    return reverse ? results.reverse() : results;
  };

  test('should contain both next and previous pagination', () => {
    const rows = generateSampleRecords(11);
    const cursor: Cursor = { id: '0', reverse: false };
    const result = getPaginatedSupaglueRecords(rows, TOTAL, 10, '_supaglue_id', cursor);

    expect(result.pagination.next).toBeTruthy();
    if (result.pagination.next) {
      expect(decodeCursor(result.pagination.next)).toEqual({ id: '10', reverse: false });
    }
    expect(result.pagination.previous).toBeTruthy();
    if (result.pagination.previous) {
      expect(decodeCursor(result.pagination.previous)).toEqual({ id: '1', reverse: true });
    }
    expect(result.records.length).toBe(10);
  });

  test('should contain only previous pagination', () => {
    const rows = generateSampleRecords(10);
    const cursor: Cursor = { id: '0', reverse: false };
    const result = getPaginatedSupaglueRecords(rows, TOTAL, 10, '_supaglue_id', cursor);

    expect(result.pagination.next).toBeNull();
    expect(result.pagination.previous).toBeTruthy();
    if (result.pagination.previous) {
      expect(decodeCursor(result.pagination.previous)).toEqual({ id: '1', reverse: true });
    }
    expect(result.records.length).toBe(10);
  });

  test('should contain only next pagination', () => {
    const rows = generateSampleRecords(11);
    const result = getPaginatedSupaglueRecords(rows, TOTAL, 10, '_supaglue_id');

    expect(result.pagination.next).toBeTruthy();
    if (result.pagination.next) {
      expect(decodeCursor(result.pagination.next)).toEqual({ id: '10', reverse: false });
    }
    expect(result.pagination.previous).toBeNull();
    expect(result.records.length).toBe(10);
  });

  test('should not contain any pagination', () => {
    const rows = generateSampleRecords(9);
    const result = getPaginatedSupaglueRecords(rows, TOTAL, 10, '_supaglue_id');

    expect(result.pagination.next).toBeNull();
    expect(result.pagination.previous).toBeNull();
    expect(result.records.length).toBe(9);
  });

  test('should contain both next and previous pagination (reverse)', () => {
    const rows = generateSampleRecords(11, true);
    const cursor: Cursor = { id: '11', reverse: true };
    const result = getPaginatedSupaglueRecords(rows, TOTAL, 10, '_supaglue_id', cursor);

    expect(result.pagination.next).toBeTruthy();
    if (result.pagination.next) {
      expect(decodeCursor(result.pagination.next)).toEqual({ id: '11', reverse: false });
    }
    expect(result.pagination.previous).toBeTruthy();
    if (result.pagination.previous) {
      expect(decodeCursor(result.pagination.previous)).toEqual({ id: '2', reverse: true });
    }
    expect(result.records.length).toBe(10);
  });

  test('should contain only next pagination (reverse)', () => {
    const rows = generateSampleRecords(9, true);
    const cursor: Cursor = { id: '9', reverse: true };
    const result = getPaginatedSupaglueRecords(rows, TOTAL, 10, '_supaglue_id', cursor);

    expect(result.pagination.next).toBeTruthy();
    if (result.pagination.next) {
      expect(decodeCursor(result.pagination.next)).toEqual({ id: '9', reverse: false });
    }
    expect(result.pagination.previous).toBeNull();
    expect(result.records.length).toBe(9);
  });
});
