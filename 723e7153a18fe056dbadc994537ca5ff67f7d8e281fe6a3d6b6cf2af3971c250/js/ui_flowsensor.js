// ui_flowsensor.js
// Single-frame command panel for FlowSensor tab
// Chart title now shows the latest flow rate dynamically

// ── Globals ────────────────────────────────────────────────
window.fsLogger = null;

// State for flow rate calculation & chart
let lastAccCount = null;
let lastTimestamp = null;
let flowRateChart = null;
let rateData = [];
let latestRate = 0;  // ← NEW: track the most recent flow rate for title

// Load Chart.js + date adapter from CDN
if (!window.Chart) {
  const chartScript = document.createElement('script');
  chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js';
  document.head.appendChild(chartScript);

  const adapterScript = document.createElement('script');
  adapterScript.src = 'https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3.0.0/dist/chartjs-adapter-date-fns.bundle.min.js';
  adapterScript.onload = () => {
    console.log('Chart.js + date-fns adapter loaded');
    if (document.getElementById('flowRateCanvas') && !flowRateChart) {
      initChart();
    }
  };
  adapterScript.onerror = () => console.error('Failed to load date-fns adapter');
  document.head.appendChild(adapterScript);
}

window.onFlowSensorData = function (cmd) {
  if (!cmd || typeof cmd !== 'object' || !window.fsLogger) return;

  console.log('onFlowSensorData', cmd);

  const flowrate = Number(cmd.cps ?? cmd.data ?? null);
  const currentAcc = Number(cmd.acc_cnt ?? cmd.data ?? null);

  if (currentAcc === null || isNaN(currentAcc)) {
    window.fsLogger(`RX: invalid data`, 'warning');
    return;
  }

  const now = Date.now();
  let rate = 0;
  let rateText = ' → first reading';

  if (lastAccCount !== null && lastTimestamp !== null) {
    const Δcount = currentAcc - lastAccCount;
    const Δt_ms  = now - lastTimestamp;
    const Δt_sec = Δt_ms / 1000;

    if (Δt_sec > 0.001) {
      rate = Δcount / Δt_sec;
      rateText = ` → ${rate.toFixed(1)} pulses/sec`;
    } else {
      rateText = ' → (Δt too small)';
    }
  }

  // Update latest rate for chart title
  latestRate = rate;

  window.fsLogger(`RX: acc=${currentAcc}  |  ${flowrate ? flowrate.toFixed(1)+' cps' : '—'}${rateText}`);

  // Update chart (last 20 seconds)
  if (flowRateChart) {
    const point = { x: now, y: rate || 0 };
    rateData.push(point);

    const cutoff = now - 20000;
    rateData = rateData.filter(p => p.x >= cutoff);

    flowRateChart.data.datasets[0].data = rateData;
    flowRateChart.options.scales.x.min = now - 20000;
    flowRateChart.options.scales.x.max = now;

    // Update title dynamically
    flowRateChart.options.plugins.title.text = 
      `Real-time Flow Rate (last 20 s) — Latest: ${latestRate.toFixed(1)} pulses/sec`;

    flowRateChart.update('none');
    console.log('Chart updated – visible points:', rateData.length);
  } else {
    console.warn('Chart not ready yet – skipping update');
  }

  lastAccCount  = currentAcc;
  lastTimestamp = now;
};


