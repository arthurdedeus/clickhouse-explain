import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  color: string;
}

export function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
      border: `1px solid ${color}40`,
      borderRadius: 10,
      padding: '14px 16px',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: 24,
        fontWeight: 700,
        color: color,
        fontFamily: '"JetBrains Mono", monospace'
      }}>
        {value || '0'}
      </div>
      <div style={{
        fontSize: 11,
        color: '#a1a1aa',
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5
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
}

export function LargeStatCard({
  label,
  value,
  gradientFrom,
  gradientTo,
  valueColor,
  borderColor,
  subLabel
}: LargeStatCardProps) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
      border: `1px solid ${borderColor}`,
      borderRadius: 10,
      padding: '14px 16px',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: 24,
        fontWeight: 700,
        color: valueColor,
        fontFamily: '"JetBrains Mono", monospace'
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 11,
        color: '#a1a1aa',
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5
      }}>
        {label}
      </div>
      {subLabel && (
        <div style={{ fontSize: 10, color: '#71717a', marginTop: 2 }}>
          {subLabel}
        </div>
      )}
    </div>
  );
}
