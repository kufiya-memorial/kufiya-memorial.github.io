import { describe, it, expect } from 'vitest';
import { computeLayout, matchesFilter, computeLineConnections } from '../utils/layout';
import type { Profile, Filters } from '../store/useMemorialStore';

// Helper: use fixed screen dimensions for predictable tests
const SW = 1024
const SH = 768

describe('computeLayout', () => {
  it('returns empty for total <= 0', () => {
    expect(computeLayout(0, 1, SW, SH).transforms).toEqual([]);
    expect(computeLayout(-1, 1, SW, SH).transforms).toEqual([]);
  });

  it('returns correct grid for total=1', () => {
    const { transforms } = computeLayout(1, 1, SW, SH);
    const real = transforms.filter(t => !t.isGhost);
    expect(real.length).toBeGreaterThanOrEqual(1);
    // At least one non-ghost pip exists at a valid position
    expect(Math.abs(real[0].rotationZ)).toBeCloseTo(Math.PI / 4);
  });

  it('applies odd-row X offset correctly', () => {
    const spacing = 2;
    const { transforms } = computeLayout(100, spacing, 1920, 960); // wide aspect
    // Find a pip in row 1 (odd)
    const { cols } = computeLayout(100, spacing, 1920, 960);
    const row1pip = transforms[cols]; // first pip in row 1
    if (row1pip) {
      expect(row1pip.x).toBe(0.5 * spacing); // col=0 with offset
    }
  });

  it('y spacing is half of x spacing', () => {
    const spacing = 4;
    const { transforms, cols } = computeLayout(100, spacing, 1024, 1024);
    if (transforms.length > cols) {
      // Row 0 y=0, Row 1 y=ySpacing=spacing/2=2
      expect(transforms[0].y).toBe(0);
      expect(transforms[cols].y).toBe(spacing / 2);
    }
  });

  it('total real pips >= realCount', () => {
    for (const total of [1, 5, 10, 100, 1000]) {
      const { transforms } = computeLayout(total, 1, 1500, 1000);
      const realCount = transforms.filter(t => !t.isGhost).length;
      expect(realCount).toBeGreaterThanOrEqual(total);
    }
  });

  it('ghost pips only in left/right bands', () => {
    const { transforms, cols } = computeLayout(1000, 1, 1920, 960);
    const leftBound = Math.floor(cols * 0.15);
    const rightBound = cols - leftBound;
    const ghosts = transforms.filter(t => t.isGhost);
    for (const g of ghosts) {
      const col = g.index % cols;
      expect(col < leftBound || col >= rightBound).toBe(true);
    }
  });
});

describe('matchesFilter', () => {
  const baseProfile: Profile = {
    name: 'اسم', en_name: 'Name', id: '1', dob: '2000-01-01', sex: 'm', age: 25,
  };
  const defaultFilters: Filters = { ageRange: { min: 0, max: 100 }, sex: 'all' };

  it('matches profile within default filters', () => {
    expect(matchesFilter(baseProfile, defaultFilters)).toBe(true);
  });

  it('excludes profile outside age range', () => {
    expect(matchesFilter(baseProfile, { ageRange: { min: 30, max: 50 }, sex: 'all' })).toBe(false);
  });

  it('includes profile at age range boundary', () => {
    expect(matchesFilter(baseProfile, { ageRange: { min: 25, max: 30 }, sex: 'all' })).toBe(true);
  });

  it('null age passes the age filter', () => {
    expect(matchesFilter({ ...baseProfile, age: null }, { ageRange: { min: 30, max: 50 }, sex: 'all' })).toBe(true);
  });

  it('filters by sex correctly', () => {
    expect(matchesFilter(baseProfile, { ageRange: { min: 0, max: 100 }, sex: 'm' })).toBe(true);
    expect(matchesFilter(baseProfile, { ageRange: { min: 0, max: 100 }, sex: 'f' })).toBe(false);
  });

  it('empty sex only matches when filter is all', () => {
    const p: Profile = { ...baseProfile, sex: '' };
    expect(matchesFilter(p, defaultFilters)).toBe(true);
    expect(matchesFilter(p, { ageRange: { min: 0, max: 100 }, sex: 'm' })).toBe(false);
  });
});

describe('computeLineConnections', () => {
  it('returns empty for empty transforms', () => {
    expect(computeLineConnections([], 0)).toEqual([]);
  });

  it('does not connect ghost pips', () => {
    const { transforms, cols } = computeLayout(10, 1, 1920, 960);
    const connections = computeLineConnections(transforms, cols);
    for (const [from, to] of connections) {
      expect(transforms[from].isGhost).toBe(false);
      expect(transforms[to].isGhost).toBe(false);
    }
  });

  it('connections are within bounds', () => {
    const { transforms, cols } = computeLayout(50, 1, 1500, 1000);
    const connections = computeLineConnections(transforms, cols);
    for (const [from, to] of connections) {
      expect(from).toBeGreaterThanOrEqual(0);
      expect(from).toBeLessThan(transforms.length);
      expect(to).toBeGreaterThanOrEqual(0);
      expect(to).toBeLessThan(transforms.length);
    }
  });
});
