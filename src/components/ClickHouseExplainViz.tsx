'use client';

import React, { useState, useMemo } from 'react';

const defaultQuery = `SELECT
    customer_id,
    sum(amount) as total_spent,
    count(*) as order_count
FROM orders
WHERE created_at >= '2024-01-01'
  AND region = 'us_west'
GROUP BY customer_id
HAVING total_spent > 1000
ORDER BY total_spent DESC
LIMIT 100`;

const defaultQueryB = `SELECT
    customer_id,
    sum(amount) as total_spent,
    count(*) as order_count
FROM orders
WHERE created_at >= '2024-01-01'
  AND region = 'us_west'
  AND customer_id > 1000
GROUP BY customer_id
HAVING total_spent > 1000
ORDER BY total_spent DESC
LIMIT 100`;

const defaultExplain = `[
  {
    "Plan": {
      "Node Type": "Limit",
      "Limit": 100,
      "Plans": [
        {
          "Node Type": "Sorting",
          "Sort Key": ["total_spent DESC"],
          "Plans": [
            {
              "Node Type": "Filter",
              "Filter": "total_spent > 1000",
              "Plans": [
                {
                  "Node Type": "Aggregating",
                  "Keys": ["customer_id"],
                  "Aggregates": ["sum(amount)", "count()"],
                  "Plans": [
                    {
                      "Node Type": "Expression",
                      "Description": "Before GROUP BY",
                      "Plans": [
                        {
                          "Node Type": "ReadFromMergeTree",
                          "Description": "default.orders",
                          "Rows Read": 1916928,
                          "Bytes Read": 153754240,
                          "Indexes": [
                            {
                              "Type": "MinMax",
                              "Keys": ["created_at"],
                              "Condition": "(created_at in ['2024-01-01 00:00:00', +inf))",
                              "Initial Parts": 24,
                              "Selected Parts": 12,
                              "Initial Granules": 1847,
                              "Selected Granules": 923
                            },
                            {
                              "Type": "Partition",
                              "Keys": ["toYYYYMM(created_at)"],
                              "Condition": "(toYYYYMM(created_at) in [202401, +inf))",
                              "Initial Parts": 12,
                              "Selected Parts": 8,
                              "Initial Granules": 923,
                              "Selected Granules": 614
                            },
                            {
                              "Type": "PrimaryKey",
                              "Keys": ["region", "customer_id"],
                              "Condition": "(region in ['us_west', 'us_west'])",
                              "Initial Parts": 8,
                              "Selected Parts": 4,
                              "Initial Granules": 614,
                              "Selected Granules": 234,
                              "Search Algorithm": "binary search"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  }
]`;

const NODE_COLORS: Record<string, { bg: string; border: string; icon: string }> = {
  'ReadFromMergeTree': { bg: '#0f766e', border: '#14b8a6', icon: '📖' },
  'ReadFromStorage': { bg: '#0f766e', border: '#14b8a6', icon: '📖' },
  'ReadFromRemote': { bg: '#0891b2', border: '#22d3ee', icon: '🌐' },
  'Aggregating': { bg: '#7c3aed', border: '#a78bfa', icon: '∑' },
  'AggregatingTransform': { bg: '#7c3aed', border: '#a78bfa', icon: '∑' },
  'MergingAggregated': { bg: '#7c3aed', border: '#a78bfa', icon: '∑' },
  'Sorting': { bg: '#c2410c', border: '#fb923c', icon: '↕' },
  'SortingTransform': { bg: '#c2410c', border: '#fb923c', icon: '↕' },
  'MergeSorting': { bg: '#c2410c', border: '#fb923c', icon: '↕' },
  'MergingSorted': { bg: '#c2410c', border: '#fb923c', icon: '↕' },
  'PartialSorting': { bg: '#c2410c', border: '#fb923c', icon: '↕' },
  'Filter': { bg: '#be185d', border: '#f472b6', icon: '⏚' },
  'FilterTransform': { bg: '#be185d', border: '#f472b6', icon: '⏚' },
  'Expression': { bg: '#4338ca', border: '#818cf8', icon: 'ƒ' },
  'ExpressionTransform': { bg: '#4338ca', border: '#818cf8', icon: 'ƒ' },
  'Limit': { bg: '#0369a1', border: '#38bdf8', icon: '⊂' },
  'LimitTransform': { bg: '#0369a1', border: '#38bdf8', icon: '⊂' },
  'Join': { bg: '#a21caf', border: '#e879f9', icon: '⋈' },
  'JoinTransform': { bg: '#a21caf', border: '#e879f9', icon: '⋈' },
  'Union': { bg: '#65a30d', border: '#a3e635', icon: '∪' },
  'UnionTransform': { bg: '#65a30d', border: '#a3e635', icon: '∪' },
  'CreatingSets': { bg: '#059669', border: '#34d399', icon: '{}' },
  'SettingQuotaAndLimits': { bg: '#525252', border: '#737373', icon: '⚙' },
  'default': { bg: '#374151', border: '#6b7280', icon: '○' }
};

