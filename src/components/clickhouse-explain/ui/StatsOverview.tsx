import React, { useMemo } from 'react';
import type { PlanNode } from '../types';
import { extractPlanStats, formatNumber, formatBytes, calculateReductionPercentage } from '../utils';
import { StatCard, LargeStatCard } from './StatCard';
import { ProgressBar } from './ProgressBar';

interface StatsOverviewProps {
  plan: PlanNode;
  label?: string;
  accentColor?: string;
}

export function StatsOverview({ plan, label, accentColor }: StatsOverviewProps) {
  const stats = useMemo(() => extractPlanStats(plan), [plan]);

  const partsReduction = calculateReductionPercentage(
    stats.totalInitialParts,
    stats.totalSelectedParts
  );
  const granulesReduction = calculateReductionPercentage(
    stats.totalInitialGranules,
    stats.totalSelectedGranules
  );

  const baseColor = accentColor || '#8b5cf6';

  return (
    <div style={{ marginBottom: 24 }}>
      {label && (
        <div style={{
          fontSize: 13,
          fontWeight: 700,
          color: accentColor || '#f4f4f5',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <span style={{
            width: 12,
            height: 12,
            background: accentColor,
            borderRadius: 3
          }} />
          {label}
        </div>
      )}

      {/* Large stats for rows/bytes read */}
      {(stats.totalRowsRead > 0 || stats.totalBytesRead > 0) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: stats.totalRowsRead > 0 && stats.totalBytesRead > 0 ? '1fr 1fr' : '1fr',
          gap: 12,
          marginBottom: 16
        }}>
          {stats.totalRowsRead > 0 && (
            <LargeStatCard
              label="Rows Read"
              value={formatNumber(stats.totalRowsRead) || '0'}
              gradientFrom="rgba(251, 146, 60, 0.15)"
              gradientTo="rgba(251, 146, 60, 0.05)"
              valueColor="#fb923c"
              borderColor="rgba(251, 146, 60, 0.4)"
            />
          )}
          {stats.totalBytesRead > 0 && (
            <LargeStatCard
              label="Bytes Read"
              value={formatBytes(stats.totalBytesRead) || '0'}
              gradientFrom="rgba(244, 114, 182, 0.15)"
              gradientTo="rgba(244, 114, 182, 0.05)"
              valueColor="#f472b6"
              borderColor="rgba(244, 114, 182, 0.4)"
            />
          )}
        </div>
      )}

      {/* Estimated rows from granules */}
      {stats.totalRowsRead === 0 && stats.totalSelectedGranules > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.08) 0%, rgba(251, 146, 60, 0.02) 100%)',
          border: '1px dashed rgba(251, 146, 60, 0.3)',
          borderRadius: 10,
          padding: '12px 16px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: 11, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Estimated Rows (from granules)
            </div>
            <div style={{ fontSize: 10, color: '#71717a', marginTop: 2 }}>
              ~8,192 rows per granule
            </div>
          </div>
          <div style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#fb923c',
            fontFamily: '"JetBrains Mono", monospace'
          }}>
            ~{formatNumber(stats.totalSelectedGranules * 8192)}
          </div>
        </div>
      )}

      {/* Quick stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12,
        marginBottom: 16
      }}>
        <StatCard label="Pipeline Steps" value={stats.totalNodes} color={baseColor} />
        <StatCard label="Tables Scanned" value={stats.tables.length} color="#14b8a6" />
        <StatCard label="Indexes Used" value={stats.indexes.length} color="#22c55e" />
        <StatCard label="Projections" value={stats.projections.length} color="#ec4899" />
      </div>

      {/* Index filtering efficiency */}
      {(stats.totalInitialParts > 0 || stats.totalInitialGranules > 0) && (
        <div style={{
          background: '#18181b',
          border: '1px solid #27272a',
          borderRadius: 12,
          padding: 16
        }}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#a1a1aa',
            marginBottom: 12,
            textTransform: 'uppercase',
            letterSpacing: 1
          }}>
            Overall Index Filtering Efficiency
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {stats.totalInitialParts > 0 && (
              <ProgressBar
                label="Parts"
                selected={stats.totalSelectedParts}
                initial={stats.totalInitialParts}
                reductionPct={partsReduction}
                accentColor={accentColor}
              />
            )}

            {stats.totalInitialGranules > 0 && (
              <ProgressBar
                label="Granules"
                selected={stats.totalSelectedGranules}
                initial={stats.totalInitialGranules}
                reductionPct={granulesReduction}
                accentColor={accentColor}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
