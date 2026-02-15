document.addEventListener("DOMContentLoaded", function () {
    const logContainer = document.getElementById("logContainer");

    if (!logContainer) {
        console.error("Error: Log container not found!");
        return;
    }

    // Style log container dynamically
    logContainer.style.border = "2px solid black"; // ✅ Black border
    logContainer.style.backgroundColor = "black"; // ✅ Black background
    logContainer.style.color = "white"; // ✅ White text
    logContainer.style.padding = "1px";
    logContainer.style.marginTop = "10px";
    logContainer.style.borderRadius = "5px";
    logContainer.style.minHeight = "5px";
    logContainer.style.overflow = "hidden";
    logContainer.style.minHeight = "1px"; // ✅ Minimum height
    logContainer.style.maxHeight = "200px"; // ✅ Limit max height
    logContainer.style.overflowY = "auto"; // ✅ Enable vertical scrolling    
    logContainer.style.fontFamily = "'Courier New', Courier, monospace";
    logContainer.style.fontSize = "12px"; // ✅ Force consistent font size
    logContainer.style.lineHeight = "1.2"; // ✅ Prevent browser auto-scaling

    function addToLog(message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement("p");
        logEntry.textContent = `[${timestamp}] ${message}`;
        logEntry.style.borderBottom = "1px solid #444";
        logEntry.style.padding = "1px";
        logEntry.style.margin = "0";
        logEntry.style.fontFamily = "'Courier New', Courier, monospace";
        logEntry.style.textAlign = "left";
        logEntry.style.backgroundColor = "black";
        logEntry.style.color = "white";    
        logEntry.style.fontSize = "12px"; // ✅ Ensure each log entry has a fixed font size
        logEntry.style.lineHeight = "1.2"; // ✅ Keep line spacing consistent

        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }


    // Double-click to clear log
    logContainer.addEventListener("dblclick", function () {
        logContainer.innerHTML = "";
    });

    // Expose log function globally
    window.addToLogContainer = addToLog;
});
