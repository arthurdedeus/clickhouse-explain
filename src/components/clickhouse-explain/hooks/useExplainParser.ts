'use client';

import { useState, useMemo, useCallback } from 'react';
import type { PlanNode, PlanStats, ViewMode, ActiveTab } from '../types';
import { parseExplainJson, extractPlanStats } from '../utils';
import {
  DEFAULT_QUERY_A,
  DEFAULT_QUERY_B,
  DEFAULT_EXPLAIN_A,
  DEFAULT_EXPLAIN_B
} from '../constants';

export interface ExplainParserState {
  mode: ViewMode;
  activeTab: ActiveTab;
  queryA: string;
  queryB: string;
  explainJsonA: string;
  explainJsonB: string;
  labelA: string;
  labelB: string;
  parsedPlanA: PlanNode | null;
  parsedPlanB: PlanNode | null;
  errorA: string | null;
  errorB: string | null;
  statsA: PlanStats | null;
  statsB: PlanStats | null;
}

export interface ExplainParserActions {
  setMode: (mode: ViewMode) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setQueryA: (query: string) => void;
  setQueryB: (query: string) => void;
  setExplainJsonA: (json: string) => void;
  setExplainJsonB: (json: string) => void;
  setLabelA: (label: string) => void;
  setLabelB: (label: string) => void;
  parseAndVisualize: () => void;
  canVisualize: boolean;
}

export function useExplainParser(): ExplainParserState & ExplainParserActions {
  const [mode, setModeState] = useState<ViewMode>('single');
  const [activeTab, setActiveTab] = useState<ActiveTab>('input');
  const [queryA, setQueryA] = useState(DEFAULT_QUERY_A);
  const [queryB, setQueryB] = useState(DEFAULT_QUERY_B);
  const [explainJsonA, setExplainJsonA] = useState(DEFAULT_EXPLAIN_A);
  const [explainJsonB, setExplainJsonB] = useState(DEFAULT_EXPLAIN_B);
  const [labelA, setLabelA] = useState('Plan A');
  const [labelB, setLabelB] = useState('Plan B');
  const [parsedPlanA, setParsedPlanA] = useState<PlanNode | null>(null);
  const [parsedPlanB, setParsedPlanB] = useState<PlanNode | null>(null);
  const [errorA, setErrorA] = useState<string | null>(null);
  const [errorB, setErrorB] = useState<string | null>(null);

  const setMode = useCallback((newMode: ViewMode) => {
    setModeState(newMode);
    setActiveTab('input');
  }, []);

  const parseAndVisualize = useCallback(() => {
    let planA: PlanNode | null = null;
    let planB: PlanNode | null = null;
    let errA: string | null = null;
    let errB: string | null = null;

    try {
      planA = parseExplainJson(explainJsonA);
    } catch (e) {
      errA = `Plan A: ${(e as Error).message}`;
    }

    if (mode === 'compare') {
      try {
        planB = parseExplainJson(explainJsonB);
      } catch (e) {
        errB = `Plan B: ${(e as Error).message}`;
      }
    }

    setParsedPlanA(planA);
    setParsedPlanB(planB);
    setErrorA(errA);
    setErrorB(errB);

    const canSwitch = mode === 'single'
      ? planA && !errA
      : planA && planB && !errA && !errB;

    if (canSwitch) {
      setActiveTab('viz');
    }
  }, [mode, explainJsonA, explainJsonB]);

  const statsA = useMemo(
    () => (parsedPlanA ? extractPlanStats(parsedPlanA) : null),
    [parsedPlanA]
  );

  const statsB = useMemo(
    () => (parsedPlanB ? extractPlanStats(parsedPlanB) : null),
    [parsedPlanB]
  );

  const canVisualize = mode === 'single'
    ? parsedPlanA !== null
    : parsedPlanA !== null && parsedPlanB !== null;

  return {
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
  };
}
