'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { PlanNode, PlanStats, ViewMode, ActiveTab } from '../types';
import { parseExplainJson, extractPlanStats, parseShareFromUrl, generateShareUrl, ShareData } from '../utils';
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
  getShareUrl: () => string;
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

  // Load from shared URL on mount
  useEffect(() => {
    const shareData = parseShareFromUrl();
    if (shareData) {
      setModeState(shareData.mode);
      setQueryA(shareData.queryA || '');
      setExplainJsonA(shareData.explainJsonA);
      if (shareData.mode === 'compare') {
        setQueryB(shareData.queryB || '');
        setExplainJsonB(shareData.explainJsonB || '');
        setLabelA(shareData.labelA || 'Plan A');
        setLabelB(shareData.labelB || 'Plan B');
      }
      // Auto-parse after loading
      setTimeout(() => {
        // Trigger visualization after state is set
        let planA: PlanNode | null = null;
        let planB: PlanNode | null = null;
        try {
          planA = parseExplainJson(shareData.explainJsonA);
          setParsedPlanA(planA);
          setErrorA(null);
        } catch (e) {
          setErrorA(`Plan A: ${(e as Error).message}`);
        }
        if (shareData.mode === 'compare' && shareData.explainJsonB) {
          try {
            planB = parseExplainJson(shareData.explainJsonB);
            setParsedPlanB(planB);
            setErrorB(null);
          } catch (e) {
            setErrorB(`Plan B: ${(e as Error).message}`);
          }
        }
        const canSwitch = shareData.mode === 'single'
          ? planA !== null
          : planA !== null && planB !== null;
        if (canSwitch) {
          setActiveTab('viz');
        }
      }, 0);
      // Clear the hash after loading to keep URL clean for future shares
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
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

  const getShareUrl = useCallback(() => {
    const shareData: ShareData = {
      mode,
      queryA,
      explainJsonA,
    };
    if (mode === 'compare') {
      shareData.queryB = queryB;
      shareData.explainJsonB = explainJsonB;
      shareData.labelA = labelA;
      shareData.labelB = labelB;
    }
    return generateShareUrl(shareData);
  }, [mode, queryA, queryB, explainJsonA, explainJsonB, labelA, labelB]);

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
    getShareUrl,
  };
}
