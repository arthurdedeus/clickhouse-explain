import React from 'react';
import type { ViewMode, ActiveTab } from '../types';

interface HeaderProps {
  mode: ViewMode;
  activeTab: ActiveTab;
  canVisualize: boolean;
  onModeChange: (mode: ViewMode) => void;
  onTabChange: (tab: ActiveTab) => void;
}

export function Header({
  mode,
  activeTab,
  canVisualize,
  onModeChange,
  onTabChange
}: HeaderProps) {
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