const defaultExplainB = `[
  {
    "Plan": {
      "Node Type": "Limit",
      "Limit": 100,
      "Plans": [
        {
          "Node Type": "Sorting",
          "Sort Key": ["total_spent DESC"],
          "Plans": [
            {
              "Node Type": "Filter",
              "Filter": "total_spent > 1000",
              "Plans": [
                {
                  "Node Type": "Aggregating",
                  "Keys": ["customer_id"],
                  "Aggregates": ["sum(amount)", "count()"],
                  "Plans": [
                    {
                      "Node Type": "Expression",
                      "Description": "Before GROUP BY",
                      "Plans": [
                        {
                          "Node Type": "ReadFromMergeTree",
                          "Description": "default.orders",
                          "Rows Read": 729088,
                          "Bytes Read": 58327040,
                          "Indexes": [
                            {
                              "Type": "MinMax",
                              "Keys": ["created_at"],
                              "Condition": "(created_at in ['2024-01-01 00:00:00', +inf))",
                              "Initial Parts": 24,
                              "Selected Parts": 12,
                              "Initial Granules": 1847,
                              "Selected Granules": 923
                            },
                            {
                              "Type": "Partition",
                              "Keys": ["toYYYYMM(created_at)"],
                              "Condition": "(toYYYYMM(created_at) in [202401, +inf))",
                              "Initial Parts": 12,
                              "Selected Parts": 8,
                              "Initial Granules": 923,
                              "Selected Granules": 614
                            },
                            {
                              "Type": "PrimaryKey",
                              "Keys": ["region", "customer_id"],
                              "Condition": "and((region in ['us_west', 'us_west']), (customer_id in [1001, +inf)))",
                              "Initial Parts": 8,
                              "Selected Parts": 2,
                              "Initial Granules": 614,
                              "Selected Granules": 89,
                              "Search Algorithm": "binary search"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  }
]`;

const INDEX_COLORS: Record<string, { bg: string; border: string; badge: string; text: string }> = {
  'MinMax': { bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.4)', badge: '#eab308', text: '#fef08a' },
  'Partition': { bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.4)', badge: '#a855f7', text: '#e9d5ff' },
  'PrimaryKey': { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.4)', badge: '#22c55e', text: '#bbf7d0' },
  'Skip': { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)', badge: '#3b82f6', text: '#bfdbfe' },
};

interface PlanNode {
  'Node Type'?: string;
  Description?: string;
  Plans?: PlanNode[];
  Indexes?: IndexInfo[];
  Projections?: ProjectionInfo[];
  'Rows Read'?: number;
  'Bytes Read'?: number;
  Rows?: number;
  Bytes?: number;
  Parts?: number;
  Granules?: number;
  Marks?: number;
  Limit?: number;
  'Sort Key'?: string[];
  Filter?: string;
  Keys?: string[];
  Aggregates?: string[];
}

interface IndexInfo {
  Type: string;
  Name?: string;
  Keys?: string[];
  Condition?: string;
  Description?: string;
  'Initial Parts'?: number;
  'Selected Parts'?: number;
  'Initial Granules'?: number;
  'Selected Granules'?: number;
  'Search Algorithm'?: string;
  Ranges?: number;
}

interface ProjectionInfo {
  Name: string;
  Description?: string;
  Condition?: string;
  'Selected Parts'?: number;
  'Selected Marks'?: number;
  'Selected Ranges'?: number;
  'Selected Rows'?: number;
  'Filtered Parts'?: number;
}

interface PlanStats {
  totalNodes: number;
  readNodes: number;
  totalInitialParts: number;
  totalSelectedParts: number;
  totalInitialGranules: number;
  totalSelectedGranules: number;
  totalRowsRead: number;
  totalBytesRead: number;
  indexes: IndexInfo[];
  tables: string[];
  projections: ProjectionInfo[];
  nodeTypes: Record<string, number>;
}

function getNodeStyle(nodeType?: string) {
  if (!nodeType) return NODE_COLORS.default;
  for (const [key, style] of Object.entries(NODE_COLORS)) {
    if (nodeType.toLowerCase().includes(key.toLowerCase())) {
      return style;
    }
  }
  return NODE_COLORS.default;
}

