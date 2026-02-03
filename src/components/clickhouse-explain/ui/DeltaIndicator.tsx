import React from 'react';
import { formatNumber } from '../utils';

interface DeltaIndicatorProps {
  valueA?: number | null;
  valueB?: number | null;
  lowerIsBetter?: boolean;
  isPercentage?: boolean;
}

export function DeltaIndicator({
  valueA,
  valueB,
  lowerIsBetter = true,
  isPercentage = false
}: DeltaIndicatorProps) {
  if (valueA === undefined || valueB === undefined || valueA === null || valueB === null) {
    return null;
  }

  // Round to avoid floating point precision issues
  const diff = Math.round((valueB - valueA) * 100) / 100;

  if (diff === 0) {
    return <span style={{ color: '#71717a', fontSize: 11 }}>—</span>;
  }

  const isImproved = lowerIsBetter ? diff < 0 : diff > 0;
  const color = isImproved ? '#22c55e' : '#ef4444';
  const arrow = diff > 0 ? '↑' : '↓';

  // Format the display value
  let displayDiff: string;
  const absDiff = Math.abs(diff);

  if (isPercentage) {
    // For percentages, show with 1 decimal place and % suffix
    displayDiff = `${absDiff.toFixed(1)}%`;
  } else {
    // Use formatNumber for large values, otherwise show with appropriate precision
    displayDiff = formatNumber(absDiff) || absDiff.toFixed(0);
  }

  return (
    <span style={{
      color,
      fontSize: 11,
      fontFamily: '"JetBrains Mono", monospace',
      fontWeight: 600
    }}>
      {arrow} {displayDiff}
    </span>
  );
}
