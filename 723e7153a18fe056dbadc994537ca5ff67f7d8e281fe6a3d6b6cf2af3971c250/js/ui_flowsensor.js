// ui_flowsensor.js
// FlowSensor UI - creates container, delegates chart to chart_plotter.js

(() => {
  'use strict';

  // ══════════════════════════════════════════════════════════════
  // GLOBALS & STATE
  // ══════════════════════════════════════════════════════════════

  window.fsLogger = null;

  let lastAccCount = null;
  let lastTimestamp = null;

  // ══════════════════════════════════════════════════════════════
  // DATA HANDLER
  // ══════════════════════════════════════════════════════════════

  window.onFlowSensorData = function (cmd) {
    if (!cmd || typeof cmd !== 'object' || !window.fsLogger) return;

    const currentAcc = Number(cmd.acc_cnt ?? cmd.data ?? NaN);
    if (isNaN(currentAcc)) {
      window.fsLogger('RX: invalid data', 'warning');
      return;
    }

    const now = Date.now();
    let rate = 0;
    let rateText = ' → first reading';

    if (lastAccCount !== null && lastTimestamp !== null) {
      const Δcount = currentAcc - lastAccCount;
      const Δt_sec = (now - lastTimestamp) / 1000;

      if (Δt_sec > 0.001) {
        rate = Δcount / Δt_sec;
        rateText = ` → ${rate.toFixed(1)} pulses/sec`;
      } else {
        rateText = ' → (Δt too small)';
      }
    }

    const flowrate = Number(cmd.cps ?? NaN);
    const cpsText = !isNaN(flowrate) ? flowrate.toFixed(1) + ' cps' : '—';

    window.fsLogger(`RX: acc=${currentAcc}  |  ${cpsText}${rateText}`);

    // Update chart via module API
    if (window.FlowRateChart) {
      window.FlowRateChart.addDataPoint(rate, now);
    }

    lastAccCount = currentAcc;
    lastTimestamp = now;
  };

  // ══════════════════════════════════════════════════════════════
  // UTILITIES
  // ══════════════════════════════════════════════════════════════

  function createLogger(logDiv) {
    logDiv.addEventListener('dblclick', () => {
      logDiv.replaceChildren();
    });

    return (message, className = '') => {
      const now = new Date();
      const time = now.toLocaleTimeString([], { hour12: false });
      const ms = String(now.getMilliseconds()).padStart(3, '0').slice(0, 2);

      const line = document.createElement('div');
      line.className = 'fs-log-entry' + (className ? ' ' + className : '');
      line.textContent = `[${time}.${ms}] ${message}`;

      logDiv.appendChild(line);
      logDiv.scrollTop = logDiv.scrollHeight;

      while (logDiv.children.length > 100) {
        logDiv.firstChild.remove();
      }
    };
  }

  function sendCommand(cmd) {
    if (typeof sendGlbCmd === 'function') {
      if (_isJsonStr(cmd)){
        _jsonExtractEx(cmd).forEach(cmdObj => {
            sendCommandEx(cmdObj);
        });
      }
    } else {
      console.log('FlowSensor →', cmd);
    }
  }

  function sendCommandEx(cmdObj){

      if (cmdObj.component == "localtest" ){
        console.log(cmdObj);     
      }else{
        sendGlbCmd(cmdObj)
        console.log(cmdObj);        
      }

  }

  // function sendCommand(cmd) {
  //   if (typeof sendGlbCmd === 'function') {
  //     if (_isJsonStr(cmd)){
  //       _jsonExtractEx(cmd).forEach(cmdObj => {
  //           console.log(cmdObj);
  //       });
  //     }
  //   } else {
  //     console.log('FlowSensor →', cmd);
  //   }
  // }

  // ── Helper: Parse command for display (handles "_" prefix and macro) ──
  function parseCommand(cmdStr) {
    if (!cmdStr || typeof cmdStr !== 'string') return cmdStr;

    try {
      let obj = JSON.parse(cmdStr);

      // Remove keys starting with "_" (like "_": "sensor_pulse")
      if (typeof removeKeysWithPrefix === 'function') {
        obj = removeKeysWithPrefix(JSON.stringify(obj));
        if (typeof obj === 'string') {
          obj = JSON.parse(obj);
        }
      }

      // Extract macro if present
      if (obj?.macro) {
        return JSON.stringify(obj.macro);
      }

      return JSON.stringify(obj);

    } catch (e) {
      return cmdStr;
    }
  }

  function injectCSS() {
    if (document.getElementById('ui-flowsensor-css')) return;

    const style = document.createElement('style');
    style.id = 'ui-flowsensor-css';
    style.textContent = `
      .fs-wrapper {
        display: flex;
        flex-direction: column;
        gap: 16px;
        max-width: 900px;
        font-family: system-ui, sans-serif;
      }
      .fs-frame {
        border: 2px solid #0a64d1;
        border-radius: 10px;
        padding: 12px;
        background: transparent;
      }
      .fs-title {
        font-size: 13px;
        font-weight: 600;
        color: #0f172a;
        margin-bottom: 6px;
      }
      .fs-row {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: nowrap;
      }
      .fs-log {
        width: 100%;
        height: 100px;
        overflow-y: auto;
        border: 2px solid #000;
        border-radius: 6px;
        background: #000;
        color: #0f0;
        padding: 6px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.4;
      }
      .fs-log-entry {
        margin: 0;
        padding: 3px 4px;
        border-bottom: 1px solid #222;
      }
      .fs-log-entry.warning { color: #ff9800; }
      
      .slider-container {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 0;
      }
      .slider-label {
        font-size: 13px;
        font-weight: 500;
        min-width: 140px;
        color: #0f172a;
      }
      .slider-value {
        font-family: monospace;
        font-size: 13px;
        min-width: 60px;
        text-align: right;
        color: #0a64d1;
      }
      input[type="range"] {
        appearance: none;
        height: 8px;
        background: linear-gradient(to right, #0a64d1 var(--value, 0%), #e0e0e0 var(--value, 0%));
        border-radius: 4px;
        flex: 1;
      }
      input[type="range"]::-webkit-slider-thumb {
        appearance: none;
        width: 20px;
        height: 20px;
        background: #0a64d1;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        transition: transform 0.15s;
      }
      input[type="range"]::-webkit-slider-thumb:hover {
        transform: scale(1.15);
      }
      
      .chart-container {
        position: relative;
        height: 260px;
        width: 100%;
        background: #111;
        border: 1px solid #333;
        border-radius: 6px;
        margin-top: 12px;
      }
      .chart-fallback {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #888;
        font-size: 14px;
      }
    `;
    document.head.appendChild(style);
  }

  // ══════════════════════════════════════════════════════════════
  // FRAME BUILDER
  // ══════════════════════════════════════════════════════════════

  function buildFrame(cfg = {}) {
    const frame = document.createElement('div');
    frame.className = 'fs-frame';

    // Title
    const title = document.createElement('div');
    title.className = 'fs-title';
    title.textContent = cfg.Title || 'FlowSensor';
    frame.appendChild(title);

    // Command row
    const cmdRow = document.createElement('div');
    cmdRow.className = 'fs-row';

    const select = document.createElement('select');
    Object.assign(select.style, { width: '160px', flex: '0 0 auto' });

    // ✅ Populate combobox from config
    const commands = Array.isArray(cfg.Command) ? cfg.Command : [];
    
    commands.forEach((cmdObj) => {
      const opt = document.createElement('option');
      
      // Display label from "_" key if present, otherwise show full JSON
      const label = cmdObj._ || JSON.stringify(cmdObj);
      opt.textContent = label;
      
      // Store full command as value
      opt.value = JSON.stringify(cmdObj);
      
      select.appendChild(opt);
    });

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter command (JSON or text)';
    input.style.flex = '1';

    // ✅ Set default value from first non-separator command
    if (commands.length > 0) {
      const firstCmd = commands.find(cmd => cmd._ !== '_');
      if (firstCmd) {
        input.value = parseCommand(JSON.stringify(firstCmd));
      }
    }

    const sendBtn = document.createElement('button');
    sendBtn.textContent = 'Send';

    cmdRow.append(select, input, sendBtn);

    // Slider row
    const sliderRow = document.createElement('div');
    sliderRow.className = 'slider-container';

    const label = document.createElement('span');
    label.className = 'slider-label';
    label.textContent = 'Set Target Freq:';

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = 3;
    slider.max = 800;
    slider.value = 100;

    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'slider-value';
    valueDisplay.textContent = '100 Hz';

    slider.addEventListener('input', () => {
      const val = slider.value;
      const percent = ((val - 3) / (800 - 3)) * 100;
      slider.style.setProperty('--value', `${percent}%`);
      valueDisplay.textContent = val + ' Hz';
    });

    slider.addEventListener('change', () => {
      const payload = {
        component: 'pulse',
        action: `0:${slider.value}`,
        insert_id: 'pulser'
      };
      const jsonString = JSON.stringify(payload);
      input.value = jsonString;
      sendCommand(jsonString);
    });

    slider.dispatchEvent(new Event('input'));

    sliderRow.append(label, slider, valueDisplay);

    // Log
    const logDiv = document.createElement('div');
    logDiv.className = 'fs-log';
    window.fsLogger = createLogger(logDiv);

    // Chart container
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';

    const canvas = document.createElement('canvas');
    canvas.id = 'flowRateCanvas';

    const fallback = document.createElement('div');
    fallback.className = 'chart-fallback';
    fallback.textContent = 'Initializing chart...';

    chartContainer.append(canvas, fallback);

    // Initialize chart via module API
    setTimeout(() => {
      if (window.FlowRateChart) {
        window.FlowRateChart.init('flowRateCanvas', fallback);
      } else {
        fallback.textContent = '⚠ chart_plotter.js not loaded';
        fallback.style.color = '#f44336';
      }
    }, 0);

    // ── Event: Combobox change ──
    select.addEventListener('change', () => {
      const rawValue = select.value;
      
      // Skip separator entries (those with only "_": "_")
      try {
        const obj = JSON.parse(rawValue);
        if (obj._ === '_' && Object.keys(obj).length === 1) {
          return; // Don't update input for separators
        }
      } catch (e) {
        // Not JSON, proceed
      }

      input.value = parseCommand(rawValue);
    });

    // ── Event: Send button ──
    sendBtn.addEventListener('click', () => {
      const cmd = input.value.trim();
      if (!cmd) return;

      let display = cmd;
      try {
        const parsed = JSON.parse(cmd);
        if (parsed?.action) {
          display = parsed.action;
        }
      } catch {}

      window.fsLogger(`TX: ${display}`);
      sendCommand(cmd);
    });

    // ── Event: Enter key ──
    input.addEventListener('keypress', e => {
      if (e.key === 'Enter') sendBtn.click();
    });

    frame.append(cmdRow, sliderRow, logDiv, chartContainer);
    return frame;
  }

  // ══════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ══════════════════════════════════════════════════════════════

  function init() {
    const tabContainer = document.querySelector('.tab-container');
    if (!tabContainer) {
      console.error('FlowSensor UI: .tab-container not found');
      return;
    }

  // --- Read config from app_cfg.js ---
  const cmd_panel_cfg =
    typeof appCfg !== "undefined" &&
    appCfg.ui &&
    appCfg.ui.flowsensor_Panel
      ? appCfg.ui.flowsensor_Panel
      : null;

  const framesCfg =
    cmd_panel_cfg && Array.isArray(cmd_panel_cfg.Frames)
      ? cmd_panel_cfg.Frames
      : [];

  const frames = cmd_panel_cfg.Frames
  console.log("Command_Panel cfg:", cmd_panel_cfg,frames);


    const panelId = 'uiFlowSensorTab';
    let panel = document.getElementById(panelId);

    if (!panel) {
      panel = document.createElement('div');
      panel.id = panelId;
      panel.className = 'tab-content';

      const logContainer = document.getElementById('logContainer');
      if (logContainer?.parentNode) {
        logContainer.parentNode.insertBefore(panel, logContainer);
      } else {
        document.body.appendChild(panel);
      }
    }

    const tabBtn = document.createElement('button');
    tabBtn.className = 'tab';
    tabBtn.textContent = 'FlowSensor';
    tabBtn.onclick = e => {
      if (typeof openTab === 'function') {
        openTab(e, panelId);
      } else {
        panel.style.display = 'block';
      }
    };
    tabContainer.appendChild(tabBtn);

    injectCSS();

    const wrapper = document.createElement('div');
    wrapper.className = 'fs-wrapper';

    // ✅ Use first frame from config (or fallback)
    const frameCfg = frames[0] ?? {
      Title: 'FlowSensor',
      Command: [
        { "_": "Default Command", "component": "pulse", "action": "0:100", "insert_id": "pulser" }
      ]
    };

    wrapper.appendChild(buildFrame(frameCfg));

    panel.appendChild(wrapper);

    if (window.fsLogger) {
      window.fsLogger('✓ FlowSensor ready. Waiting for data...', 'warning');
    }
  }

  // ══════════════════════════════════════════════════════════════
  // ENTRY POINT
  // ══════════════════════════════════════════════════════════════

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();