function formatNumber(num?: number | null): string | null {
  if (num === undefined || num === null) return null;
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function formatBytes(bytes?: number | null): string | null {
  if (bytes === undefined || bytes === null || bytes === 0) return null;
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let size = bytes;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function extractPlanStats(plan: PlanNode): PlanStats {
  const result: PlanStats = {
    totalNodes: 0,
    readNodes: 0,
    totalInitialParts: 0,
    totalSelectedParts: 0,
    totalInitialGranules: 0,
    totalSelectedGranules: 0,
    totalRowsRead: 0,
    totalBytesRead: 0,
    indexes: [],
    tables: [],
    projections: [],
    nodeTypes: {}
  };

  function traverse(node: PlanNode) {
    if (!node) return;
    result.totalNodes++;
    const nodeType = node['Node Type'];
    if (nodeType) {
      result.nodeTypes[nodeType] = (result.nodeTypes[nodeType] || 0) + 1;
    }

    if (nodeType?.includes('Read')) {
      result.readNodes++;
      if (node.Description) result.tables.push(node.Description);

      if (node['Rows Read']) result.totalRowsRead += node['Rows Read'];
      if (node['Bytes Read']) result.totalBytesRead += node['Bytes Read'];
      if (node['Rows']) result.totalRowsRead += node['Rows'];
      if (node['Bytes']) result.totalBytesRead += node['Bytes'];

      if (node.Indexes && node.Indexes.length > 0) {
        const firstIdx = node.Indexes[0];
        const lastIdx = node.Indexes[node.Indexes.length - 1];

        if (firstIdx['Initial Parts']) result.totalInitialParts += firstIdx['Initial Parts'];
        if (lastIdx['Selected Parts']) result.totalSelectedParts += lastIdx['Selected Parts'];
        if (firstIdx['Initial Granules']) result.totalInitialGranules += firstIdx['Initial Granules'];
        if (lastIdx['Selected Granules']) result.totalSelectedGranules += lastIdx['Selected Granules'];

        node.Indexes.forEach(idx => result.indexes.push(idx));
      }

      if (node.Projections) {
        node.Projections.forEach(proj => result.projections.push(proj));
      }
    }

    if (node.Plans) {
      node.Plans.forEach(traverse);
    }
  }

  traverse(plan);
  return result;
}

function DeltaIndicator({ valueA, valueB, lowerIsBetter = true }: {
  valueA?: number | null;
  valueB?: number | null;
  lowerIsBetter?: boolean;
}) {
  if (valueA === undefined || valueB === undefined || valueA === null || valueB === null) {
    return null;
  }

  const diff = valueB - valueA;
  const pctChange = valueA !== 0 ? ((diff / valueA) * 100) : (valueB !== 0 ? 100 : 0);

  if (diff === 0) {
    return <span style={{ color: '#71717a', fontSize: 11 }}>—</span>;
  }

  const isImproved = lowerIsBetter ? diff < 0 : diff > 0;
  const color = isImproved ? '#22c55e' : '#ef4444';
  const arrow = diff > 0 ? '↑' : '↓';

  const displayDiff = formatNumber(Math.abs(diff));

  return (
    <span style={{
      color,
      fontSize: 11,
      fontFamily: '"JetBrains Mono", monospace',
      fontWeight: 600
    }}>
      {arrow} {displayDiff}
    </span>
  );
}

function FilterRatioBar({ initial, selected, label }: {
  initial?: number;
  selected?: number;
  label: string;
}) {
  if (initial === undefined || selected === undefined) return null;

  const ratio = initial > 0 ? (selected / initial) : 0;
  const percentage = (ratio * 100).toFixed(1);
  const filtered = initial - selected;
  const filteredPct = initial > 0 ? ((filtered / initial) * 100).toFixed(0) : '0';

  const getBarColor = (pct: number) => {
    const filterPct = 100 - pct;
    if (filterPct >= 90) return '#22c55e';
    if (filterPct >= 70) return '#84cc16';
    if (filterPct >= 50) return '#eab308';
    if (filterPct >= 30) return '#f97316';
    return '#ef4444';
  };

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#a1a1aa' }}>{label}</span>
        <span style={{
          fontSize: 12,
          fontFamily: '"JetBrains Mono", monospace',
          color: '#f4f4f5'
        }}>
          {formatNumber(selected)} / {formatNumber(initial)}
          <span style={{
            marginLeft: 6,
            color: getBarColor(parseFloat(percentage)),
            fontWeight: 600
          }}>
            ({percentage}%)
          </span>
        </span>
      </div>
      <div style={{
        height: 6,
        background: 'rgba(0,0,0,0.4)',
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          width: `${Math.min(100, ratio * 100)}%`,
          background: getBarColor(parseFloat(percentage)),
          borderRadius: 3,
          transition: 'width 0.3s ease'
        }} />
      </div>
      {filtered > 0 && (
        <div style={{
          fontSize: 10,
          color: '#22c55e',
          marginTop: 2,
          fontFamily: '"JetBrains Mono", monospace'
        }}>
          ✓ {formatNumber(filtered)} filtered out ({filteredPct}% reduction)
        </div>
      )}
    </div>
  );
}

function IndexCard({ index }: { index: IndexInfo }) {
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

function ProjectionCard({ projection }: { projection: ProjectionInfo }) {
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

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 8,
        marginTop: 10
      }}>
        {[
          { label: 'Parts', value: projection['Selected Parts'] },
          { label: 'Marks', value: projection['Selected Marks'] },
          { label: 'Ranges', value: projection['Selected Ranges'] },
          { label: 'Rows', value: projection['Selected Rows'] },
        ].filter(s => s.value !== undefined).map(stat => (
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

function ComparisonSummary({ statsA, statsB, labelA = "Plan A", labelB = "Plan B" }: {
  statsA: PlanStats;
  statsB: PlanStats;
  labelA?: string;
  labelB?: string;
}) {
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

  const metrics = [
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

function PlanNodeComponent({ node, depth = 0 }: { node: PlanNode; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  const style = getNodeStyle(node['Node Type']);
  const hasChildren = node.Plans && node.Plans.length > 0;

  const stats: { label: string; value: string | null }[] = [];
  if (node['Rows Read']) stats.push({ label: 'Rows Read', value: formatNumber(node['Rows Read']) });
  if (node['Bytes Read']) stats.push({ label: 'Bytes Read', value: formatBytes(node['Bytes Read']) });
  if (node.Rows && !node['Rows Read']) stats.push({ label: 'Rows', value: formatNumber(node.Rows) });
  if (node.Bytes && !node['Bytes Read']) stats.push({ label: 'Bytes', value: formatBytes(node.Bytes) });
  if (node.Parts) stats.push({ label: 'Parts', value: String(node.Parts) });
  if (node.Granules) stats.push({ label: 'Granules', value: formatNumber(node.Granules) });
  if (node.Marks) stats.push({ label: 'Marks', value: String(node.Marks) });
  if (node.Limit) stats.push({ label: 'Limit', value: formatNumber(node.Limit) });

  const hasIndexes = node.Indexes && node.Indexes.length > 0;
  const hasProjections = node.Projections && node.Projections.length > 0;

  return (
    <div style={{ marginLeft: depth === 0 ? 0 : 28 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
        {depth > 0 && (
          <div style={{
            position: 'absolute',
            left: -28,
            top: 0,
            width: 28,
            height: 24,
            borderLeft: '2px solid #3f3f46',
            borderBottom: '2px solid #3f3f46',
            borderBottomLeftRadius: 10
          }} />
        )}

        <div
          onClick={() => hasChildren && setExpanded(!expanded)}
          style={{
            background: `linear-gradient(135deg, ${style.bg} 0%, ${style.bg}dd 100%)`,
            border: `2px solid ${style.border}`,
            borderRadius: 12,
            padding: '12px 16px',
            marginBottom: 8,
            cursor: hasChildren ? 'pointer' : 'default',
            boxShadow: `0 4px 12px ${style.bg}40`,
            transition: 'all 0.2s ease',
            flex: 1,
            minWidth: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>{style.icon}</span>
            <span style={{
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              fontWeight: 600,
              fontSize: 14,
              color: '#f4f4f5'
            }}>
              {node['Node Type']}
            </span>
            {hasChildren && (
              <span style={{
                marginLeft: 'auto',
                color: '#a1a1aa',
                fontSize: 12,
                transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}>
                ▶
              </span>
            )}
          </div>

          {node.Description && (
            <div style={{
              marginTop: 6,
              fontSize: 12,
              color: '#a1a1aa',
              fontStyle: 'italic'
            }}>
              {node.Description}
            </div>
          )}

          {stats.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              marginTop: 10
            }}>
              {stats.map(stat => (
                <div key={stat.label} style={{
                  background: 'rgba(0,0,0,0.25)',
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontFamily: '"JetBrains Mono", monospace'
                }}>
                  <span style={{ color: '#a1a1aa' }}>{stat.label}: </span>
                  <span style={{ color: '#f4f4f5', fontWeight: 600 }}>{stat.value}</span>
                </div>
              ))}
            </div>
          )}

          {node['Sort Key'] && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#d4d4d8' }}>
              <span style={{ color: '#a1a1aa' }}>Sort: </span>
              <code style={{
                background: 'rgba(0,0,0,0.25)',
                padding: '2px 6px',
                borderRadius: 4,
                fontFamily: '"JetBrains Mono", monospace'
              }}>
                {node['Sort Key'].join(', ')}
              </code>
            </div>
          )}

          {node.Filter && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#d4d4d8' }}>
              <span style={{ color: '#a1a1aa' }}>Filter: </span>
              <code style={{
                background: 'rgba(0,0,0,0.25)',
                padding: '2px 6px',
                borderRadius: 4,
                fontFamily: '"JetBrains Mono", monospace'
              }}>
                {node.Filter}
              </code>
            </div>
          )}

          {node.Keys && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#d4d4d8' }}>
              <span style={{ color: '#a1a1aa' }}>Group by: </span>
              <code style={{
                background: 'rgba(0,0,0,0.25)',
                padding: '2px 6px',
                borderRadius: 4,
                fontFamily: '"JetBrains Mono", monospace'
              }}>
                {node.Keys.join(', ')}
              </code>
            </div>
          )}

          {node.Aggregates && (
            <div style={{ marginTop: 6, fontSize: 12, color: '#d4d4d8' }}>
              <span style={{ color: '#a1a1aa' }}>Aggregates: </span>
              <code style={{
                background: 'rgba(0,0,0,0.25)',
                padding: '2px 6px',
                borderRadius: 4,
                fontFamily: '"JetBrains Mono", monospace'
              }}>
                {node.Aggregates.join(', ')}
              </code>
            </div>
          )}

          {hasIndexes && (
            <div style={{ marginTop: 12 }}>
              <div style={{
                fontSize: 11,
                color: '#a1a1aa',
                marginBottom: 4,
                textTransform: 'uppercase',
                letterSpacing: 1,
                fontWeight: 600
              }}>
                Index Usage ({node.Indexes!.length})
              </div>
              {node.Indexes!.map((idx, i) => (
                <IndexCard key={i} index={idx} />
              ))}
            </div>
          )}

          {hasProjections && (
            <div style={{ marginTop: 12 }}>
              <div style={{
                fontSize: 11,
                color: '#a1a1aa',
                marginBottom: 4,
                textTransform: 'uppercase',
                letterSpacing: 1,
                fontWeight: 600
              }}>
                Projections Analyzed ({node.Projections!.length})
              </div>
              {node.Projections!.map((proj, i) => (
                <ProjectionCard key={i} projection={proj} />
              ))}
            </div>
          )}
        </div>
      </div>

      {expanded && hasChildren && (
        <div>
          {node.Plans!.map((child, i) => (
            <PlanNodeComponent
              key={i}
              node={child}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatsOverview({ plan, label, accentColor }: {
  plan: PlanNode;
  label?: string;
  accentColor?: string;
}) {
  const stats = useMemo(() => extractPlanStats(plan), [plan]);

  const partsReduction = stats.totalInitialParts > 0
    ? ((1 - stats.totalSelectedParts / stats.totalInitialParts) * 100).toFixed(0)
    : '0';
  const granulesReduction = stats.totalInitialGranules > 0
    ? ((1 - stats.totalSelectedGranules / stats.totalInitialGranules) * 100).toFixed(0)
    : '0';

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

      {(stats.totalRowsRead > 0 || stats.totalBytesRead > 0) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: stats.totalRowsRead > 0 && stats.totalBytesRead > 0 ? '1fr 1fr' : '1fr',
          gap: 12,
          marginBottom: 16
        }}>
          {stats.totalRowsRead > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(251, 146, 60, 0.05) 100%)',
              border: '1px solid rgba(251, 146, 60, 0.4)',
              borderRadius: 10,
              padding: '14px 16px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: 24,
                fontWeight: 700,
                color: '#fb923c',
                fontFamily: '"JetBrains Mono", monospace'
              }}>
                {formatNumber(stats.totalRowsRead)}
              </div>
              <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Rows Read
              </div>
            </div>
          )}
          {stats.totalBytesRead > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(244, 114, 182, 0.15) 0%, rgba(244, 114, 182, 0.05) 100%)',
              border: '1px solid rgba(244, 114, 182, 0.4)',
              borderRadius: 10,
              padding: '14px 16px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: 24,
                fontWeight: 700,
                color: '#f472b6',
                fontFamily: '"JetBrains Mono", monospace'
              }}>
                {formatBytes(stats.totalBytesRead)}
              </div>
              <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Bytes Read
              </div>
            </div>
          )}
        </div>
      )}

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

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12,
        marginBottom: 16
      }}>
        {[
          { label: 'Pipeline Steps', value: stats.totalNodes, color: baseColor },
          { label: 'Tables Scanned', value: stats.tables.length, color: '#14b8a6' },
          { label: 'Indexes Used', value: stats.indexes.length, color: '#22c55e' },
          { label: 'Projections', value: stats.projections.length, color: '#ec4899' }
        ].map(stat => (
          <div key={stat.label} style={{
            background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}08 100%)`,
            border: `1px solid ${stat.color}40`,
            borderRadius: 10,
            padding: '14px 16px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: 24,
              fontWeight: 700,
              color: stat.color,
              fontFamily: '"JetBrains Mono", monospace'
            }}>
              {stat.value || '0'}
            </div>
            <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

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
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#d4d4d8', fontSize: 13 }}>Parts</span>
                  <span style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 13,
                    color: '#f4f4f5'
                  }}>
                    {stats.totalSelectedParts} / {stats.totalInitialParts}
                    <span style={{
                      marginLeft: 8,
                      color: parseInt(partsReduction) >= 50 ? '#22c55e' : '#eab308',
                      fontWeight: 600
                    }}>
                      (-{partsReduction}%)
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
                    width: `${(stats.totalSelectedParts / stats.totalInitialParts) * 100}%`,
                    background: accentColor || (parseInt(partsReduction) >= 50 ? '#22c55e' : '#eab308'),
                    borderRadius: 4
                  }} />
                </div>
              </div>
            )}

            {stats.totalInitialGranules > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#d4d4d8', fontSize: 13 }}>Granules</span>
                  <span style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 13,
                    color: '#f4f4f5'
                  }}>
                    {formatNumber(stats.totalSelectedGranules)} / {formatNumber(stats.totalInitialGranules)}
                    <span style={{
                      marginLeft: 8,
                      color: parseInt(granulesReduction) >= 50 ? '#22c55e' : '#eab308',
                      fontWeight: 600
                    }}>
                      (-{granulesReduction}%)
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
                    width: `${(stats.totalSelectedGranules / stats.totalInitialGranules) * 100}%`,
                    background: accentColor || (parseInt(granulesReduction) >= 50 ? '#22c55e' : '#eab308'),
                    borderRadius: 4
                  }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClickHouseExplainViz() {
  const [mode, setMode] = useState<'single' | 'compare'>('single');
  const [query, setQuery] = useState(defaultQuery);
  const [explainJson, setExplainJson] = useState(defaultExplain);
  const [queryB, setQueryB] = useState(defaultQueryB);
  const [explainJsonB, setExplainJsonB] = useState(defaultExplainB);
  const [parsedPlan, setParsedPlan] = useState<PlanNode | null>(null);
  const [parsedPlanB, setParsedPlanB] = useState<PlanNode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorB, setErrorB] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'viz'>('input');
  const [labelA, setLabelA] = useState('Plan A');
  const [labelB, setLabelB] = useState('Plan B');

  const parseExplain = () => {
    let planA: PlanNode | null = null;
    let planB: PlanNode | null = null;
    let errA: string | null = null;
    let errB: string | null = null;

    try {
      const parsed = JSON.parse(explainJson);
      if (Array.isArray(parsed)) {
        planA = parsed[0]?.Plan || (parsed[0]?.['Node Type'] ? parsed[0] : parsed);
      } else {
        planA = parsed.Plan || (parsed['Node Type'] ? parsed : parsed);
      }
    } catch (e) {
      errA = `Plan A: ${(e as Error).message}`;
    }

    if (mode === 'compare') {
      try {
        const parsed = JSON.parse(explainJsonB);
        if (Array.isArray(parsed)) {
          planB = parsed[0]?.Plan || (parsed[0]?.['Node Type'] ? parsed[0] : parsed);
        } else {
          planB = parsed.Plan || (parsed['Node Type'] ? parsed : parsed);
        }
      } catch (e) {
        errB = `Plan B: ${(e as Error).message}`;
      }
    }

    setParsedPlan(planA);
    setParsedPlanB(planB);
    setError(errA);
    setErrorB(errB);

    if ((mode === 'single' && planA && !errA) || (mode === 'compare' && planA && planB && !errA && !errB)) {
      setActiveTab('viz');
    }
  };

  const statsA = useMemo(() => parsedPlan ? extractPlanStats(parsedPlan) : null, [parsedPlan]);
  const statsB = useMemo(() => parsedPlanB ? extractPlanStats(parsedPlanB) : null, [parsedPlanB]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #09090b 0%, #18181b 50%, #09090b 100%)',
      color: '#f4f4f5',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; }

        textarea {
          font-family: "JetBrains Mono", "Fira Code", monospace;
          font-size: 13px;
          line-height: 1.6;
        }

        textarea:focus {
          outline: none;
          border-color: #facc15 !important;
          box-shadow: 0 0 0 3px rgba(250, 204, 21, 0.15);
        }

        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #27272a; border-radius: 4px; }
        ::-webkit-scrollbar-thumb { background: #52525b; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #71717a; }
      `}</style>

      <header style={{
        padding: '24px 32px',
        borderBottom: '1px solid #27272a',
        background: 'rgba(9, 9, 11, 0.8)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 42,
              height: 42,
              background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              boxShadow: '0 4px 16px rgba(250, 204, 21, 0.25)'
            }}>
              ⚡
            </div>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                background: 'linear-gradient(90deg, #facc15, #f59e0b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                ClickHouse EXPLAIN Visualizer
              </h1>
              <p style={{ margin: 0, fontSize: 12, color: '#71717a' }}>
                {mode === 'compare' ? 'Compare two query plans' : 'Visualize query execution plans'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              background: '#27272a',
              borderRadius: 8,
              padding: 3,
              marginRight: 8
            }}>
              <button
                onClick={() => { setMode('single'); setActiveTab('input'); }}
                style={{
                  padding: '6px 12px',
                  background: mode === 'single' ? '#3f3f46' : 'transparent',
                  color: mode === 'single' ? '#f4f4f5' : '#71717a',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                  transition: 'all 0.2s ease'
                }}
              >
                Single
              </button>
              <button
                onClick={() => { setMode('compare'); setActiveTab('input'); }}
                style={{
                  padding: '6px 12px',
                  background: mode === 'compare' ? '#3f3f46' : 'transparent',
                  color: mode === 'compare' ? '#f4f4f5' : '#71717a',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                  transition: 'all 0.2s ease'
                }}
              >
                Compare
              </button>
            </div>

            <button
              onClick={() => setActiveTab('input')}
              style={{
                padding: '8px 16px',
                background: activeTab === 'input' ? '#facc15' : 'transparent',
                color: activeTab === 'input' ? '#09090b' : '#a1a1aa',
                border: '1px solid',
                borderColor: activeTab === 'input' ? '#facc15' : '#3f3f46',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
                transition: 'all 0.2s ease'
              }}
            >
              Input
            </button>
            <button
              onClick={() => setActiveTab('viz')}
              disabled={!parsedPlan || (mode === 'compare' && !parsedPlanB)}
              style={{
                padding: '8px 16px',
                background: activeTab === 'viz' ? '#facc15' : 'transparent',
                color: activeTab === 'viz' ? '#09090b' : '#a1a1aa',
                border: '1px solid',
                borderColor: activeTab === 'viz' ? '#facc15' : '#3f3f46',
                borderRadius: 8,
                cursor: (parsedPlan && (mode === 'single' || parsedPlanB)) ? 'pointer' : 'not-allowed',
                fontWeight: 600,
                fontSize: 13,
                opacity: (parsedPlan && (mode === 'single' || parsedPlanB)) ? 1 : 0.5,
                transition: 'all 0.2s ease'
              }}
            >
              {mode === 'compare' ? 'Comparison' : 'Visualization'}
            </button>
          </div>
        </div>
      </header>

      <main style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
        {activeTab === 'input' && mode === 'single' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: 10,
                fontSize: 13,
                fontWeight: 600,
                color: '#a1a1aa',
                textTransform: 'uppercase',
                letterSpacing: 1
              }}>
                SQL Query <span style={{ color: '#52525b', fontWeight: 400, textTransform: 'none' }}>(optional)</span>
              </label>
              <textarea
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Paste your SQL query here..."
                style={{
                  width: '100%',
                  height: 320,
                  background: '#18181b',
                  border: '2px solid #27272a',
                  borderRadius: 12,
                  padding: 16,
                  color: '#f4f4f5',
                  resize: 'vertical',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: 10,
                fontSize: 13,
                fontWeight: 600,
                color: '#a1a1aa',
                textTransform: 'uppercase',
                letterSpacing: 1
              }}>
                EXPLAIN Output <span style={{ color: '#f59e0b', fontWeight: 400, textTransform: 'none' }}>(JSON)</span>
              </label>
              <textarea
                value={explainJson}
                onChange={e => setExplainJson(e.target.value)}
                placeholder="Paste EXPLAIN json=1, indexes=1 output..."
                style={{
                  width: '100%',
                  height: 320,
                  background: '#18181b',
                  border: '2px solid #27272a',
                  borderRadius: 12,
                  padding: 16,
                  color: '#f4f4f5',
                  resize: 'vertical',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              {error && (
                <div style={{
                  background: 'rgba(220, 38, 38, 0.15)',
                  border: '1px solid rgba(220, 38, 38, 0.4)',
                  borderRadius: 8,
                  padding: '12px 16px',
                  marginBottom: 16,
                  color: '#fca5a5',
                  fontSize: 13,
                  fontFamily: '"JetBrains Mono", monospace'
                }}>
                  ⚠️ {error}
                </div>
              )}

              <button
                onClick={parseExplain}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
                  color: '#09090b',
                  border: 'none',
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 15,
                  boxShadow: '0 4px 20px rgba(250, 204, 21, 0.3)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(250, 204, 21, 0.4)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(250, 204, 21, 0.3)';
                }}
              >
                Visualize Query Plan →
              </button>

              <div style={{ marginTop: 20, padding: '16px 20px', background: '#18181b', borderRadius: 10, border: '1px solid #27272a' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                  How to get EXPLAIN JSON output
                </div>
                <code style={{
                  display: 'block',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 13,
                  color: '#facc15',
                  background: '#09090b',
                  padding: 12,
                  borderRadius: 6,
                  overflowX: 'auto'
                }}>
                  EXPLAIN json=1, indexes=1, actions=1, projections=1 SELECT ...
                </code>
                <div style={{ marginTop: 12, fontSize: 12, color: '#71717a' }}>
                  <strong style={{ color: '#a1a1aa' }}>Options:</strong> json=1 (required), indexes=1 (shows index filtering),
                  projections=1 (shows projection analysis), actions=1 (detailed step info)
                </div>
                <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #27272a' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#fb923c', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                    💡 Add rows/bytes for detailed comparison
                  </div>
                  <div style={{ fontSize: 11, color: '#71717a', lineHeight: 1.5 }}>
                    Add <code style={{ color: '#a1a1aa', background: '#27272a', padding: '1px 4px', borderRadius: 3 }}>&quot;Rows Read&quot;</code> and{' '}
                    <code style={{ color: '#a1a1aa', background: '#27272a', padding: '1px 4px', borderRadius: 3 }}>&quot;Bytes Read&quot;</code> fields
                    to ReadFromMergeTree nodes from <code style={{ color: '#a1a1aa', background: '#27272a', padding: '1px 4px', borderRadius: 3 }}>system.query_log</code> after
                    running your query, or use <code style={{ color: '#a1a1aa', background: '#27272a', padding: '1px 4px', borderRadius: 3 }}>EXPLAIN ESTIMATE</code> for row estimates.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'input' && mode === 'compare' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, color: '#71717a', display: 'block', marginBottom: 4 }}>Plan A Label</label>
                <input
                  type="text"
                  value={labelA}
                  onChange={e => setLabelA(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#27272a',
                    border: '1px solid #3f3f46',
                    borderRadius: 6,
                    padding: '8px 12px',
                    color: '#3b82f6',
                    fontSize: 13,
                    fontWeight: 600
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#71717a', display: 'block', marginBottom: 4 }}>Plan B Label</label>
                <input
                  type="text"
                  value={labelB}
                  onChange={e => setLabelB(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#27272a',
                    border: '1px solid #3f3f46',
                    borderRadius: 6,
                    padding: '8px 12px',
                    color: '#a855f7',
                    fontSize: 13,
                    fontWeight: 600
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div style={{
                background: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: 12,
                padding: 16
              }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#3b82f6',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <span style={{ width: 12, height: 12, background: '#3b82f6', borderRadius: 3 }} />
                  {labelA}
                </div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 11, color: '#71717a', textTransform: 'uppercase' }}>
                  SQL Query (optional)
                </label>
                <textarea
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Paste SQL query..."
                  style={{
                    width: '100%',
                    height: 120,
                    background: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: 8,
                    padding: 12,
                    color: '#f4f4f5',
                    resize: 'vertical',
                    fontSize: 12
                  }}
                />
                <label style={{ display: 'block', marginTop: 12, marginBottom: 8, fontSize: 11, color: '#71717a', textTransform: 'uppercase' }}>
                  EXPLAIN JSON
                </label>
                <textarea
                  value={explainJson}
                  onChange={e => setExplainJson(e.target.value)}
                  placeholder="Paste EXPLAIN json=1, indexes=1 output..."
                  style={{
                    width: '100%',
                    height: 200,
                    background: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: 8,
                    padding: 12,
                    color: '#f4f4f5',
                    resize: 'vertical',
                    fontSize: 12
                  }}
                />
                {error && (
                  <div style={{
                    marginTop: 8,
                    padding: '8px 12px',
                    background: 'rgba(220, 38, 38, 0.15)',
                    border: '1px solid rgba(220, 38, 38, 0.3)',
                    borderRadius: 6,
                    color: '#fca5a5',
                    fontSize: 11
                  }}>
                    ⚠️ {error}
                  </div>
                )}
              </div>

              <div style={{
                background: 'rgba(168, 85, 247, 0.05)',
                border: '1px solid rgba(168, 85, 247, 0.2)',
                borderRadius: 12,
                padding: 16
              }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#a855f7',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <span style={{ width: 12, height: 12, background: '#a855f7', borderRadius: 3 }} />
                  {labelB}
                </div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 11, color: '#71717a', textTransform: 'uppercase' }}>
                  SQL Query (optional)
                </label>
                <textarea
                  value={queryB}
                  onChange={e => setQueryB(e.target.value)}
                  placeholder="Paste SQL query..."
                  style={{
                    width: '100%',
                    height: 120,
                    background: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: 8,
                    padding: 12,
                    color: '#f4f4f5',
                    resize: 'vertical',
                    fontSize: 12
                  }}
                />
                <label style={{ display: 'block', marginTop: 12, marginBottom: 8, fontSize: 11, color: '#71717a', textTransform: 'uppercase' }}>
                  EXPLAIN JSON
                </label>
                <textarea
                  value={explainJsonB}
                  onChange={e => setExplainJsonB(e.target.value)}
                  placeholder="Paste EXPLAIN json=1, indexes=1 output..."
                  style={{
                    width: '100%',
                    height: 200,
                    background: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: 8,
                    padding: 12,
                    color: '#f4f4f5',
                    resize: 'vertical',
                    fontSize: 12
                  }}
                />
                {errorB && (
                  <div style={{
                    marginTop: 8,
                    padding: '8px 12px',
                    background: 'rgba(220, 38, 38, 0.15)',
                    border: '1px solid rgba(220, 38, 38, 0.3)',
                    borderRadius: 6,
                    color: '#fca5a5',
                    fontSize: 11
                  }}>
                    ⚠️ {errorB}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={parseExplain}
              style={{
                width: '100%',
                marginTop: 20,
                padding: '14px 24px',
                background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
                color: '#09090b',
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 15,
                boxShadow: '0 4px 20px rgba(250, 204, 21, 0.3)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(250, 204, 21, 0.4)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(250, 204, 21, 0.3)';
              }}
            >
              Compare Plans →
            </button>
          </div>
        )}

        {activeTab === 'viz' && parsedPlan && mode === 'single' && (
          <div>
            <StatsOverview plan={parsedPlan} />

            {query && (
              <div style={{
                background: '#18181b',
                border: '1px solid #27272a',
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
                maxHeight: 140,
                overflow: 'auto'
              }}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#71717a',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: 1
                }}>
                  Original Query
                </div>
                <pre style={{
                  margin: 0,
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 12,
                  color: '#a1a1aa',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {query}
                </pre>
              </div>
            )}

            <div style={{
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: 16,
              padding: 24
            }}>
              <div style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#71717a',
                marginBottom: 20,
                textTransform: 'uppercase',
                letterSpacing: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span style={{
                  width: 8,
                  height: 8,
                  background: '#22c55e',
                  borderRadius: '50%',
                  boxShadow: '0 0 8px #22c55e'
                }} />
                Execution Pipeline
              </div>
              <PlanNodeComponent node={parsedPlan} />
            </div>

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
              <span style={{ fontSize: 11, color: '#71717a', marginRight: 6, alignSelf: 'center', fontWeight: 600 }}>LEGEND:</span>
              {[
                { name: 'MinMax', ...INDEX_COLORS.MinMax },
                { name: 'Partition', ...INDEX_COLORS.Partition },
                { name: 'PrimaryKey', ...INDEX_COLORS.PrimaryKey },
                { name: 'Skip', ...INDEX_COLORS.Skip },
              ].map(idx => (
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
          </div>
        )}

        {activeTab === 'viz' && parsedPlan && parsedPlanB && mode === 'compare' && statsA && statsB && (
          <div>
            <ComparisonSummary statsA={statsA} statsB={statsB} labelA={labelA} labelB={labelB} />

            {(query || queryB) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                {query && (
                  <div style={{
                    background: 'rgba(59, 130, 246, 0.05)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: 12,
                    padding: 14,
                    maxHeight: 120,
                    overflow: 'auto'
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#3b82f6', marginBottom: 6 }}>
                      {labelA} Query
                    </div>
                    <pre style={{
                      margin: 0,
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 11,
                      color: '#a1a1aa',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {query}
                    </pre>
                  </div>
                )}
                {queryB && (
                  <div style={{
                    background: 'rgba(168, 85, 247, 0.05)',
                    border: '1px solid rgba(168, 85, 247, 0.2)',
                    borderRadius: 12,
                    padding: 14,
                    maxHeight: 120,
                    overflow: 'auto'
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#a855f7', marginBottom: 6 }}>
                      {labelB} Query
                    </div>
                    <pre style={{
                      margin: 0,
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 11,
                      color: '#a1a1aa',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {queryB}
                    </pre>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <StatsOverview plan={parsedPlan} label={labelA} accentColor="#3b82f6" />
                <div style={{
                  background: '#18181b',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: 16,
                  padding: 20
                }}>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#3b82f6',
                    marginBottom: 16,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <span style={{ width: 8, height: 8, background: '#3b82f6', borderRadius: '50%' }} />
                    {labelA} Pipeline
                  </div>
                  <PlanNodeComponent node={parsedPlan} />
                </div>
              </div>

              <div>
                <StatsOverview plan={parsedPlanB} label={labelB} accentColor="#a855f7" />
                <div style={{
                  background: '#18181b',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: 16,
                  padding: 20
                }}>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#a855f7',
                    marginBottom: 16,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <span style={{ width: 8, height: 8, background: '#a855f7', borderRadius: '50%' }} />
                    {labelB} Pipeline
                  </div>
                  <PlanNodeComponent node={parsedPlanB} />
                </div>
              </div>
            </div>

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
              <span style={{ fontSize: 11, color: '#71717a', marginRight: 6, alignSelf: 'center', fontWeight: 600 }}>LEGEND:</span>
              {[
                { name: 'MinMax', ...INDEX_COLORS.MinMax },
                { name: 'Partition', ...INDEX_COLORS.Partition },
                { name: 'PrimaryKey', ...INDEX_COLORS.PrimaryKey },
                { name: 'Skip', ...INDEX_COLORS.Skip },
              ].map(idx => (
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
          </div>
        )}
      </main>
    </div>
  );
}
