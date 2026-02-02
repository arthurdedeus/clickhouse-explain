import React from 'react';

export function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      * { box-sizing: border-box; }

      textarea {
        font-family: "JetBrains Mono", "Fira Code", monospace;
        font-size: 13px;
        line-height: 1.6;
      }

      textarea:focus {
        outline: none;
        border-color: #facc15 !important;
        box-shadow: 0 0 0 3px rgba(250, 204, 21, 0.15);
      }

      input:focus {
        outline: none;
        border-color: #facc15 !important;
        box-shadow: 0 0 0 3px rgba(250, 204, 21, 0.15);
      }

      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-track { background: #27272a; border-radius: 4px; }
      ::-webkit-scrollbar-thumb { background: #52525b; border-radius: 4px; }
      ::-webkit-scrollbar-thumb:hover { background: #71717a; }
    `}</style>
  );
}
