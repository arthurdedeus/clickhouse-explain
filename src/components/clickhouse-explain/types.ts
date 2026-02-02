export interface PlanNode {
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

export interface IndexInfo {
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

export interface ProjectionInfo {
  Name: string;
  Description?: string;
  Condition?: string;
  'Selected Parts'?: number;
  'Selected Marks'?: number;
  'Selected Ranges'?: number;
  'Selected Rows'?: number;
  'Filtered Parts'?: number;
}

export interface PlanStats {
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

export interface NodeColorStyle {
  bg: string;
  border: string;
  icon: string;
}

export interface IndexColorStyle {
  bg: string;
  border: string;
  badge: string;
  text: string;
}

export type ViewMode = 'single' | 'compare';
export type ActiveTab = 'input' | 'viz';
