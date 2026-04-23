import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMemorialStore } from '../store/useMemorialStore';
import type { Profile } from '../store/useMemorialStore';

const mockProfile: Profile = {
  name: 'اسم',
  en_name: 'Test Name',
  id: '1',
  dob: '1990-01-01',
  sex: 'm',
  age: 33,
};

describe('useMemorialStore', () => {
  beforeEach(() => {
    useMemorialStore.setState({
      rawProfiles: [],
      filters: { ageRange: { min: 0, max: 100 }, sex: 'all' },
      activeProfile: null,
      appState: 'LANDING',
      isLoading: false,
      error: null,
    });
  });

  describe('initial state', () => {
    it('has empty rawProfiles', () => {
      expect(useMemorialStore.getState().rawProfiles).toEqual([]);
    });

    it('has default filters', () => {
      const { filters } = useMemorialStore.getState();
      expect(filters.ageRange).toEqual({ min: 0, max: 100 });
      expect(filters.sex).toBe('all');
    });

    it('has null activeProfile', () => {
      expect(useMemorialStore.getState().activeProfile).toBeNull();
    });

    it('has LANDING appState', () => {
      expect(useMemorialStore.getState().appState).toBe('LANDING');
    });

    it('has isLoading false and error null', () => {
      expect(useMemorialStore.getState().isLoading).toBe(false);
      expect(useMemorialStore.getState().error).toBeNull();
    });
  });

  describe('setFilters', () => {
    it('updates ageRange partially', () => {
      useMemorialStore.getState().setFilters({ ageRange: { min: 10, max: 50 } });
      expect(useMemorialStore.getState().filters.ageRange).toEqual({ min: 10, max: 50 });
      expect(useMemorialStore.getState().filters.sex).toBe('all');
    });

    it('updates sex partially', () => {
      useMemorialStore.getState().setFilters({ sex: 'f' });
      expect(useMemorialStore.getState().filters.sex).toBe('f');
      expect(useMemorialStore.getState().filters.ageRange).toEqual({ min: 0, max: 100 });
    });

    it('updates both filters at once', () => {
      useMemorialStore.getState().setFilters({ ageRange: { min: 5, max: 80 }, sex: 'm' });
      const { filters } = useMemorialStore.getState();
      expect(filters.ageRange).toEqual({ min: 5, max: 80 });
      expect(filters.sex).toBe('m');
    });
  });

  describe('setActiveProfile', () => {
    it('sets a profile', () => {
      useMemorialStore.getState().setActiveProfile(mockProfile);
      expect(useMemorialStore.getState().activeProfile).toEqual(mockProfile);
    });

    it('clears the profile with null', () => {
      useMemorialStore.getState().setActiveProfile(mockProfile);
      useMemorialStore.getState().setActiveProfile(null);
      expect(useMemorialStore.getState().activeProfile).toBeNull();
    });
  });

  describe('setAppState', () => {
    it('transitions to EXPLORING', () => {
      useMemorialStore.getState().setAppState('EXPLORING');
      expect(useMemorialStore.getState().appState).toBe('EXPLORING');
    });

    it('transitions back to LANDING', () => {
      useMemorialStore.getState().setAppState('EXPLORING');
      useMemorialStore.getState().setAppState('LANDING');
      expect(useMemorialStore.getState().appState).toBe('LANDING');
    });
  });

  describe('fetchProfiles', () => {
    it('sets isLoading during fetch and populates rawProfiles on success', async () => {
      // API returns [header, ...rows] where each row is a positional array
      const mockApiData = [
        ['id', 'en_name', 'ar_name', 'age', 'dob', 'sex', 'update'],
        ['1', 'Test Name', 'اسم', 33, '1990-01-01', 'm', 1],
      ];
      const mockSummary = {
        gaza: {
          reports: 1, last_update: '2025-01-01', massacres: 0,
          killed: { total: 1, children: 0, women: 0, civil_defence: 0, press: 0, medical: 0 },
          famine: { total: 0, children: 0 },
          aid_seeker: { killed: 0, injured: 0 },
          injured: { total: 0 },
        },
      };
      // Store fetches summary first, then data
      const fetchSpy = vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce({ ok: true, json: async () => mockSummary } as Response)
        .mockResolvedValueOnce({ ok: true, json: async () => mockApiData } as Response);

      const promise = useMemorialStore.getState().fetchProfiles();
      expect(useMemorialStore.getState().isLoading).toBe(true);
      expect(useMemorialStore.getState().error).toBeNull();

      await promise;
      expect(useMemorialStore.getState().isLoading).toBe(false);
      expect(useMemorialStore.getState().rawProfiles).toHaveLength(1);
      expect(useMemorialStore.getState().rawProfiles[0].en_name).toBe('Test Name');
      expect(useMemorialStore.getState().error).toBeNull();
      expect(useMemorialStore.getState().gazaSummary).toBeTruthy();
      fetchSpy.mockRestore();
    });

    it('sets error on fetch failure', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await useMemorialStore.getState().fetchProfiles();
      expect(useMemorialStore.getState().isLoading).toBe(false);
      expect(useMemorialStore.getState().error).toBe('Fetch failed: 500');
      expect(useMemorialStore.getState().rawProfiles).toEqual([]);
    });

    it('sets error on network error', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

      await useMemorialStore.getState().fetchProfiles();
      expect(useMemorialStore.getState().isLoading).toBe(false);
      expect(useMemorialStore.getState().error).toBe('Network error');
    });
  });
});
