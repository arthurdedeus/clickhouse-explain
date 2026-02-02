export { default as ClickHouseExplainViz } from './ClickHouseExplainViz';
export { default } from './ClickHouseExplainViz';

// Re-export types for external use
export type {
  PlanNode,
  IndexInfo,
  ProjectionInfo,
  PlanStats,
  ViewMode,
  ActiveTab
} from './types';

// Re-export utilities for potential external use
export {
  formatNumber,
  formatBytes,
  extractPlanStats,
  parseExplainJson
} from './utils';

// Re-export hook for advanced usage
export { useExplainParser } from './hooks';
