import React from 'react';
import { formatNumber, getBarColor } from '../utils';

interface FilterRatioBarProps {
  initial?: number;
  selected?: number;
  label: string;
  compact?: boolean;
}

export function FilterRatioBar({ initial, selected, label, compact = false }: FilterRatioBarProps) {
  if (initial === undefined || selected === undefined) return null;

  const ratio = initial > 0 ? (selected / initial) : 0;
  const percentage = (ratio * 100).toFixed(1);
  const filtered = initial - selected;
  const filteredPct = initial > 0 ? ((filtered / initial) * 100).toFixed(0) : '0';

  return (
    <div style={{ marginTop: compact ? 6 : 8 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: compact ? 2 : 4,
        flexWrap: 'wrap',
        gap: 4
      }}>
        <span style={{ fontSize: compact ? 10 : 11, color: '#a1a1aa' }}>{label}</span>
        <span style={{
          fontSize: compact ? 10 : 12,
          fontFamily: '"JetBrains Mono", monospace',
          color: '#f4f4f5'
        }}>
          {formatNumber(selected)} / {formatNumber(initial)}
          <span style={{
            marginLeft: compact ? 4 : 6,
            color: getBarColor(parseFloat(percentage)),
            fontWeight: 600
          }}>
            ({percentage}%)
          </span>
        </span>
      </div>
      <div style={{
        height: compact ? 4 : 6,
        background: 'rgba(0,0,0,0.4)',
        borderRadius: compact ? 2 : 3,
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          width: `${Math.min(100, ratio * 100)}%`,
          background: getBarColor(parseFloat(percentage)),
          borderRadius: compact ? 2 : 3,
          transition: 'width 0.3s ease'
        }} />
      </div>
      {filtered > 0 && !compact && (
        <div style={{
          fontSize: 10,
          color: '#22c55e',
          marginTop: 2,
          fontFamily: '"JetBrains Mono", monospace'
        }}>
          ✓ {formatNumber(filtered)} filtered out ({filteredPct}% reduction)
        </div>
      )}
    </div>
  );
}
