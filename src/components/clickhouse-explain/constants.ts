import type { NodeColorStyle, IndexColorStyle } from './types';

export const NODE_COLORS: Record<string, NodeColorStyle> = {
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

export const INDEX_COLORS: Record<string, IndexColorStyle> = {
  'MinMax': { bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.4)', badge: '#eab308', text: '#fef08a' },
  'Partition': { bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.4)', badge: '#a855f7', text: '#e9d5ff' },
  'PrimaryKey': { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.4)', badge: '#22c55e', text: '#bbf7d0' },
  'Skip': { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)', badge: '#3b82f6', text: '#bfdbfe' },
};

export const DEFAULT_QUERY_A = `SELECT
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

export const DEFAULT_QUERY_B = `SELECT
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

export const DEFAULT_EXPLAIN_A = `[
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

export const DEFAULT_EXPLAIN_B = `[
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

export const PLAN_A_COLOR = '#3b82f6';
export const PLAN_B_COLOR = '#a855f7';
export const ACCENT_COLOR = '#facc15';
