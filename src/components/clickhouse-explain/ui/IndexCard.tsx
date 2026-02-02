import React from 'react';
import type { IndexInfo } from '../types';
import { INDEX_COLORS } from '../constants';
import { FilterRatioBar } from './FilterRatioBar';

interface IndexCardProps {
  index: IndexInfo;
}

export function IndexCard({ index }: IndexCardProps) {
  const colors = INDEX_COLORS[index.Type] || INDEX_COLORS.Skip;

  return (
    <div style={{
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: 8,
      padding: '10px 12px',
      marginTop: 6
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{
          background: colors.badge,
          color: '#000',
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 0.5
        }}>
          {index.Type}
        </span>
        {index.Name && (
          <span style={{
            color: colors.text,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 12,
            fontWeight: 600
          }}>
            {index.Name}
          </span>
        )}
        {index.Keys && (
          <span style={{
            color: colors.text,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 12
          }}>
            [{index.Keys.join(', ')}]
          </span>
        )}
        {index['Search Algorithm'] && (
          <span style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '2px 6px',
            borderRadius: 4,
            fontSize: 10,
            color: '#a1a1aa'
          }}>
            {index['Search Algorithm']}
          </span>
        )}
      </div>

      {index.Condition && (
        <div style={{
          marginTop: 6,
          fontSize: 11,
          color: '#d4d4d8',
          fontFamily: '"JetBrains Mono", monospace',
          background: 'rgba(0,0,0,0.25)',
          padding: '4px 8px',
          borderRadius: 4,
          wordBreak: 'break-all'
        }}>
          {index.Condition}
        </div>
      )}

      {index.Description && (
        <div style={{ marginTop: 4, fontSize: 11, color: '#a1a1aa' }}>
          {index.Description}
        </div>
      )}

      <FilterRatioBar
        initial={index['Initial Parts']}
        selected={index['Selected Parts']}
        label="Parts"
      />
      <FilterRatioBar
        initial={index['Initial Granules']}
        selected={index['Selected Granules']}
        label="Granules"
      />

      {index.Ranges !== undefined && (
        <div style={{
          marginTop: 6,
          fontSize: 11,
          color: '#a1a1aa',
          fontFamily: '"JetBrains Mono", monospace'
        }}>
          Ranges: {index.Ranges}
        </div>
      )}
    </div>
  );
}
