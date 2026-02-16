// chart_plotter.js
// Standalone real-time chart plotter for flow rate data
// Requires: Chart.js + chartjs-adapter-date-fns loaded in HTML

(() => {
  'use strict';

  // ══════════════════════════════════════════════════════════════
  // MODULE STATE
  // ══════════════════════════════════════════════════════════════

  let chart = null;
  let dataPoints = [];
  let latestRate = 0;

  const CONFIG = {
    windowSize: 20000,      // 20 seconds
    maxDataPoints: 200,
    updateMode: 'none',     // Chart.js update mode (no animation)
  };

  // ══════════════════════════════════════════════════════════════
  // PUBLIC API
  // ══════════════════════════════════════════════════════════════

  /**
   * Initialize chart on a canvas element
   * @param {string} canvasId - ID of the canvas element
   * @param {HTMLElement} [fallbackDiv] - Optional fallback element for error messages
   * @returns {boolean} Success status
   */
  function init(canvasId, fallbackDiv = null) {
    if (chart) {
      console.warn('Chart already initialized');
      return true;
    }

    if (typeof Chart === 'undefined') {
      const msg = 'Chart.js not loaded! Add <script> tags in HTML.';
      console.error(msg);
      if (fallbackDiv) {
        fallbackDiv.textContent = '⚠ Chart.js missing';
        fallbackDiv.style.color = '#f44336';
      }
      return false;
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

      chart = new Chart(ctx, {
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
            data: dataPoints
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
              text: 'Real-time Flow Rate (last 20 s) — Latest: 0.0 pulses/sec',
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

      console.log('✓ Chart initialized');
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
   * Add a new data point and update chart
   * @param {number} rate - Flow rate value (pulses/sec)
   * @param {number} [timestamp] - Optional timestamp (defaults to now)
   */
  function addDataPoint(rate, timestamp = Date.now()) {
    if (!chart) {
      console.warn('Chart not initialized');
      return;
    }

    latestRate = rate;

    // Add new point
    dataPoints.push({ x: timestamp, y: rate });

    // Remove old data outside window
    const cutoff = timestamp - CONFIG.windowSize;
    dataPoints = dataPoints.filter(p => p.x >= cutoff);

    // Limit array size
    if (dataPoints.length > CONFIG.maxDataPoints) {
      dataPoints = dataPoints.slice(-CONFIG.maxDataPoints);
    }

    // Update chart
    chart.data.datasets[0].data = dataPoints;
    chart.options.scales.x.min = cutoff;
    chart.options.scales.x.max = timestamp;

    // Update title
    chart.options.plugins.title.text =
      `Real-time Flow Rate (last 20 s) — Latest: ${latestRate.toFixed(1)} pulses/sec`;

    chart.update(CONFIG.updateMode);
  }

  /**
   * Clear all data points
   */
  function clear() {
    if (!chart) return;

    dataPoints = [];
    latestRate = 0;
    chart.data.datasets[0].data = dataPoints;
    chart.options.plugins.title.text =
      'Real-time Flow Rate (last 20 s) — Latest: 0.0 pulses/sec';
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
      dataPoints = [];
      latestRate = 0;
      console.log('Chart destroyed');
    }
  }

  /**
   * Get current chart instance
   * @returns {Chart|null}
   */
  function getChart() {
    return chart;
  }

  /**
   * Get latest flow rate
   * @returns {number}
   */
  function getLatestRate() {
    return latestRate;
  }

  /**
   * Update config (e.g., window size)
   * @param {Object} newConfig
   */
  function configure(newConfig) {
    Object.assign(CONFIG, newConfig);
    console.log('Chart config updated:', CONFIG);
  }

  // ══════════════════════════════════════════════════════════════
  // EXPORT API
  // ══════════════════════════════════════════════════════════════

  window.FlowRateChart = {
    init,
    addDataPoint,
    clear,
    destroy,
    getChart,
    getLatestRate,
    configure
  };

})();