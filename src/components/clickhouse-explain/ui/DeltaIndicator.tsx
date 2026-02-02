import React from 'react';
import { formatNumber } from '../utils';

interface DeltaIndicatorProps {
  valueA?: number | null;
  valueB?: number | null;
  lowerIsBetter?: boolean;
}

export function DeltaIndicator({
  valueA,
  valueB,
  lowerIsBetter = true
}: DeltaIndicatorProps) {
  if (valueA === undefined || valueB === undefined || valueA === null || valueB === null) {
    return null;
  }

  const diff = valueB - valueA;
  const pctChange = valueA !== 0 ? ((diff / valueA) * 100) : (valueB !== 0 ? 100 : 0);

  if (diff === 0) {
    return <span style={{ color: '#71717a', fontSize: 11 }}>—</span>;
  }

  const isImproved = lowerIsBetter ? diff < 0 : diff > 0;
  const color = isImproved ? '#22c55e' : '#ef4444';
  const arrow = diff > 0 ? '↑' : '↓';

  const displayDiff = formatNumber(Math.abs(diff));

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
