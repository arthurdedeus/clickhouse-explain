import type { PlanNode, PlanStats, NodeColorStyle } from './types';
import { NODE_COLORS } from './constants';
import LZString from 'lz-string';

export function getNodeStyle(nodeType?: string): NodeColorStyle {
  if (!nodeType) return NODE_COLORS.default;
  for (const [key, style] of Object.entries(NODE_COLORS)) {
    if (nodeType.toLowerCase().includes(key.toLowerCase())) {
      return style;
    }
  }
  return NODE_COLORS.default;
}

export function formatNumber(num?: number | null): string | null {
  if (num === undefined || num === null) return null;
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export function formatBytes(bytes?: number | null): string | null {
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

export function extractPlanStats(plan: PlanNode): PlanStats {
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

export function parseExplainJson(json: string): PlanNode {
  const parsed = JSON.parse(json);
  if (Array.isArray(parsed)) {
    return parsed[0]?.Plan || (parsed[0]?.['Node Type'] ? parsed[0] : parsed);
  }
  return parsed.Plan || (parsed['Node Type'] ? parsed : parsed);
}

export function getBarColor(percentage: number): string {
  const filterPct = 100 - percentage;
  if (filterPct >= 90) return '#22c55e';
  if (filterPct >= 70) return '#84cc16';
  if (filterPct >= 50) return '#eab308';
  if (filterPct >= 30) return '#f97316';
  return '#ef4444';
}

export function calculateReductionPercentage(initial: number, selected: number): string {
  if (initial <= 0) return '0';
  return ((1 - selected / initial) * 100).toFixed(0);
}

// Share URL utilities
export interface ShareData {
  mode: 'single' | 'compare';
  queryA: string;
  explainJsonA: string;
  queryB?: string;
  explainJsonB?: string;
  labelA?: string;
  labelB?: string;
}

export function encodeShareData(data: ShareData): string {
  const json = JSON.stringify(data);
  // Use lz-string for efficient compression with URL-safe output
  return LZString.compressToEncodedURIComponent(json);
}

// Legacy decoder for backward compatibility with old base64-encoded links
function decodeLegacyShareData(encoded: string): ShareData | null {
  try {
    // Restore from URL-safe base64 format
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    // Add back padding
    while (base64.length % 4) {
      base64 += '=';
    }
    let decoded: string;
    if (typeof window !== 'undefined') {
      decoded = atob(base64);
    } else {
      decoded = Buffer.from(base64, 'base64').toString();
    }
    const json = decodeURIComponent(decoded);
    if (!json) return null;
    const data = JSON.parse(json);
    if (!data.mode || !data.explainJsonA) return null;
    return data as ShareData;
  } catch {
    return null;
  }
}

export function decodeShareData(encoded: string): ShareData | null {
  // First try lz-string decompression (new format)
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (json) {
      const data = JSON.parse(json);
      if (data.mode && data.explainJsonA) {
        return data as ShareData;
      }
    }
  } catch {
    // Fall through to legacy decoder
  }

  // Fall back to legacy base64 decoding for old links
  return decodeLegacyShareData(encoded);
}

export function generateShareUrl(data: ShareData): string {
  const encoded = encodeShareData(data);
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    url.hash = `share=${encoded}`;
    return url.toString();
  }
  return `#share=${encoded}`;
}

export function parseShareFromUrl(): ShareData | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash;
  if (!hash.startsWith('#share=')) return null;
  const encoded = hash.slice(7); // Remove '#share='
  return decodeShareData(encoded);
}

// Calculate the maximum depth of a plan tree
export function getMaxDepth(node: PlanNode, currentDepth = 0): number {
  if (!node.Plans || node.Plans.length === 0) {
    return currentDepth;
  }
  return Math.max(...node.Plans.map(child => getMaxDepth(child, currentDepth + 1)));
}
