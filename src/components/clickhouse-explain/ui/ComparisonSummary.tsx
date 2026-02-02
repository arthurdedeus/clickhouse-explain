import React from 'react';
import type { PlanStats } from '../types';
import { formatNumber, formatBytes } from '../utils';
import { DeltaIndicator } from './DeltaIndicator';

interface ComparisonSummaryProps {
  statsA: PlanStats;
  statsB: PlanStats;
  labelA?: string;
  labelB?: string;
}

interface MetricRow {
  label: string;
  valueA: number;
  valueB: number;
  lowerIsBetter: boolean;
  formatFn?: (v: number) => string | null;
  suffix?: string;
  hide?: boolean;
}

export function ComparisonSummary({
  statsA,
  statsB,
  labelA = "Plan A",
  labelB = "Plan B"
}: ComparisonSummaryProps) {
  const partsReductionA = statsA.totalInitialParts > 0
    ? ((1 - statsA.totalSelectedParts / statsA.totalInitialParts) * 100).toFixed(1)
    : '0';
  const partsReductionB = statsB.totalInitialParts > 0
    ? ((1 - statsB.totalSelectedParts / statsB.totalInitialParts) * 100).toFixed(1)
    : '0';
  const granulesReductionA = statsA.totalInitialGranules > 0
    ? ((1 - statsA.totalSelectedGranules / statsA.totalInitialGranules) * 100).toFixed(1)
    : '0';
  const granulesReductionB = statsB.totalInitialGranules > 0
    ? ((1 - statsB.totalSelectedGranules / statsB.totalInitialGranules) * 100).toFixed(1)
    : '0';

  const estimatedRowsA = statsA.totalRowsRead || (statsA.totalSelectedGranules * 8192);
  const estimatedRowsB = statsB.totalRowsRead || (statsB.totalSelectedGranules * 8192);
  const hasExplicitRows = statsA.totalRowsRead > 0 || statsB.totalRowsRead > 0;

  const metrics: MetricRow[] = [
    {
      label: hasExplicitRows ? 'Rows Read' : 'Est. Rows (~8K/granule)',
      valueA: estimatedRowsA,
      valueB: estimatedRowsB,
      lowerIsBetter: true,
      hide: estimatedRowsA === 0 && estimatedRowsB === 0
    },
    {
      label: 'Bytes Read',
      valueA: statsA.totalBytesRead,
      valueB: statsB.totalBytesRead,
      lowerIsBetter: true,
      formatFn: formatBytes,
      hide: !statsA.totalBytesRead && !statsB.totalBytesRead
    },
    {
      label: 'Selected Parts',
      valueA: statsA.totalSelectedParts,
      valueB: statsB.totalSelectedParts,
      lowerIsBetter: true
    },
    {
      label: 'Selected Granules',
      valueA: statsA.totalSelectedGranules,
      valueB: statsB.totalSelectedGranules,
      lowerIsBetter: true
    },
    {
      label: 'Parts Filtered %',
      valueA: parseFloat(partsReductionA),
      valueB: parseFloat(partsReductionB),
      lowerIsBetter: false,
      suffix: '%'
    },
    {
      label: 'Granules Filtered %',
      valueA: parseFloat(granulesReductionA),
      valueB: parseFloat(granulesReductionB),
      lowerIsBetter: false,
      suffix: '%'
    },
    {
      label: 'Indexes Used',
      valueA: statsA.indexes.length,
      valueB: statsB.indexes.length,
      lowerIsBetter: false
    },
    {
      label: 'Pipeline Steps',
      valueA: statsA.totalNodes,
      valueB: statsB.totalNodes,
      lowerIsBetter: true
    },
  ].filter(m => !m.hide);

  // Determine winner
  let scoreA = 0, scoreB = 0;
  if (estimatedRowsA < estimatedRowsB) scoreA++;
  else if (estimatedRowsB < estimatedRowsA) scoreB++;
  if (statsA.totalBytesRead && statsB.totalBytesRead) {
    if (statsA.totalBytesRead < statsB.totalBytesRead) scoreA++;
    else if (statsB.totalBytesRead < statsA.totalBytesRead) scoreB++;
  }
  if (statsA.totalSelectedGranules < statsB.totalSelectedGranules) scoreA++;
  else if (statsB.totalSelectedGranules < statsA.totalSelectedGranules) scoreB++;
  if (statsA.totalSelectedParts < statsB.totalSelectedParts) scoreA++;
  else if (statsB.totalSelectedParts < statsA.totalSelectedParts) scoreB++;

  const winner = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : null;

  return (
    <div style={{
      background: '#18181b',
      border: '1px solid #27272a',
      borderRadius: 12,
      padding: 20,
      marginBottom: 24
    }}>
      <div style={{
        fontSize: 12,
        fontWeight: 600,
        color: '#a1a1aa',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <span>📊</span>
        Comparison Summary
        {winner && (
          <span style={{
            marginLeft: 'auto',
            background: winner === 'A' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(168, 85, 247, 0.2)',
            border: `1px solid ${winner === 'A' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(168, 85, 247, 0.4)'}`,
            color: winner === 'A' ? '#60a5fa' : '#c084fc',
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 700
          }}>
            {winner === 'A' ? labelA : labelB} reads less data
          </span>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 100px 100px 80px',
        gap: 8,
        fontSize: 12
      }}>
        <div style={{ color: '#71717a', fontWeight: 600, paddingBottom: 8, borderBottom: '1px solid #27272a' }}>Metric</div>
        <div style={{ color: '#3b82f6', fontWeight: 600, textAlign: 'right', paddingBottom: 8, borderBottom: '1px solid #27272a' }}>{labelA}</div>
        <div style={{ color: '#a855f7', fontWeight: 600, textAlign: 'right', paddingBottom: 8, borderBottom: '1px solid #27272a' }}>{labelB}</div>
        <div style={{ color: '#71717a', fontWeight: 600, textAlign: 'right', paddingBottom: 8, borderBottom: '1px solid #27272a' }}>Delta</div>

        {metrics.map(m => {
          const formatVal = m.formatFn || ((v: number) => `${formatNumber(v)}${m.suffix || ''}`);
          return (
            <React.Fragment key={m.label}>
              <div style={{ color: '#d4d4d8', padding: '8px 0' }}>{m.label}</div>
              <div style={{
                color: '#f4f4f5',
                textAlign: 'right',
                padding: '8px 0',
                fontFamily: '"JetBrains Mono", monospace'
              }}>
                {m.valueA !== undefined && m.valueA !== 0 ? formatVal(m.valueA) : '—'}
              </div>
              <div style={{
                color: '#f4f4f5',
                textAlign: 'right',
                padding: '8px 0',
                fontFamily: '"JetBrains Mono", monospace'
              }}>
                {m.valueB !== undefined && m.valueB !== 0 ? formatVal(m.valueB) : '—'}
              </div>
              <div style={{ textAlign: 'right', padding: '8px 0' }}>
                <DeltaIndicator valueA={m.valueA} valueB={m.valueB} lowerIsBetter={m.lowerIsBetter} />
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