document.addEventListener('DOMContentLoaded', () => {
  const tabContainer = document.querySelector('.tab-container');
  if (!tabContainer) {
    console.error('FlowSensor UI: .tab-container not found');
    return;
  }

  const panelCfg = appCfg?.ui?.flowsensor_Panel ?? null;
  const frames = Array.isArray(panelCfg?.Frames) ? panelCfg.Frames : [];

  console.log('FlowSensor panel config:', panelCfg);

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
    if (typeof openTab === 'function') openTab(e, panelId);
    else panel.style.display = 'block';
  };
  tabContainer.appendChild(tabBtn);

  if (!document.getElementById('ui-flowsensor-css')) {
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
        min-height: 100px;
        max-height: 100px;
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
      .fs-log-entry.warning {
        color: #ff9800;
      }

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
        -webkit-appearance: none;
        appearance: none;
        height: 8px;
        background: #e0e0e0;
        border-radius: 4px;
        outline: none;
        flex: 1;
        background: linear-gradient(to right, #0a64d1 0%, #0a64d1 var(--value, 0%), #e0e0e0 var(--value, 0%), #e0e0e0 100%);
      }
      input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        background: #0a64d1;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        transition: all 0.15s;
      }
      input[type="range"]::-webkit-slider-thumb:hover,
      input[type="range"]::-webkit-slider-thumb:active {
        background: #094fc2;
        transform: scale(1.15);
      }
      input[type="range"]::-moz-range-thumb {
        width: 20px;
        height: 20px;
        background: #0a64d1;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      }
      input[type="range"]::-moz-range-track {
        height: 8px;
        background: #e0e0e0;
        border-radius: 4px;
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
    `;
    document.head.appendChild(style);
  }

  const createLogger = logDiv => {
    logDiv.addEventListener('dblclick', () => logDiv.replaceChildren());

    return (message, className = '') => {
      const now = new Date();
      const time = now.toLocaleTimeString([], {hour12: false});
      const ms = String(now.getMilliseconds()).padStart(3, '0').slice(0,2);
      const ts = `${time}.${ms}`;

      const line = document.createElement('div');
      line.className = 'fs-log-entry' + (className ? ' ' + className : '');
      line.textContent = `[${ts}] ${message}`;

      logDiv.appendChild(line);
      logDiv.scrollTop = logDiv.scrollHeight;
    };
  };

  const sendCommand = cmd => {
    if (typeof sendGlbCmd === 'function') {
      sendGlbCmd(cmd);
    } else {
      console.log('FlowSensor →', cmd);
    }
  };

  const buildFrame = (cfg = {}) => {
    const frame = document.createElement('div');
    frame.className = 'fs-frame';

    const title = document.createElement('div');
    title.className = 'fs-title';
    title.textContent = cfg.Title || 'FlowSensor';
    frame.appendChild(title);

    const cmdRow = document.createElement('div');
    cmdRow.className = 'fs-row';

    const select = document.createElement('select');
    Object.assign(select.style, { width: '160px', minWidth: '160px', flex: '0 0 auto' });

    const commands = Array.isArray(cfg.Command) ? cfg.Command : [];
    commands.forEach(cmd => {
      const opt = document.createElement('option');
      opt.textContent = JSON.stringify(cmd);
      select.appendChild(opt);
    });

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter command (JSON or text)';
    input.style.flex = '1 1 auto';

    if (commands.length > 0) input.value = JSON.stringify(commands[0]);

    const sendBtn = document.createElement('button');
    sendBtn.textContent = 'Send';
    sendBtn.style.marginLeft = 'auto';

    cmdRow.append(select, input, sendBtn);

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
    slider.step = 1;

    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'slider-value';
    valueDisplay.textContent = '100';

    const updateVisual = () => {
      const val = slider.value;
      slider.style.setProperty('--value', val);
      valueDisplay.textContent = val + " Hz";
    };

    const sendOnRelease = () => {
      const val = Number(slider.value);
      const cmdPayload = {
        component: "pulse",
        action: `0:${val}`,
        insert_id: "pulser"
      };
      const jsonString = JSON.stringify(cmdPayload);
      input.value = jsonString;
      sendCommand(jsonString);
    };

    slider.addEventListener('input', updateVisual);
    slider.addEventListener('change', sendOnRelease);
    updateVisual();

    sliderRow.append(label, slider, valueDisplay);

    const logDiv = document.createElement('div');
    logDiv.className = 'fs-log';

    const log = createLogger(logDiv);
    window.fsLogger = log;

    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';

    const canvas = document.createElement('canvas');
    canvas.id = 'flowRateCanvas';
    chartContainer.appendChild(canvas);

    const fallback = document.createElement('div');
    fallback.style.position = 'absolute';
    fallback.style.top = '50%';
    fallback.style.left = '50%';
    fallback.style.transform = 'translate(-50%, -50%)';
    fallback.style.color = '#888';
    fallback.style.fontSize = '14px';
    fallback.textContent = 'Chart loading...';
    chartContainer.appendChild(fallback);

    const initChart = () => {
      if (!window.Chart || flowRateChart) return;

      console.log('Initializing chart');

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Cannot get canvas context');
        fallback.textContent = 'Canvas error';
        return;
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
            legend: { display: true, labels: { color: '#ddd', font: { size: 12 } } },
            title: {
              display: true,
              text: () => `Real-time Flow Rate (last 20 s) — Latest: ${latestRate.toFixed(1)} pulses/sec`,
              color: '#eee',
              font: { size: 14 }
            }
          },
          scales: {
            x: {
              type: 'time',
              time: { unit: 'second', displayFormats: { second: 'HH:mm:ss' } },
              ticks: { color: '#aaa', maxTicksLimit: 10, maxRotation: 45 },
              grid: { color: '#333' },
              min: Date.now() - 20000,
              max: Date.now()
            },
            y: {
              beginAtZero: true,
              suggestedMax: 300,
              ticks: { color: '#aaa', stepSize: 50 },
              grid: { color: '#333' },
              title: { display: true, text: 'pulses/sec', color: '#ccc' }
            }
          }
        }
      });

      fallback.style.display = 'none';
      console.log('Chart initialized successfully');
    };

    if (window.Chart) {
      initChart();
    }

    select.addEventListener('change', () => {
      let value = select.value.trim();
      if (value && typeof _isJsonStr === 'function' && _isJsonStr(value)) {
        try {
          let obj = JSON.parse(value);
          if (typeof removeKeysWithPrefix === 'function') {
            obj = removeKeysWithPrefix(JSON.stringify(obj));
          }
          if (obj?.macro) value = JSON.stringify(obj.macro);
        } catch {}
      }
      input.value = value;
    });

    sendBtn.addEventListener('click', () => {
      const cmd = input.value.trim();
      if (!cmd) return;

      let display = cmd;
      try {
        if (cmd.startsWith('{')) {
          const parsed = JSON.parse(cmd);
          if (parsed?.action) display = parsed.action;
        }
      } catch {}

      log(`TX: ${display}`);
      sendCommand(cmd);
    });

    frame.append(cmdRow, sliderRow, logDiv, chartContainer);
    return frame;
  };

  const wrapper = document.createElement('div');
  wrapper.className = 'fs-wrapper';

  const firstFrameCfg = frames[0] ?? { Title: 'FlowSensor', Command: [] };
  wrapper.appendChild(buildFrame(firstFrameCfg));

  panel.appendChild(wrapper);

  if (window.fsLogger) {
    window.fsLogger('Flow sensor ready. Waiting for acc_cnt data...', 'warning');
  }
});