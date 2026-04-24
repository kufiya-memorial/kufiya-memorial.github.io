import type { Profile, Filters } from '../store/useMemorialStore';

export interface PipTransform {
  index: number;
  x: number;
  y: number;
  rotationZ: number;
  isGhost: boolean;
  isCore: boolean; // true = center area (gets real profiles), false = side band
}

export const HEADER_PX = 69;
export const BORDER_PX = 96;

export function computeLayout(
  realCount: number,
  xSpacing: number,
  screenWidth: number,
  screenHeight: number,
): { transforms: PipTransform[]; cols: number; rows: number; bandCols: number } {
  if (realCount <= 0) return { transforms: [], cols: 0, rows: 0, bandCols: 0 };

  const ySpacing = xSpacing / 2;
  const availH = screenHeight - HEADER_PX - BORDER_PX;
  const availAspect = screenWidth / availH;

  // We want the TOTAL grid (core + bands) to match the screen aspect ratio.
  // Grid width = cols * xSpacing, Grid height = rows * ySpacing = rows * xSpacing/2
  // width/height = cols / (rows * 0.5) = 2 * cols / rows
  // We want this to equal availAspect, so cols/rows = availAspect / 2
  const totalColsPerRow = availAspect / 2;

  // Find rows so that we have enough total slots for realCount
  // while maintaining the screen aspect ratio
  let rows = Math.max(1, Math.ceil(Math.sqrt(realCount / totalColsPerRow)));
  let cols = Math.max(1, Math.round(rows * totalColsPerRow));
  while (cols * rows < realCount) {
    rows++;
    cols = Math.max(1, Math.round(rows * totalColsPerRow));
  }

  // Side bands: ~12% of cols on each side (ghost pips for density fade)
  // But ensure core has enough columns for realCount
  let bandCols = Math.max(2, Math.ceil(cols * 0.12));
  let coreCols = cols - bandCols * 2;

  // If core is too small to hold realCount, reduce bands
  while (coreCols * rows < realCount && bandCols > 0) {
    bandCols--;
    coreCols = cols - bandCols * 2;
  }

  // If still not enough, add more rows
  while (coreCols * rows < realCount) {
    rows++;
    cols = Math.max(1, Math.round(rows * totalColsPerRow));
    coreCols = cols - bandCols * 2;
  }

  const totalSlots = cols * rows;

  // Ghost assignment: band slots that aren't needed for real pips
  // All band slots start as ghost. We un-ghost some near the core boundary
  // to create a density fade, but only if we have enough real pips to fill them.
  const ghostIndices = new Set<number>();

  // Step 1: Mark all band slots as ghosts
  for (let i = 0; i < totalSlots; i++) {
    const col = i % cols;
    if (col < bandCols || col >= cols - bandCols) {
      ghostIndices.add(i);
    }
  }

  // Step 2: Un-ghost band slots with density fade (more near core, fewer at edges)
  const bandSlotsByCol: number[][] = Array.from({ length: bandCols }, () => []);
  for (let i = 0; i < totalSlots; i++) {
    const col = i % cols;
    if (col < bandCols) {
      bandSlotsByCol[col].push(i);
    } else if (col >= cols - bandCols) {
      bandSlotsByCol[cols - 1 - col].push(i);
    }
  }

  for (let b = 0; b < bandCols; b++) {
    const distFromCore = bandCols - 1 - b; // 0 = closest to core
    const realFrac = 0.8 - (distFromCore / Math.max(bandCols - 1, 1)) * 0.7;
    const slots = bandSlotsByCol[b];
    // Shuffle
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }
    const realCount2 = Math.floor(slots.length * realFrac);
    for (let i = 0; i < realCount2; i++) {
      ghostIndices.delete(slots[i]);
    }
  }

  // Step 3: Fade out core overflow at the bottom-right.
  // Use a gradual density approach: divide the fade zone into bands,
  // with decreasing density toward the end.
  const coreOverflow = coreCols * rows - realCount;
  if (coreOverflow > 0) {
    const fadeZone = Math.min(coreOverflow * 3, coreCols * rows);
    // Collect core slot indices in order (top-left to bottom-right)
    const coreSlots: number[] = [];
    for (let i = 0; i < totalSlots; i++) {
      const col = i % cols;
      if (col >= bandCols && col < cols - bandCols && !ghostIndices.has(i)) {
        coreSlots.push(i);
      }
    }
    // Ghost slots from the end, with increasing probability toward the tail
    const fadeStart = Math.max(0, coreSlots.length - fadeZone);
    let ghosted = 0;
    for (let i = fadeStart; i < coreSlots.length && ghosted < coreOverflow; i++) {
      // Progress 0→1 through the fade zone
      const progress = (i - fadeStart) / Math.max(fadeZone - 1, 1);
      // Ghost probability increases with progress: sparse at start, dense at end
      const ghostProb = progress * progress;
      // Use deterministic pattern based on index to avoid randomness
      const hash = ((coreSlots[i] * 2654435761) >>> 0) / 4294967296;
      if (hash < ghostProb && ghosted < coreOverflow) {
        ghostIndices.add(coreSlots[i]);
        ghosted++;
      }
    }
    // If we didn't ghost enough, fill from the end
    for (let i = coreSlots.length - 1; i >= fadeStart && ghosted < coreOverflow; i--) {
      if (!ghostIndices.has(coreSlots[i])) {
        ghostIndices.add(coreSlots[i]);
        ghosted++;
      }
    }
  }

  // Build transforms
  const transforms: PipTransform[] = [];
  for (let i = 0; i < totalSlots; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const xOffset = row % 2 === 1 ? 0.5 * xSpacing : 0;
    const isCore = col >= bandCols && col < cols - bandCols;

    transforms.push({
      index: i,
      x: col * xSpacing + xOffset,
      y: row * ySpacing,
      rotationZ: row % 2 === 0 ? Math.PI / 4 : -Math.PI / 4,
      isGhost: ghostIndices.has(i),
      isCore,
    });
  }

  return { transforms, cols, rows, bandCols };
}

