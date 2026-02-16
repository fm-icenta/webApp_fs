// ui_info.js
// Info tab — shows appCfg.appInfo + configurable 4×3 control table

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
        gap: 20px;
        max-width: 900px;
        font-family: system-ui, sans-serif;
      }
      .info-content {
        background: white;
        color: black;
        padding: 12px;
        border-radius: 6px;
        font-family: 'Courier New', monospace;
        font-size: 10px;
        line-height: 1;
        white-space: pre-wrap;
        word-wrap: break-word;
        max-height: 400px;
        overflow-y: auto;
        border: 1px solid #ccc;
      }
      .info-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 8px;
      }
      .info-table td {
        padding: 8px;
        border: 1px solid #ccc;
        vertical-align: middle;
      }
      .info-table input[type="text"] {
        width: 100%;
        padding: 6px;
        border: 1px solid #aaa;
        border-radius: 4px;
        font-size: 13px;
        box-sizing: border-box;
      }
      .info-table button {
        padding: 6px 12px;
        background: #0a64d1;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        white-space: nowrap;
      }
      .info-table button:hover {
        background: #094fc2;
      }
    `;
    document.head.appendChild(style);
  }

  // ── Panel management ───────────────────────────────────────
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

  // ── Tab button ─────────────────────────────────────────────
  function createTabButton() {
    const tabContainer = document.querySelector(CONTAINER_CLASS);
    if (!tabContainer) {
      console.error('ui_info.js: .tab-container not found');
      return;
    }

    const btn = document.createElement('button');
    btn.className = 'tab';
    btn.textContent = TAB_LABEL;
    btn.onclick = (e) => {
      typeof openTab === 'function'
        ? openTab(e, TAB_ID)
        : (document.getElementById(TAB_ID).style.display = 'block');
    };

    tabContainer.appendChild(btn);
  }

  // ── Format app info ────────────────────────────────────────
  function formatAppInfo(appInfo) {
    if (!appInfo) return '(appCfg.appInfo not found)';
    try {
      return JSON.stringify(appInfo, null, 2);
    } catch (err) {
      return `Error formatting appInfo: ${err.message}\n\nRaw: ${String(appInfo)}`;
    }
  }

  // ── App info section ───────────────────────────────────────
  function buildAppInfoSection() {
    const content = document.createElement('pre');
    content.className = 'info-content';
    content.textContent = formatAppInfo(appCfg?.appInfo) || '(no information available)';
    return content;
  }

  // ── Build full frame ───────────────────────────────────────
  function buildFrame() {
    const frame = document.createElement('div');
    frame.className = 'info-frame';

    // App info (no title)
    frame.appendChild(buildAppInfoSection());

    // Control table
    const buttonMatrix = appCfg?.ui?.info_Panel?.button_matrix;


    if (!Array.isArray(buttonMatrix)) {
      console.warn('No valid button_matrix found in appCfg.ui.info_Panel');
      return frame;
    }

    const table = window.buildControlTable('info-table', buttonMatrix, (event) => {
      const { row, side, buttonId: id, value, display } = event;

      if (!value || !id) {
        console.warn(`Row ${row} (${side}): missing value or ID`);
        return;
      }

      console.log(`Button clicked → ID: ${id} | Value: "${value}"`);

      // Your real command logic here
      // const cmd = { action: id, value };
      // sendGlbCmd({ ble_write: JSON.stringify(cmd) });
    });

    frame.appendChild(table);

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

  // ── Entry point ────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();