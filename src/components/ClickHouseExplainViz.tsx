// Re-export from modular component structure
// This file is kept for backwards compatibility with existing imports

export { default } from './clickhouse-explain';
export { ClickHouseExplainViz } from './clickhouse-explain';

// Re-export types and utilities for convenience
export type {
  PlanNode,
  IndexInfo,
  ProjectionInfo,
  PlanStats,
  ViewMode,
  ActiveTab
} from './clickhouse-explain';

export {
  formatNumber,
  formatBytes,
  extractPlanStats,
  parseExplainJson,
  useExplainParser
} from './clickhouse-explain';
