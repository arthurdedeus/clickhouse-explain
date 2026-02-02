import React from 'react';

interface QueryPreviewProps {
  query: string;
  label?: string;
  accentColor?: string;
}

export function QueryPreview({ query, label, accentColor }: QueryPreviewProps) {
  if (!query) return null;

  return (
    <div style={{
      background: accentColor
        ? `${accentColor}0d`
        : '#18181b',
      border: `1px solid ${accentColor ? `${accentColor}33` : '#27272a'}`,
      borderRadius: 12,
      padding: label ? 14 : 16,
      maxHeight: label ? 120 : 140,
      overflow: 'auto'
    }}>
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        color: accentColor || '#71717a',
        marginBottom: label ? 6 : 8,
        textTransform: 'uppercase',
        letterSpacing: 1
      }}>
        {label || 'Original Query'}
      </div>
      <pre style={{
        margin: 0,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: label ? 11 : 12,
        color: '#a1a1aa',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }}>
        {query}
      </pre>
    </div>
  );
}

interface CompareQueriesPreviewProps {
  queryA: string;
  queryB: string;
  labelA: string;
  labelB: string;
}

export function CompareQueriesPreview({
  queryA,
  queryB,
  labelA,
  labelB
}: CompareQueriesPreviewProps) {
  if (!queryA && !queryB) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
      {queryA && (
        <QueryPreview
          query={queryA}
          label={`${labelA} Query`}
          accentColor="#3b82f6"
        />
      )}
      {queryB && (
        <QueryPreview
          query={queryB}
          label={`${labelB} Query`}
          accentColor="#a855f7"
        />
      )}
    </div>
  );
}
