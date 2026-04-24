import { create } from 'zustand';

export interface Profile {
  name: string;
  en_name: string;
  id: string;
  dob: string;
  sex: 'm' | 'f' | '';
  age: number | null;
}

export interface GazaSummary {
  reports: number;
  last_update: string;
  massacres: number;
  killed: {
    total: number;
    children: number;
    women: number;
    civil_defence: number;
    press: number;
    medical: number;
  };
  famine: { total: number; children: number };
  aid_seeker: { killed: number; injured: number };
  injured: { total: number };
}

export type AppState = 'LANDING' | 'ONBOARDING' | 'STATS' | 'EXPLORING';

export interface Filters {
  ageRange: { min: number; max: number };
  sex: 'all' | 'm' | 'f' | 'unknown';
}

export interface MemorialStore {
  rawProfiles: Profile[];
  gazaSummary: GazaSummary | null;
  filters: Filters;
  activeProfile: Profile | null;
  appState: AppState;
  isLoading: boolean;
  error: string | null;
  zoomComplete: boolean;

  fetchProfiles: () => Promise<void>;
  setFilters: (filters: Partial<Filters>) => void;
  setActiveProfile: (profile: Profile | null) => void;
  setAppState: (state: AppState) => void;
  setZoomComplete: (v: boolean) => void;
}

const DATA_URL = 'https://data.techforpalestine.org/api/v3/killed-in-gaza.min.json';
const SUMMARY_URL = 'https://data.techforpalestine.org/api/v3/summary.json';

async function fetchWithRetry(url: string, retries = 3, delay = 2000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url);
    if (res.ok) return res;
    if (res.status === 429 && i < retries - 1) {
      await new Promise(r => setTimeout(r, delay * (i + 1)));
      continue;
    }
    throw new Error(`Fetch failed: ${res.status}`);
  }
  throw new Error('Max retries exceeded');
}

export const useMemorialStore = create<MemorialStore>((set) => ({
  rawProfiles: [],
  gazaSummary: null,
  filters: { ageRange: { min: 0, max: 120 }, sex: 'all' },
  activeProfile: null,
  appState: 'LANDING',
  isLoading: false,
  error: null,
  zoomComplete: false,

  fetchProfiles: async () => {
    set({ isLoading: true, error: null });
    try {
      // Fetch sequentially to avoid rate limiting
      const summaryRes = await fetchWithRetry(SUMMARY_URL);
      const summaryData = await summaryRes.json() as { gaza: GazaSummary };
      const gaza = summaryData.gaza;

      const dataRes = await fetchWithRetry(DATA_URL);
      const rawData = await dataRes.json() as unknown[][];

      const totalKilled = gaza.killed.total;

      const rows = rawData.slice(1);
      const knownProfiles: Profile[] = rows.map((row) => ({
        id: String(row[0] ?? ''),
        en_name: String(row[1] ?? ''),
        name: String(row[2] ?? ''),
        age: typeof row[3] === 'number' ? row[3] : null,
        dob: String(row[4] ?? ''),
        sex: (row[5] === 'm' || row[5] === 'f' ? row[5] : '') as Profile['sex'],
      }));

      const unknownCount = Math.max(0, totalKilled - knownProfiles.length);
      const unknownProfiles: Profile[] = Array.from({ length: unknownCount }, (_, i) => ({
        id: `unknown-${i}`,
        en_name: 'Unknown',
        name: 'غير معروف',
        age: null,
        dob: '',
        sex: '' as const,
      }));

      const allProfiles = [...knownProfiles, ...unknownProfiles];

      // Shuffle (Fisher-Yates)
      for (let i = allProfiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allProfiles[i], allProfiles[j]] = [allProfiles[j], allProfiles[i]];
      }

      set({ rawProfiles: allProfiles, gazaSummary: gaza, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      set({ error: message, isLoading: false });
    }
  },

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  setActiveProfile: (profile) => set({ activeProfile: profile }),
  setAppState: (appState) => set({ appState }),
  setZoomComplete: (v) => set({ zoomComplete: v }),
}));