export function matchesFilter(profile: Profile, filters: Filters): boolean {
  const age = profile.age;
  const ageFilterActive = filters.ageRange.min > 0 || filters.ageRange.max < 120;
  if (age !== null) {
    if (age < filters.ageRange.min || age > filters.ageRange.max) return false;
  } else if (ageFilterActive) {
    // Unknown age doesn't match when age filter is active
    return false;
  }
  if (filters.sex === 'unknown') {
    if (profile.sex !== '') return false;
  } else if (filters.sex !== 'all' && profile.sex !== filters.sex) {
    return false;
  }
  return true;
}

export function computeLineConnections(
  transforms: PipTransform[],
  cols: number,
): [number, number][] {
  if (transforms.length === 0 || cols <= 0) return [];

  const total = transforms.length;
  const connections: [number, number][] = [];

  for (let i = 0; i < total; i++) {
    if (transforms[i].isGhost || !transforms[i].isCore) continue;

    const row = Math.floor(i / cols);
    const col = i % cols;
    const nextRowStart = (row + 1) * cols;
    if (nextRowStart >= total) continue;

    const isOddRow = row % 2 === 1;
    let t1Col: number, t2Col: number;

    if (isOddRow) {
      t1Col = col;
      t2Col = col + 1;
    } else {
      t1Col = col - 1;
      t2Col = col;
    }

    if (t1Col >= 0 && t1Col < cols) {
      const idx = nextRowStart + t1Col;
      if (idx < total && !transforms[idx].isGhost && transforms[idx].isCore) connections.push([i, idx]);
    }
    if (t2Col >= 0 && t2Col < cols) {
      const idx = nextRowStart + t2Col;
      if (idx < total && !transforms[idx].isGhost && transforms[idx].isCore) connections.push([i, idx]);
    }
  }

  return connections;
}
