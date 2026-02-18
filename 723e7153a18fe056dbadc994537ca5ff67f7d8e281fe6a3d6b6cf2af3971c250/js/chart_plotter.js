// chart_plotter.js
// Real-time dual-line chart for RX and TX flow rates
// Displays separate 10-sample SMA for RX and TX in the title

(() => {
  'use strict';

  // ══════════════════════════════════════════════════════════════
  // MODULE STATE
  // ══════════════════════════════════════════════════════════════

  let chart = null;
  let dataPointsRX = [];     // RX rate points
  let dataPointsTX = [];     // TX rate points
  let latestRX = 0;
  let latestTX = 0;

  const CONFIG = {
    windowSize: 20000,       // 20 seconds sliding window
    maxDataPoints: 200,
    updateMode: 'none',      // no animation
    smaWindow: 10            // moving average over last 10 points
  };

  // ══════════════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════════════

  /**
   * Calculate simple moving average of the last N values
   * @param {Array<{x:number,y:number}>} points
   * @param {number} [window=CONFIG.smaWindow]
   * @returns {number}
   */
  function calculateSMA(points, window = CONFIG.smaWindow) {
    if (points.length < window) return 0;

    const recent = points.slice(-window);
    const sum = recent.reduce((acc, p) => acc + (p.y || 0), 0);
    return sum / recent.length;
  }

  // ══════════════════════════════════════════════════════════════
  // PUBLIC API
  // ══════════════════════════════════════════════════════════════

  /**
   * Initialize the chart on a canvas element
   * @param {string} canvasId - ID of the canvas
   * @param {HTMLElement} [fallbackDiv] - Optional fallback element for errors
   * @returns {boolean} Success
   */
  function init(canvasId, fallbackDiv = null) {
    if (chart) {
      console.warn('Chart already initialized');
      return true;
    }

    if (typeof Chart === 'undefined') {
      const msg = 'Chart.js not loaded. Include <script src="https://cdn.jsdelivr.net/npm/chart.js"></script> and adapter.';
      console.error(msg);
      if (fallbackDiv) {
        fallbackDiv.textContent = '⚠ Chart.js missing';
        fallbackDiv.style.color = '#f44336';
      }
      return false;
    }

    try {
      const canvas = document.getElementById(canvasId);
      if (!canvas) throw new Error(`Canvas #${canvasId} not found`);

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Cannot get 2D context');

      chart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            {
              label: 'RX Rate (pulses/sec)',
              borderColor: '#00ff9d',
              backgroundColor: 'rgba(0, 255, 157, 0.12)',
              borderWidth: 2,
              tension: 0.15,
              fill: true,
              pointRadius: 0,
              data: dataPointsRX
            },
            {
              label: 'TX Rate (pulses/sec)',
              borderColor: '#ff6b6b',
              backgroundColor: 'rgba(255, 107, 107, 0.12)',
              borderWidth: 2,
              tension: 0.15,
              fill: true,
              pointRadius: 0,
              data: dataPointsTX
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 0 },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: { color: '#ddd', font: { size: 12 } }
            },
            title: {
              display: true,
              text: 'Real-time Flow Rates (last 20 s) — RX: 0.0 | TX: 0.0 | SMA-10 RX: 0.0 | SMA-10 TX: 0.0',
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

      if (fallbackDiv) fallbackDiv.style.display = 'none';
      console.log('✓ Dual-line chart initialized');
      return true;

    } catch (err) {
      console.error('Chart init failed:', err);
      if (fallbackDiv) {
        fallbackDiv.textContent = `⚠ ${err.message}`;
        fallbackDiv.style.color = '#f44336';
      }
      return false;
    }
  }

  /**
   * Add new RX and TX data points and update chart + SMA values in title
   * @param {number} rxRate - RX flow rate (pulses/sec)
   * @param {number} txRate - TX flow rate (pulses/sec)
   * @param {number} [timestamp=Date.now()] - Timestamp in ms
   */
  function addDataPoint(rxRate, txRate, timestamp = Date.now()) {
    if (!chart) {
      console.warn('Chart not initialized');
      return;
    }

    latestRX = rxRate;
    latestTX = txRate;

    const point = { x: timestamp, y: 0 };

    // Add RX
    point.y = rxRate;
    dataPointsRX.push({ ...point });

    // Add TX
    point.y = txRate;
    dataPointsTX.push({ ...point });

    // Trim old data
    const cutoff = timestamp - CONFIG.windowSize;
    dataPointsRX = dataPointsRX.filter(p => p.x >= cutoff);
    dataPointsTX = dataPointsTX.filter(p => p.x >= cutoff);

    if (dataPointsRX.length > CONFIG.maxDataPoints) {
      dataPointsRX = dataPointsRX.slice(-CONFIG.maxDataPoints);
    }
    if (dataPointsTX.length > CONFIG.maxDataPoints) {
      dataPointsTX = dataPointsTX.slice(-CONFIG.maxDataPoints);
    }

    // ── Calculate separate 10-sample moving averages ─────────────────────
    const smaRX = calculateSMA(dataPointsRX);
    const smaTX = calculateSMA(dataPointsTX);

    // ── Update chart ─────────────────────────────────────────────────────
    chart.data.datasets[0].data = dataPointsRX;
    chart.data.datasets[1].data = dataPointsTX;

    chart.options.scales.x.min = cutoff;
    chart.options.scales.x.max = timestamp;

    // Update title with both SMAs
    chart.options.plugins.title.text =
      `Real-time Flow Rates (last 20 s) — RX: ${latestRX.toFixed(1)} (SMA-10: ${smaRX.toFixed(1)}) | TX: ${latestTX.toFixed(1)} (SMA-10: ${smaTX.toFixed(1)})`;

    chart.update(CONFIG.updateMode);
  }

  /**
   * Clear all data and reset chart
   */
  function clear() {
    if (!chart) return;

    dataPointsRX = [];
    dataPointsTX = [];
    latestRX = 0;
    latestTX = 0;

    chart.data.datasets[0].data = dataPointsRX;
    chart.data.datasets[1].data = dataPointsTX;

    chart.options.plugins.title.text =
      'Real-time Flow Rates (last 20 s) — RX: 0.0 (SMA-10: 0.0) | TX: 0.0 (SMA-10: 0.0)';

    chart.update(CONFIG.updateMode);
    console.log('Chart cleared');
  }

  /**
   * Destroy chart instance
   */
  function destroy() {
    if (chart) {
      chart.destroy();
      chart = null;
      dataPointsRX = [];
      dataPointsTX = [];
      latestRX = 0;
      latestTX = 0;
      console.log('Chart destroyed');
    }
  }

  /**
   * Update configuration options
   * @param {Object} newConfig
   */
  function configure(newConfig) {
    Object.assign(CONFIG, newConfig);
    console.log('Chart config updated:', CONFIG);
  }

  // Export public API
  window.FlowRateChart = {
    init,
    addDataPoint,
    clear,
    destroy,
    configure
  };

})();