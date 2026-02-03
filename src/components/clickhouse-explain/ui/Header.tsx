'use client';

import React, { useState } from 'react';
import type { ViewMode, ActiveTab } from '../types';

interface HeaderProps {
  mode: ViewMode;
  activeTab: ActiveTab;
  canVisualize: boolean;
  onModeChange: (mode: ViewMode) => void;
  onTabChange: (tab: ActiveTab) => void;
  onShare?: () => string;
}

export function Header({
  mode,
  activeTab,
  canVisualize,
  onModeChange,
  onTabChange,
  onShare
}: HeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!onShare) return;
    const url = onShare();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header style={{
      padding: '24px 32px',
      borderBottom: '1px solid #27272a',
      background: 'rgba(9, 9, 11, 0.8)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        {/* Logo and title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 42,
            height: 42,
            background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            boxShadow: '0 4px 16px rgba(250, 204, 21, 0.25)'
          }}>
            ⚡
          </div>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              background: 'linear-gradient(90deg, #facc15, #f59e0b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              ClickHouse EXPLAIN Visualizer
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: '#71717a' }}>
              {mode === 'compare' ? 'Compare two query plans' : 'Visualize query execution plans'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Mode toggle */}
          <ModeToggle mode={mode} onModeChange={onModeChange} />

          {/* Tab buttons */}
          <TabButton
            label="Input"
            isActive={activeTab === 'input'}
            onClick={() => onTabChange('input')}
          />
          <TabButton
            label={mode === 'compare' ? 'Comparison' : 'Visualization'}
            isActive={activeTab === 'viz'}
            disabled={!canVisualize}
            onClick={() => onTabChange('viz')}
          />

          {/* Share button - only show when visualization is active */}
          {activeTab === 'viz' && canVisualize && onShare && (
            <ShareButton copied={copied} onClick={handleShare} />
          )}
        </div>
      </div>
    </header>
  );
}

interface ModeToggleProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div style={{
      display: 'flex',
      background: '#27272a',
      borderRadius: 8,
      padding: 3,
      marginRight: 8
    }}>
      <button
        onClick={() => onModeChange('single')}
        style={{
          padding: '6px 12px',
          background: mode === 'single' ? '#3f3f46' : 'transparent',
          color: mode === 'single' ? '#f4f4f5' : '#71717a',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 500,
          transition: 'all 0.2s ease'
        }}
      >
        Single
      </button>
      <button
        onClick={() => onModeChange('compare')}
        style={{
          padding: '6px 12px',
          background: mode === 'compare' ? '#3f3f46' : 'transparent',
          color: mode === 'compare' ? '#f4f4f5' : '#71717a',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 500,
          transition: 'all 0.2s ease'
        }}
      >
        Compare
      </button>
    </div>
  );
}

interface TabButtonProps {
  label: string;
  isActive: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function TabButton({ label, isActive, disabled, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '8px 16px',
        background: isActive ? '#facc15' : 'transparent',
        color: isActive ? '#09090b' : '#a1a1aa',
        border: '1px solid',
        borderColor: isActive ? '#facc15' : '#3f3f46',
        borderRadius: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 600,
        fontSize: 13,
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease'
      }}
    >
      {label}
    </button>
  );
}

interface ShareButtonProps {
  copied: boolean;
  onClick: () => void;
}

function ShareButton({ copied, onClick }: ShareButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        background: copied ? '#22c55e' : 'transparent',
        color: copied ? '#fff' : '#a1a1aa',
        border: '1px solid',
        borderColor: copied ? '#22c55e' : '#3f3f46',
        borderRadius: 8,
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: 13,
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}
    >
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Share
        </>
      )}
    </button>
  );
}
