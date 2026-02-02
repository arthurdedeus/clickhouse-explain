'use client';

import React from 'react';
import { useExplainParser } from './hooks';
import {
  Header,
  Legend,
  SingleInputPanel,
  CompareInputPanel,
  StatsOverview,
  ComparisonSummary,
  PlanNodeComponent,
  QueryPreview,
  CompareQueriesPreview
} from './ui';
import { GlobalStyles } from './GlobalStyles';

export default function ClickHouseExplainViz() {
  const {
    mode,
    activeTab,
    queryA,
    queryB,
    explainJsonA,
    explainJsonB,
    labelA,
    labelB,
    parsedPlanA,
    parsedPlanB,
    errorA,
    errorB,
    statsA,
    statsB,
    setMode,
    setActiveTab,
    setQueryA,
    setQueryB,
    setExplainJsonA,
    setExplainJsonB,
    setLabelA,
    setLabelB,
    parseAndVisualize,
    canVisualize,
  } = useExplainParser();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #09090b 0%, #18181b 50%, #09090b 100%)',
      color: '#f4f4f5',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <GlobalStyles />

      <Header
        mode={mode}
        activeTab={activeTab}
        canVisualize={canVisualize}
        onModeChange={setMode}
        onTabChange={setActiveTab}
      />

      <main style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
        {/* Single Mode Input */}
        {activeTab === 'input' && mode === 'single' && (
          <SingleInputPanel
            query={queryA}
            explainJson={explainJsonA}
            error={errorA}
            onQueryChange={setQueryA}
            onExplainChange={setExplainJsonA}
            onVisualize={parseAndVisualize}
          />
        )}

        {/* Compare Mode Input */}
        {activeTab === 'input' && mode === 'compare' && (
          <CompareInputPanel
            queryA={queryA}
            queryB={queryB}
            explainJsonA={explainJsonA}
            explainJsonB={explainJsonB}
            labelA={labelA}
            labelB={labelB}
            errorA={errorA}
            errorB={errorB}
            onQueryAChange={setQueryA}
            onQueryBChange={setQueryB}
            onExplainAChange={setExplainJsonA}
            onExplainBChange={setExplainJsonB}
            onLabelAChange={setLabelA}
            onLabelBChange={setLabelB}
            onVisualize={parseAndVisualize}
          />
        )}

        {/* Single Mode Visualization */}
        {activeTab === 'viz' && parsedPlanA && mode === 'single' && (
          <SingleVisualization
            plan={parsedPlanA}
            query={queryA}
          />
        )}

        {/* Compare Mode Visualization */}
        {activeTab === 'viz' && parsedPlanA && parsedPlanB && mode === 'compare' && statsA && statsB && (
          <CompareVisualization
            planA={parsedPlanA}
            planB={parsedPlanB}
            queryA={queryA}
            queryB={queryB}
            labelA={labelA}
            labelB={labelB}
            statsA={statsA}
            statsB={statsB}
          />
        )}
      </main>
    </div>
  );
}

interface SingleVisualizationProps {
  plan: NonNullable<ReturnType<typeof useExplainParser>['parsedPlanA']>;
  query: string;
}

function SingleVisualization({ plan, query }: SingleVisualizationProps) {
  return (
    <div>
      <StatsOverview plan={plan} />

      {query && (
        <div style={{ marginBottom: 24 }}>
          <QueryPreview query={query} />
        </div>
      )}

      <PipelineContainer>
        <PipelineHeader />
        <PlanNodeComponent node={plan} />
      </PipelineContainer>

      <Legend />
    </div>
  );
}

interface CompareVisualizationProps {
  planA: NonNullable<ReturnType<typeof useExplainParser>['parsedPlanA']>;
  planB: NonNullable<ReturnType<typeof useExplainParser>['parsedPlanB']>;
  queryA: string;
  queryB: string;
  labelA: string;
  labelB: string;
  statsA: NonNullable<ReturnType<typeof useExplainParser>['statsA']>;
  statsB: NonNullable<ReturnType<typeof useExplainParser>['statsB']>;
}

function CompareVisualization({
  planA,
  planB,
  queryA,
  queryB,
  labelA,
  labelB,
  statsA,
  statsB
}: CompareVisualizationProps) {
  return (
    <div>
      <ComparisonSummary
        statsA={statsA}
        statsB={statsB}
        labelA={labelA}
        labelB={labelB}
      />

      <CompareQueriesPreview
        queryA={queryA}
        queryB={queryB}
        labelA={labelA}
        labelB={labelB}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <StatsOverview plan={planA} label={labelA} accentColor="#3b82f6" />
          <PipelineContainer borderColor="rgba(59, 130, 246, 0.3)">
            <PipelineHeader label={`${labelA} Pipeline`} color="#3b82f6" />
            <PlanNodeComponent node={planA} />
          </PipelineContainer>
        </div>

        <div>
          <StatsOverview plan={planB} label={labelB} accentColor="#a855f7" />
          <PipelineContainer borderColor="rgba(168, 85, 247, 0.3)">
            <PipelineHeader label={`${labelB} Pipeline`} color="#a855f7" />
            <PlanNodeComponent node={planB} />
          </PipelineContainer>
        </div>
      </div>

      <Legend />
    </div>
  );
}

interface PipelineContainerProps {
  children: React.ReactNode;
  borderColor?: string;
}

function PipelineContainer({ children, borderColor = '#27272a' }: PipelineContainerProps) {
  return (
    <div style={{
      background: '#18181b',
      border: `1px solid ${borderColor}`,
      borderRadius: 16,
      padding: borderColor === '#27272a' ? 24 : 20
    }}>
      {children}
    </div>
  );
}

interface PipelineHeaderProps {
  label?: string;
  color?: string;
}

function PipelineHeader({ label = 'Execution Pipeline', color = '#71717a' }: PipelineHeaderProps) {
  return (
    <div style={{
      fontSize: 11,
      fontWeight: 600,
      color: color,
      marginBottom: label === 'Execution Pipeline' ? 20 : 16,
      textTransform: 'uppercase',
      letterSpacing: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }}>
      <span style={{
        width: 8,
        height: 8,
        background: label === 'Execution Pipeline' ? '#22c55e' : color,
        borderRadius: '50%',
        boxShadow: label === 'Execution Pipeline' ? '0 0 8px #22c55e' : 'none'
      }} />
      {label}
    </div>
  );
}
