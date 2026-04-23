import type { Profile, Filters } from '../store/useMemorialStore';

export interface PipTransform {
  index: number;
  x: number;
  y: number;
  rotationZ: number;
  isGhost: boolean;
}

export const HEADER_PX = 70;
export const BORDER_PX = 95;

/**
 * Grid fills the available screen area exactly.
 * 
 * 1. Compute rows from realCount, derive cols to match available aspect
 * 2. Add ~15% extra cols on each side for ghost bands
 * 3. Ghost pips scattered in the side bands with fading density
 * 4. Top/bottom rows are fully packed — no vertical ghosts
 */
export function computeLayout(
  realCount: number,
  xSpacing: number,
  screenWidth: number,
  screenHeight: number,
): { transforms: PipTransform[]; cols: number; rows: number } {
  if (realCount <= 0) return { transforms: [], cols: 0, rows: 0 };

  const ySpacing = xSpacing / 2;
  const availH = screenHeight - HEADER_PX - BORDER_PX;
  const availAspect = screenWidth / availH;

  // cols_core / (rows * 0.5) = availAspect → cols_core = rows * availAspect * 0.5
  const coreColsPerRow = availAspect * 0.5;

  // Find rows so core fits realCount
  let rows = Math.ceil(Math.sqrt(realCount / coreColsPerRow));
  let coreCols = Math.max(1, Math.round(rows * coreColsPerRow));
  while (coreCols * rows < realCount) {
    rows++;
    coreCols = Math.max(1, Math.round(rows * coreColsPerRow));
  }

  // Add side bands: ~15% of coreCols on each side
  const bandCols = Math.max(3, Math.ceil(coreCols * 0.15));
  const cols = coreCols + bandCols * 2;

  const totalSlots = cols * rows;
  const ghostCount = totalSlots - realCount;

  // Ghost pips: only in the side bands (col < bandCols or col >= cols - bandCols)
  // Density fades: more ghosts near the edge, fewer near the center
  const ghostIndices = new Set<number>();

  if (ghostCount > 0) {
    // Collect all slots in the side bands
    const bandSlots: number[] = [];
    for (let i = 0; i < totalSlots; i++) {
      const col = i % cols;
      if (col < bandCols || col >= cols - bandCols) {
        bandSlots.push(i);
      }
    }

    // Shuffle band slots randomly
    for (let i = bandSlots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bandSlots[i], bandSlots[j]] = [bandSlots[j], bandSlots[i]];
    }

    // Pick ghostCount from the shuffled band slots
    for (let i = 0; i < ghostCount && i < bandSlots.length; i++) {
      ghostIndices.add(bandSlots[i]);
    }
  }

  const latticeW = cols * xSpacing;
  const latticeH = rows * ySpacing;
  console.log('[LAYOUT] coreCols=', coreCols, 'bandCols=', bandCols, 'totalCols=', cols,
    'rows=', rows, 'ghosts=', ghostCount, '(placed', ghostIndices.size, ')',
    'lattice=', latticeW.toFixed(1), 'x', latticeH.toFixed(1));

  const transforms: PipTransform[] = [];
  for (let i = 0; i < totalSlots; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const xOffset = row % 2 === 1 ? 0.5 * xSpacing : 0;

    transforms.push({
      index: i,
      x: col * xSpacing + xOffset,
      y: row * ySpacing,
      rotationZ: row % 2 === 0 ? Math.PI / 4 : -Math.PI / 4,
      isGhost: ghostIndices.has(i),
    });
  }

  return { transforms, cols, rows };
}

export function matchesFilter(profile: Profile, filters: Filters): boolean {
  const age = profile.age;
  if (age !== null) {
    if (age < filters.ageRange.min || age > filters.ageRange.max) return false;
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
    if (transforms[i].isGhost) continue;

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
      if (idx < total && !transforms[idx].isGhost) connections.push([i, idx]);
    }
    if (t2Col >= 0 && t2Col < cols) {
      const idx = nextRowStart + t2Col;
      if (idx < total && !transforms[idx].isGhost) connections.push([i, idx]);
    }
  }

  return connections;
}
