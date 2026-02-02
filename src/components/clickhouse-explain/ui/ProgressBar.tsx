import React from 'react';
import { formatNumber } from '../utils';

interface ProgressBarProps {
  label: string;
  selected: number;
  initial: number;
  reductionPct: string;
  accentColor?: string;
}

export function ProgressBar({
  label,
  selected,
  initial,
  reductionPct,
  accentColor
}: ProgressBarProps) {
  const ratio = initial > 0 ? (selected / initial) * 100 : 0;
  const isGoodReduction = parseInt(reductionPct) >= 50;
  const barColor = accentColor || (isGoodReduction ? '#22c55e' : '#eab308');
  const textColor = isGoodReduction ? '#22c55e' : '#eab308';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ color: '#d4d4d8', fontSize: 13 }}>{label}</span>
        <span style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 13,
          color: '#f4f4f5'
        }}>
          {formatNumber(selected)} / {formatNumber(initial)}
          <span style={{
            marginLeft: 8,
            color: textColor,
            fontWeight: 600
          }}>
            (-{reductionPct}%)
          </span>
        </span>
      </div>
      <div style={{
        height: 8,
        background: 'rgba(0,0,0,0.4)',
        borderRadius: 4,
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${ratio}%`,
          background: barColor,
          borderRadius: 4
        }} />
      </div>
    </div>
  );
}
