// test.js
(function(window) {
    let timerInterval = null;
    let timerCount = 0;
    let updateCallback = null; // Callback function for display updates
    let timerIntervalDuration = 1000; // Default interval (1000ms)
    let startTime = null; // New: to track when the timer started
  
    // Initialize the timer with a callback function for display updates.
    // The callback will receive an object with { timer, elapsed }
    function initialize(callback) {
      updateCallback = callback;
      timerCount = 0;
      startTime = null; // Reset start time on initialization
    //   onTimer(); // Update immediately if needed.
    }
  
    // Update the display using the provided callback.
    // It now passes both timerCount and elapsed time (in seconds).
    function onTimer() {
      if (typeof updateCallback === "function") {
        let elapsed = startTime ? ((Date.now() - startTime) / 1000) : 0;
        updateCallback({ timer: timerCount, elapsed: elapsed });
      }
    }
  
    // Start the timer (increments every interval)
    function start() {
      if (!timerInterval) {
        startTime = Date.now(); // Capture the start time
        timerInterval = setInterval(() => {
          timerCount++;
          onTimer();
          // console.log("Timer:", timerCount);
        }, timerIntervalDuration);
      }
    }
  
    // Stop the timer
    function stop() {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }
  
    // Reset the timer count and update the display
    function reset() {
      timerCount = 0;
      startTime = Date.now();
      onTimer();
    }
  
    // Change the timer interval (in milliseconds).
    // If the timer is running, restart it with the new interval.
    function setIntervalTime(newInterval) {
      if (typeof newInterval !== "number" || newInterval <= 0) {
        console.error("Invalid interval time. Must be a positive number.");
        return;
      }
      timerIntervalDuration = newInterval;
      console.log("Timer interval set to", timerIntervalDuration, "ms");
      // If timer is currently running, restart it with the new interval.
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
          timerCount++;
          onTimer();
        }, timerIntervalDuration);
      }
    }
  
    // Expose the timer functions globally
    window.TimerModule = {
      initialize: initialize,
      start: start,
      stop: stop,
      reset: reset,
      setIntervalTime: setIntervalTime,
      getCount: () => timerCount
    };
  })(window);
  