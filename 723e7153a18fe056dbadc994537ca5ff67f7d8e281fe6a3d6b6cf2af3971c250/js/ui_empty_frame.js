// ui_info.js
// Minimal info tab — creates a simple transparent frame

(() => {
  'use strict';

  // ── Constants ───────────────────────────────────────────────
  const TAB_ID       = 'infoTab';
  const TAB_LABEL    = 'Info';
  const CSS_ID       = 'ui-info-css';
  const CONTAINER_CLASS = '.tab-container';

  // ── Utility: Inject CSS only once ──────────────────────────
  function injectStyles() {
    if (document.getElementById(CSS_ID)) return;

    const style = document.createElement('style');
    style.id = CSS_ID;
    style.textContent = `
      .info-frame {
        border: 2px solid #0a64d1;
        border-radius: 10px;
        padding: 16px;
        background: transparent;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-width: 800px;
        font-family: system-ui, sans-serif;
      }
      .info-placeholder {
        color: #666;
        font-size: 14px;
        font-style: italic;
      }
    `;
    document.head.appendChild(style);
  }

  // ── Create / get panel ─────────────────────────────────────
  function getOrCreatePanel() {
    let panel = document.getElementById(TAB_ID);
    if (panel) return panel;

    panel = document.createElement('div');
    panel.id = TAB_ID;
    panel.className = 'tab-content';

    const logContainer = document.getElementById('logContainer');
    if (logContainer?.parentNode) {
      logContainer.parentNode.insertBefore(panel, logContainer);
    } else {
      document.body.appendChild(panel);
    }

    return panel;
  }

  // ── Create tab button ──────────────────────────────────────
  function createTabButton() {
    const tabContainer = document.querySelector(CONTAINER_CLASS);
    if (!tabContainer) {
      console.error('ui_info.js: .tab-container not found');
      return null;
    }

    const btn = document.createElement('button');
    btn.className = 'tab';
    btn.textContent = TAB_LABEL;
    btn.onclick = (e) => {
      if (typeof openTab === 'function') {
        openTab(e, TAB_ID);
      } else {
        document.getElementById(TAB_ID).style.display = 'block';
      }
    };

    tabContainer.appendChild(btn);
    return btn;
  }

  // ── Build frame content ────────────────────────────────────
  function buildFrame() {
    const frame = document.createElement('div');
    frame.className = 'info-frame';

    // Placeholder (easy to replace later)
    const placeholder = document.createElement('div');
    placeholder.className = 'info-placeholder';
    placeholder.textContent = '(content to be added)';
    frame.appendChild(placeholder);

    return frame;
  }

  // ── Main initialization ────────────────────────────────────
  function init() {
    injectStyles();

    const panel = getOrCreatePanel();
    if (!panel) return;

    createTabButton();

    const frame = buildFrame();
    panel.appendChild(frame);
  }

  // ── Run when ready ─────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();