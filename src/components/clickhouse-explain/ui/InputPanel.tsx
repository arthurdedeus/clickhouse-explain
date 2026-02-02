import React from 'react';

interface SingleInputPanelProps {
  query: string;
  explainJson: string;
  error: string | null;
  onQueryChange: (query: string) => void;
  onExplainChange: (json: string) => void;
  onVisualize: () => void;
}

export function SingleInputPanel({
  query,
  explainJson,
  error,
  onQueryChange,
  onExplainChange,
  onVisualize
}: SingleInputPanelProps) {
  return (
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
          onChange={e => onQueryChange(e.target.value)}
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
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            fontSize: 13,
            lineHeight: 1.6,
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
          onChange={e => onExplainChange(e.target.value)}
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
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            fontSize: 13,
            lineHeight: 1.6,
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
          }}
        />
      </div>

      <div style={{ gridColumn: '1 / -1' }}>
        {error && <ErrorMessage message={error} />}

        <VisualizeButton onClick={onVisualize} label="Visualize Query Plan →" />

        <HelpSection />
      </div>
    </div>
  );
}

interface CompareInputPanelProps {
  queryA: string;
  queryB: string;
  explainJsonA: string;
  explainJsonB: string;
  labelA: string;
  labelB: string;
  errorA: string | null;
  errorB: string | null;
  onQueryAChange: (query: string) => void;
  onQueryBChange: (query: string) => void;
  onExplainAChange: (json: string) => void;
  onExplainBChange: (json: string) => void;
  onLabelAChange: (label: string) => void;
  onLabelBChange: (label: string) => void;
  onVisualize: () => void;
}

export function CompareInputPanel({
  queryA,
  queryB,
  explainJsonA,
  explainJsonB,
  labelA,
  labelB,
  errorA,
  errorB,
  onQueryAChange,
  onQueryBChange,
  onExplainAChange,
  onExplainBChange,
  onLabelAChange,
  onLabelBChange,
  onVisualize
}: CompareInputPanelProps) {
  return (
    <div>
      {/* Label inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 11, color: '#71717a', display: 'block', marginBottom: 4 }}>Plan A Label</label>
          <input
            type="text"
            value={labelA}
            onChange={e => onLabelAChange(e.target.value)}
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
            onChange={e => onLabelBChange(e.target.value)}
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

      {/* Plan inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <PlanInputSection
          label={labelA}
          query={queryA}
          explainJson={explainJsonA}
          error={errorA}
          accentColor="#3b82f6"
          bgColor="rgba(59, 130, 246, 0.05)"
          borderColor="rgba(59, 130, 246, 0.2)"
          onQueryChange={onQueryAChange}
          onExplainChange={onExplainAChange}
        />

        <PlanInputSection
          label={labelB}
          query={queryB}
          explainJson={explainJsonB}
          error={errorB}
          accentColor="#a855f7"
          bgColor="rgba(168, 85, 247, 0.05)"
          borderColor="rgba(168, 85, 247, 0.2)"
          onQueryChange={onQueryBChange}
          onExplainChange={onExplainBChange}
        />
      </div>

      <VisualizeButton onClick={onVisualize} label="Compare Plans →" />
    </div>
  );
}

interface PlanInputSectionProps {
  label: string;
  query: string;
  explainJson: string;
  error: string | null;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  onQueryChange: (query: string) => void;
  onExplainChange: (json: string) => void;
}

function PlanInputSection({
  label,
  query,
  explainJson,
  error,
  accentColor,
  bgColor,
  borderColor,
  onQueryChange,
  onExplainChange
}: PlanInputSectionProps) {
  return (
    <div style={{
      background: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: 12,
      padding: 16
    }}>
      <div style={{
        fontSize: 13,
        fontWeight: 700,
        color: accentColor,
        marginBottom: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <span style={{ width: 12, height: 12, background: accentColor, borderRadius: 3 }} />
        {label}
      </div>
      <label style={{ display: 'block', marginBottom: 8, fontSize: 11, color: '#71717a', textTransform: 'uppercase' }}>
        SQL Query (optional)
      </label>
      <textarea
        value={query}
        onChange={e => onQueryChange(e.target.value)}
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
          fontSize: 12,
          fontFamily: '"JetBrains Mono", "Fira Code", monospace'
        }}
      />
      <label style={{ display: 'block', marginTop: 12, marginBottom: 8, fontSize: 11, color: '#71717a', textTransform: 'uppercase' }}>
        EXPLAIN JSON
      </label>
      <textarea
        value={explainJson}
        onChange={e => onExplainChange(e.target.value)}
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
          fontSize: 12,
          fontFamily: '"JetBrains Mono", "Fira Code", monospace'
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
  );
}

interface ErrorMessageProps {
  message: string;
}

function ErrorMessage({ message }: ErrorMessageProps) {
  return (
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
      ⚠️ {message}
    </div>
  );
}

interface VisualizeButtonProps {
  onClick: () => void;
  label: string;
}

function VisualizeButton({ onClick, label }: VisualizeButtonProps) {
  return (
    <button
      onClick={onClick}
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
      {label}
    </button>
  );
}

function HelpSection() {
  return (
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
  );
}
