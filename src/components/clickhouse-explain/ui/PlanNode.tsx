'use client';

import React, { useState, useMemo } from 'react';
import type { PlanNode as PlanNodeType } from '../types';
import { getNodeStyle, formatNumber, formatBytes, getMaxDepth } from '../utils';
import { IndexCard } from './IndexCard';
import { ProjectionCard } from './ProjectionCard';

interface PlanNodeProps {
  node: PlanNodeType;
  depth?: number;
  maxDepth?: number;
  isCompareMode?: boolean;
}

interface NodeStatBadgeProps {
  label: string;
  value: string | null;
}

function NodeStatBadge({ label, value }: NodeStatBadgeProps) {
  if (!value) return null;
  return (
    <div style={{
      background: 'rgba(0,0,0,0.25)',
      padding: '4px 8px',
      borderRadius: 4,
      fontSize: 11,
      fontFamily: '"JetBrains Mono", monospace'
    }}>
      <span style={{ color: '#a1a1aa' }}>{label}: </span>
      <span style={{ color: '#f4f4f5', fontWeight: 600 }}>{value}</span>
    </div>
  );
}

interface CodeBlockProps {
  label: string;
  value: string | string[];
}

function CodeBlock({ label, value }: CodeBlockProps) {
  const displayValue = Array.isArray(value) ? value.join(', ') : value;
  return (
    <div style={{ marginTop: 8, fontSize: 12, color: '#d4d4d8', overflow: 'hidden' }}>
      <span style={{ color: '#a1a1aa' }}>{label}: </span>
      <code style={{
        background: 'rgba(0,0,0,0.25)',
        padding: '2px 6px',
        borderRadius: 4,
        fontFamily: '"JetBrains Mono", monospace',
        wordBreak: 'break-word'
      }}>
        {displayValue}
      </code>
    </div>
  );
}

// Calculate indent based on depth and max depth
// Use smaller indents for deeper trees or compare mode
function calculateIndent(depth: number, maxDepth: number, isCompareMode: boolean): number {
  if (depth === 0) return 0;

  // Base indent that scales down based on tree complexity
  const baseIndent = isCompareMode ? 16 : 24;

  // For very deep trees, reduce indent further
  if (maxDepth > 8) {
    return Math.max(8, baseIndent - Math.floor(maxDepth / 3) * 2);
  }
  if (maxDepth > 5) {
    return Math.max(12, baseIndent - 4);
  }

  return baseIndent;
}

export function PlanNodeComponent({
  node,
  depth = 0,
  maxDepth: providedMaxDepth,
  isCompareMode = false
}: PlanNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const style = getNodeStyle(node['Node Type']);
  const hasChildren = node.Plans && node.Plans.length > 0;

  // Calculate max depth only at root level
  const maxDepth = useMemo(() => {
    if (providedMaxDepth !== undefined) return providedMaxDepth;
    return getMaxDepth(node);
  }, [node, providedMaxDepth]);

  const indent = calculateIndent(depth, maxDepth, isCompareMode);

  // Collect stats to display
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
    <div style={{ marginLeft: indent, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', minWidth: 0 }}>
        {/* Tree connector line */}
        {depth > 0 && (
          <div style={{
            position: 'absolute',
            left: -indent,
            top: 0,
            width: indent,
            height: 24,
            borderLeft: '2px solid #3f3f46',
            borderBottom: '2px solid #3f3f46',
            borderBottomLeftRadius: Math.min(10, indent / 2)
          }} />
        )}

        {/* Node card */}
        <div
          onClick={() => hasChildren && setExpanded(!expanded)}
          style={{
            background: `linear-gradient(135deg, ${style.bg} 0%, ${style.bg}dd 100%)`,
            border: `2px solid ${style.border}`,
            borderRadius: 12,
            padding: isCompareMode ? '10px 12px' : '12px 16px',
            marginBottom: 8,
            cursor: hasChildren ? 'pointer' : 'default',
            boxShadow: `0 4px 12px ${style.bg}40`,
            transition: 'all 0.2s ease',
            flex: 1,
            minWidth: 0,
            overflow: 'hidden'
          }}
        >
          {/* Node header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span style={{ fontSize: isCompareMode ? 16 : 20, flexShrink: 0 }}>{style.icon}</span>
            <span style={{
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              fontWeight: 600,
              fontSize: isCompareMode ? 12 : 14,
              color: '#f4f4f5',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
              flex: 1
            }}>
              {node['Node Type']}
            </span>
            {hasChildren && (
              <span style={{
                color: '#a1a1aa',
                fontSize: 12,
                transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                flexShrink: 0
              }}>
                ▶
              </span>
            )}
          </div>

          {/* Description */}
          {node.Description && (
            <div style={{
              marginTop: 6,
              fontSize: isCompareMode ? 11 : 12,
              color: '#a1a1aa',
              fontStyle: 'italic',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {node.Description}
            </div>
          )}

          {/* Stats badges */}
          {stats.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              marginTop: 8
            }}>
              {stats.map(stat => (
                <NodeStatBadge key={stat.label} label={stat.label} value={stat.value} />
              ))}
            </div>
          )}

          {/* Code blocks for various node properties */}
          {node['Sort Key'] && <CodeBlock label="Sort" value={node['Sort Key']} />}
          {node.Filter && <CodeBlock label="Filter" value={node.Filter} />}
          {node.Keys && <CodeBlock label="Group by" value={node.Keys} />}
          {node.Aggregates && (
            <div style={{ marginTop: 6 }}>
              <CodeBlock label="Aggregates" value={node.Aggregates} />
            </div>
          )}

          {/* Projections section - keep inside node as they're less critical */}
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
                Projections ({node.Projections!.length})
              </div>
              {node.Projections!.map((proj, i) => (
                <ProjectionCard key={i} projection={proj} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Index cards - displayed at full width outside the nested structure */}
      {hasIndexes && (
        <div style={{
          marginLeft: -indent,
          marginBottom: 12,
          marginTop: -4
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: 10,
            padding: '12px 14px',
            overflow: 'hidden'
          }}>
            <div style={{
              fontSize: 11,
              color: '#22c55e',
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <span>📊</span>
              Index Usage ({node.Indexes!.length} {node.Indexes!.length === 1 ? 'index' : 'indexes'})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {node.Indexes!.map((idx, i) => (
                <IndexCard key={i} index={idx} compact={isCompareMode} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Child nodes */}
      {expanded && hasChildren && (
        <div>
          {node.Plans!.map((child, i) => (
            <PlanNodeComponent
              key={i}
              node={child}
              depth={depth + 1}
              maxDepth={maxDepth}
              isCompareMode={isCompareMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}
