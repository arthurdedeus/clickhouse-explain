'use client';

import React, { useState } from 'react';
import type { PlanNode as PlanNodeType } from '../types';
import { getNodeStyle, formatNumber, formatBytes } from '../utils';
import { IndexCard } from './IndexCard';
import { ProjectionCard } from './ProjectionCard';

interface PlanNodeProps {
  node: PlanNodeType;
  depth?: number;
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
    <div style={{ marginTop: 8, fontSize: 12, color: '#d4d4d8' }}>
      <span style={{ color: '#a1a1aa' }}>{label}: </span>
      <code style={{
        background: 'rgba(0,0,0,0.25)',
        padding: '2px 6px',
        borderRadius: 4,
        fontFamily: '"JetBrains Mono", monospace'
      }}>
        {displayValue}
      </code>
    </div>
  );
}

export function PlanNodeComponent({ node, depth = 0 }: PlanNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const style = getNodeStyle(node['Node Type']);
  const hasChildren = node.Plans && node.Plans.length > 0;

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
    <div style={{ marginLeft: depth === 0 ? 0 : 28 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
        {/* Tree connector line */}
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

        {/* Node card */}
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
          {/* Node header */}
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

          {/* Description */}
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

          {/* Stats badges */}
          {stats.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              marginTop: 10
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

          {/* Indexes section */}
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

          {/* Projections section */}
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

      {/* Child nodes */}
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
