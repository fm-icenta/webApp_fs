// ui_flowsensor.js
// FlowSensor UI with offline Chart.js (loaded via HTML script tags)

(() => {
  'use strict';

  // ══════════════════════════════════════════════════════════════
  // GLOBALS & STATE
  // ══════════════════════════════════════════════════════════════

  window.fsLogger = null;

  let lastAccCount = null;
  let lastTimestamp = null;
  let flowRateChart = null;
  let rateData = [];
  let latestRate = 0;

  const CONFIG = {
    windowSize: 20000,    // 20 seconds
    maxDataPoints: 200,
  };

  // ══════════════════════════════════════════════════════════════
  // CHART INITIALIZATION
  // ══════════════════════════════════════════════════════════════

  function initChart(canvasId, fallbackDiv) {
    if (flowRateChart) {
      console.warn('Chart already initialized');
      return;
    }

    // Verify Chart.js is loaded
    if (typeof Chart === 'undefined') {
      console.error('Chart.js not loaded! Add <script> tags in HTML.');
      if (fallbackDiv) {
        fallbackDiv.textContent = '⚠ Chart.js not found';
        fallbackDiv.style.color = '#f44336';
      }
      return;
    }

    try {
      const canvas = document.getElementById(canvasId);
      if (!canvas) {
        throw new Error(`Canvas #${canvasId} not found`);
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Cannot get 2D context');
      }

      flowRateChart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [{
            label: 'Flow Rate (pulses/sec)',
            borderColor: '#00ff9d',
            backgroundColor: 'rgba(0, 255, 157, 0.12)',
            borderWidth: 2,
            tension: 0.15,
            fill: true,
            pointRadius: 0,
            data: rateData
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 0 },
          plugins: {
            legend: {
              display: true,
              labels: { color: '#ddd', font: { size: 12 } }
            },
            title: {
              display: true,
              text: `Real-time Flow Rate (last 20 s) — Latest: 0.0 pulses/sec`,
              color: '#eee',
              font: { size: 14 }
            }
          },
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'second',
                displayFormats: { second: 'HH:mm:ss' }
              },
              ticks: { 
                color: '#aaa', 
                maxTicksLimit: 10, 
                maxRotation: 45 
              },
              grid: { color: '#333' },
              min: Date.now() - CONFIG.windowSize,
              max: Date.now()
            },
            y: {
              beginAtZero: true,
              suggestedMax: 300,
              ticks: { color: '#aaa', stepSize: 50 },
              grid: { color: '#333' },
              title: { 
                display: true, 
                text: 'pulses/sec', 
                color: '#ccc' 
              }
            }
          }
        }
      });

      if (fallbackDiv) {
        fallbackDiv.style.display = 'none';
      }

      console.log('✓ Chart initialized successfully');

    } catch (err) {
      console.error('Chart initialization failed:', err);
      if (fallbackDiv) {
        fallbackDiv.textContent = `⚠ Chart error: ${err.message}`;
        fallbackDiv.style.color = '#f44336';
      }
    }
  }

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

    latestRate = rate;

    const flowrate = Number(cmd.cps ?? NaN);
    const cpsText = !isNaN(flowrate) ? flowrate.toFixed(1) + ' cps' : '—';

    window.fsLogger(`RX: acc=${currentAcc}  |  ${cpsText}${rateText}`);

    // Update chart
    if (flowRateChart) {
      rateData.push({ x: now, y: rate });

      // Remove old data outside window
      const cutoff = now - CONFIG.windowSize;
      rateData = rateData.filter(p => p.x >= cutoff);

      // Limit array size
      if (rateData.length > CONFIG.maxDataPoints) {
        rateData = rateData.slice(-CONFIG.maxDataPoints);
      }

      flowRateChart.data.datasets[0].data = rateData;
      flowRateChart.options.scales.x.min = cutoff;
      flowRateChart.options.scales.x.max = now;

      // Update title with latest rate
      flowRateChart.options.plugins.title.text =
        `Real-time Flow Rate (last 20 s) — Latest: ${latestRate.toFixed(1)} pulses/sec`;

      flowRateChart.update('none');
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

      // Prevent memory bloat
      while (logDiv.children.length > 100) {
        logDiv.firstChild.remove();
      }
    };
  }

  function sendCommand(cmd) {
    if (typeof sendGlbCmd === 'function') {
      sendGlbCmd(cmd);
    } else {
      console.log('FlowSensor →', cmd);
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

    const commands = Array.isArray(cfg.Command) ? cfg.Command : [];
    commands.forEach(cmd => {
      const opt = document.createElement('option');
      opt.textContent = JSON.stringify(cmd);
      select.appendChild(opt);
    });

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter command (JSON or text)';
    input.style.flex = '1';
    input.value = commands.length > 0 ? JSON.stringify(commands[0]) : '';

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

    // Chart
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';

    const canvas = document.createElement('canvas');
    canvas.id = 'flowRateCanvas';

    const fallback = document.createElement('div');
    fallback.className = 'chart-fallback';
    fallback.textContent = 'Initializing chart...';

    chartContainer.append(canvas, fallback);

    // Initialize chart
    setTimeout(() => initChart('flowRateCanvas', fallback), 0);

    // Event listeners
    select.addEventListener('change', () => {
      input.value = select.value;
    });

    sendBtn.addEventListener('click', () => {
      const cmd = input.value.trim();
      if (!cmd) return;

      let display = cmd;
      try {
        const parsed = JSON.parse(cmd);
        if (parsed?.action) display = parsed.action;
      } catch {}

      window.fsLogger(`TX: ${display}`);
      sendCommand(cmd);
    });

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

    const panelCfg = window.appCfg?.ui?.flowsensor_Panel ?? {};
    const frames = Array.isArray(panelCfg.Frames) ? panelCfg.Frames : [];

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

    const frameCfg = frames[0] ?? { Title: 'FlowSensor', Command: [] };
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