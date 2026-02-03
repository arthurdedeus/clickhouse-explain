import React from 'react';
import type { IndexInfo } from '../types';
import { INDEX_COLORS } from '../constants';
import { FilterRatioBar } from './FilterRatioBar';

interface IndexCardProps {
  index: IndexInfo;
  compact?: boolean;
}

export function IndexCard({ index, compact = false }: IndexCardProps) {
  const colors = INDEX_COLORS[index.Type] || INDEX_COLORS.Skip;

  return (
    <div style={{
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: compact ? 6 : 8,
      padding: compact ? '8px 10px' : '10px 12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 6 : 8, flexWrap: 'wrap', minWidth: 0 }}>
        <span style={{
          background: colors.badge,
          color: '#000',
          padding: compact ? '1px 6px' : '2px 8px',
          borderRadius: 4,
          fontSize: compact ? 9 : 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          flexShrink: 0
        }}>
          {index.Type}
        </span>
        {index.Name && (
          <span style={{
            color: colors.text,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: compact ? 11 : 12,
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0
          }}>
            {index.Name}
          </span>
        )}
        {index.Keys && (
          <span style={{
            color: colors.text,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: compact ? 10 : 12,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0
          }}>
            [{index.Keys.join(', ')}]
          </span>
        )}
        {index['Search Algorithm'] && (
          <span style={{
            background: 'rgba(0,0,0,0.3)',
            padding: compact ? '1px 4px' : '2px 6px',
            borderRadius: 4,
            fontSize: compact ? 9 : 10,
            color: '#a1a1aa',
            flexShrink: 0
          }}>
            {index['Search Algorithm']}
          </span>
        )}
      </div>

      {index.Condition && (
        <div style={{
          marginTop: compact ? 4 : 6,
          fontSize: compact ? 10 : 11,
          color: '#d4d4d8',
          fontFamily: '"JetBrains Mono", monospace',
          background: 'rgba(0,0,0,0.25)',
          padding: compact ? '3px 6px' : '4px 8px',
          borderRadius: 4,
          wordBreak: 'break-word',
          overflow: 'hidden'
        }}>
          {index.Condition}
        </div>
      )}

      {index.Description && !compact && (
        <div style={{ marginTop: 4, fontSize: 11, color: '#a1a1aa' }}>
          {index.Description}
        </div>
      )}

      <FilterRatioBar
        initial={index['Initial Parts']}
        selected={index['Selected Parts']}
        label="Parts"
        compact={compact}
      />
      <FilterRatioBar
        initial={index['Initial Granules']}
        selected={index['Selected Granules']}
        label="Granules"
        compact={compact}
      />

      {index.Ranges !== undefined && !compact && (
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
