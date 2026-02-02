import React from 'react';
import type { ProjectionInfo } from '../types';
import { formatNumber } from '../utils';

interface ProjectionCardProps {
  projection: ProjectionInfo;
}

export function ProjectionCard({ projection }: ProjectionCardProps) {
  const stats = [
    { label: 'Parts', value: projection['Selected Parts'] },
    { label: 'Marks', value: projection['Selected Marks'] },
    { label: 'Ranges', value: projection['Selected Ranges'] },
    { label: 'Rows', value: projection['Selected Rows'] },
  ].filter(s => s.value !== undefined);

  return (
    <div style={{
      background: 'rgba(236, 72, 153, 0.12)',
      border: '1px solid rgba(236, 72, 153, 0.35)',
      borderRadius: 8,
      padding: '10px 12px',
      marginTop: 6
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{
          background: '#ec4899',
          color: '#000',
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase'
        }}>
          Projection
        </span>
        <span style={{
          color: '#fbcfe8',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 12,
          fontWeight: 600
        }}>
          {projection.Name}
        </span>
      </div>

      {projection.Description && (
        <div style={{ marginTop: 6, fontSize: 11, color: '#f9a8d4' }}>
          {projection.Description}
        </div>
      )}

      {projection.Condition && (
        <div style={{
          marginTop: 6,
          fontSize: 11,
          color: '#d4d4d8',
          fontFamily: '"JetBrains Mono", monospace',
          background: 'rgba(0,0,0,0.25)',
          padding: '4px 8px',
          borderRadius: 4
        }}>
          {projection.Condition}
        </div>
      )}

      {stats.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 8,
          marginTop: 10
        }}>
          {stats.map(stat => (
            <div key={stat.label} style={{
              background: 'rgba(0,0,0,0.2)',
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 11,
              fontFamily: '"JetBrains Mono", monospace'
            }}>
              <span style={{ color: '#a1a1aa' }}>{stat.label}: </span>
              <span style={{ color: '#f4f4f5' }}>{formatNumber(stat.value)}</span>
            </div>
          ))}
        </div>
      )}

      {projection['Filtered Parts'] !== undefined && projection['Filtered Parts'] > 0 && (
        <div style={{
          marginTop: 8,
          fontSize: 11,
          color: '#22c55e',
          fontFamily: '"JetBrains Mono", monospace'
        }}>
          ✓ {projection['Filtered Parts']} parts filtered by projection
        </div>
      )}
    </div>
  );
}
