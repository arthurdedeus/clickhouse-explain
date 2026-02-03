import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  color: string;
  compact?: boolean;
}

export function StatCard({ label, value, color, compact = false }: StatCardProps) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
      border: `1px solid ${color}40`,
      borderRadius: compact ? 8 : 10,
      padding: compact ? '10px 12px' : '14px 16px',
      textAlign: 'center',
      minWidth: 0
    }}>
      <div style={{
        fontSize: compact ? 18 : 24,
        fontWeight: 700,
        color: color,
        fontFamily: '"JetBrains Mono", monospace'
      }}>
        {value || '0'}
      </div>
      <div style={{
        fontSize: compact ? 9 : 11,
        color: '#a1a1aa',
        marginTop: compact ? 2 : 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {label}
      </div>
    </div>
  );
}

interface LargeStatCardProps {
  label: string;
  value: string | number;
  gradientFrom: string;
  gradientTo: string;
  valueColor: string;
  borderColor: string;
  subLabel?: string;
  compact?: boolean;
}

export function LargeStatCard({
  label,
  value,
  gradientFrom,
  gradientTo,
  valueColor,
  borderColor,
  subLabel,
  compact = false
}: LargeStatCardProps) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
      border: `1px solid ${borderColor}`,
      borderRadius: compact ? 8 : 10,
      padding: compact ? '10px 12px' : '14px 16px',
      textAlign: 'center',
      minWidth: 0
    }}>
      <div style={{
        fontSize: compact ? 18 : 24,
        fontWeight: 700,
        color: valueColor,
        fontFamily: '"JetBrains Mono", monospace'
      }}>
        {value}
      </div>
      <div style={{
        fontSize: compact ? 9 : 11,
        color: '#a1a1aa',
        marginTop: compact ? 2 : 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {label}
      </div>
      {subLabel && !compact && (
        <div style={{ fontSize: 10, color: '#71717a', marginTop: 2 }}>
          {subLabel}
        </div>
      )}
    </div>
  );
}
