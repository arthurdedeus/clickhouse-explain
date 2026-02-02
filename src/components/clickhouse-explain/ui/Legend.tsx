import React from 'react';
import { INDEX_COLORS } from '../constants';

export function Legend() {
  const legendItems = [
    { name: 'MinMax', ...INDEX_COLORS.MinMax },
    { name: 'Partition', ...INDEX_COLORS.Partition },
    { name: 'PrimaryKey', ...INDEX_COLORS.PrimaryKey },
    { name: 'Skip', ...INDEX_COLORS.Skip },
  ];

  return (
    <div style={{
      marginTop: 20,
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      padding: '14px 18px',
      background: '#18181b',
      borderRadius: 10,
      border: '1px solid #27272a'
    }}>
      <span style={{
        fontSize: 11,
        color: '#71717a',
        marginRight: 6,
        alignSelf: 'center',
        fontWeight: 600
      }}>
        LEGEND:
      </span>
      {legendItems.map(idx => (
        <div key={idx.name} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          background: idx.bg,
          border: `1px solid ${idx.border}`,
          borderRadius: 6,
          fontSize: 11
        }}>
          <span style={{
            width: 8,
            height: 8,
            background: idx.badge,
            borderRadius: 2
          }} />
          <span style={{ color: idx.text }}>{idx.name}</span>
        </div>
      ))}
    </div>
  );
}
