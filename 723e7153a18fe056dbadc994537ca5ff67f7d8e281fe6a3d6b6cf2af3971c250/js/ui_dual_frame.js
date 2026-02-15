// ui_dual_frame.js
// New tab with frames defined by appCfg.ui.Command_Panel.Frames
// Each frame:
//   Row1: Combobox + Text input + [Send] button
//   Row2: logcontainer (local per frame)

// Global logger function references so other JS (onSerialRx) can log into frames
window.serial1Logger = null; // e.g. "To STM"
window.serial2Logger = null; // e.g. "To BT"

// Global function so other JS files (e.g. serial handler) can call it
// Expected cmd object: { dev: "serial1"|"serial2", data: "..." }
window.onSerialRx = function (cmd) {
  console.log("Serial RX:", cmd);

  if (!cmd || typeof cmd !== "object") return;

  const dev = cmd.dev || cmd["dev"];
  const data = cmd.data || cmd["data"];

  if (dev === "serial1") {
    if (window.serial1Logger) {
      window.serial1Logger(`RX: ${data}`);
    }
  } else if (dev === "serial2") {
    if (window.serial2Logger) {
      window.serial2Logger(`RX: ${data}`);
    }
  }
};

document.addEventListener("DOMContentLoaded", function () {
  const tabContainer = document.querySelector(".tab-container");
  if (!tabContainer) {
    console.error("ui_dual_frame.js: .tab-container not found");
    return;
  }

  // --- Read config from app_cfg.js ---
  const cmd_panel_cfg =
    typeof appCfg !== "undefined" &&
    appCfg.ui &&
    appCfg.ui.Command_Panel
      ? appCfg.ui.Command_Panel
      : null;

  const framesCfg =
    cmd_panel_cfg && Array.isArray(cmd_panel_cfg.Frames)
      ? cmd_panel_cfg.Frames
      : [];

  console.log("Command_Panel cfg:", cmd_panel_cfg);

  // --- Create / locate content panel ---
  const panelId = "dualFrameTab";
  let panel = document.getElementById(panelId);
  if (!panel) {
    panel = document.createElement("div");
    panel.id = panelId;
    panel.className = "tab-content";

    const logContainer = document.getElementById("logContainer");
    if (logContainer && logContainer.parentNode) {
      logContainer.parentNode.insertBefore(panel, logContainer);
    } else {
      document.body.appendChild(panel);
    }
  }

  // --- Create the tab button ---
  const tabBtn = document.createElement("button");
  tabBtn.className = "tab";
  tabBtn.textContent = "Command Terminal";
  tabBtn.onclick = (e) =>
    typeof openTab === "function"
      ? openTab(e, panelId)
      : (panel.style.display = "block");
  tabContainer.appendChild(tabBtn);

  // --- Inject CSS once ---
  if (!document.getElementById("dual-frame-css")) {
    const style = document.createElement("style");
    style.id = "dual-frame-css";
    style.textContent = `
      .dual-wrapper {
        display: flex;
        flex-direction: column;
        gap: 16px;
        max-width: 900px;
        font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
      }
      .dual-frame {
        border: 2px solid #0a64d1ff;
        border-radius: 10px;
        padding: 10px;
        background: transparent;  /* match page background */
        box-shadow: none;         /* remove white card feel */
      }
      .dual-frame-title {
        font-size: 13px;
        font-weight: 600;
        color: #0f172a;
        margin-bottom: 4px;
      }
      .dual-row {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: nowrap;
      }
      .dual-log {
        width: 100%;
        min-height: 40px;
        max-height: 200px;
        overflow-y: auto;
        border-radius: 5px;
        border: 2px solid black;
        background: black;
        color: white;
        padding: 1px;
        font-family: "Courier New", Courier, monospace;
        font-size: 12px;
        line-height: 1.2;
      }
      .dual-log-entry {
        margin: 0;
        padding: 1px;
        border-bottom: 1px solid #444;
        background: black;
        color: white;
        font-family: "Courier New", Courier, monospace;
        font-size: 12px;
        line-height: 1.2;
        text-align: left;
      }
    `;
    document.head.appendChild(style);
  }

  // --- Helper: per-frame logger (height limited to ~5 lines + scrollbar) ---
function makeFrameLogger(logDiv) {

  logDiv.style.height = "80px";      
  logDiv.style.maxHeight = "80px";
  logDiv.style.overflowY = "auto";

  logDiv.addEventListener("dblclick", () => {
    logDiv.innerHTML = "";
  });

  return function addToLog(message) {

    const now = new Date();
    const base = now.toLocaleTimeString();  
    const cs = String(Math.floor(now.getMilliseconds() / 10)).padStart(2, "0");
    const ts = `${base}:${cs}`;

    const line = document.createElement("p");
    line.className = "dual-log-entry";
    line.textContent = `[${ts}] ${message}`;

    logDiv.appendChild(line);
    logDiv.scrollTop = logDiv.scrollHeight;
  };
}


  // --- Common send function (like ble_ui.js -> sendCmd) ---
  function sendCmd(cmd) {
    if (typeof sendGlbCmd === "function") {
      sendGlbCmd(cmd);
    } else {
      console.log("dual_frame sendCmd:", cmd);
    }
  }

  // --- Build one frame from config (Title + Command array) ---
  function buildFrame(frameCfg, index) {
    const frame = document.createElement("div");
    frame.className = "dual-frame";

    const title = document.createElement("div");
    title.className = "dual-frame-title";
    const titleText =
      (frameCfg && frameCfg.Title) || `Frame ${index}`;
    title.textContent = titleText;
    frame.appendChild(title);

    // Row 1: combobox + input + send
    const row1 = document.createElement("div");
    row1.className = "dual-row";

    // Combobox with fixed-size styles
    const comboBox = document.createElement("select");
    // comboBox.id = "comboBox"; // avoid duplicate IDs across frames
    comboBox.style.width = "150px";      // fixed width
    comboBox.style.minWidth = "150px";   // prevent shrinking
    comboBox.style.maxWidth = "150px";   // prevent expanding
    comboBox.style.flex = "none";        // do not grow in flexbox

    // Populate combobox from frameCfg.Command (JSON options like ble_ui.js)
    const commands =
      frameCfg && Array.isArray(frameCfg.Command) ? frameCfg.Command : [];

    commands.forEach((cmdObj) => {
      const option = document.createElement("option");
      option.textContent = JSON.stringify(cmdObj); // same as ble_ui.js
      comboBox.appendChild(option);
    });

    // Input text box
    const inputBox = document.createElement("input");
    inputBox.type = "text";
    inputBox.placeholder = "Enter text here";
    inputBox.style.flex = "1"; // auto-expand to fill remaining space

    // Default to first command (like ble_ui.js)
    if (commands.length > 0) {
      inputBox.value = JSON.stringify(commands[0]);
    }

    // Send button
    const sendButton = document.createElement("button");
    sendButton.textContent = "Send";
    sendButton.style.marginLeft = "auto";

    row1.appendChild(comboBox);
    row1.appendChild(inputBox);
    row1.appendChild(sendButton);

    // Row 2: log container
    const row2 = document.createElement("div");
    row2.className = "dual-row";

    const logDiv = document.createElement("div");
    logDiv.className = "dual-log";
    row2.appendChild(logDiv);

    frame.appendChild(row1);
    frame.appendChild(row2);

    const log = makeFrameLogger(logDiv);

    // Register this frame's logger to globals for onSerialRx()
    const titleLower = String(titleText).toLowerCase();
    if (
      !window.serial1Logger &&
      (index === 1 ||
        titleLower.includes("stm") ||
        titleLower.includes("serial1"))
    ) {
      window.serial1Logger = log;
    }
    if (
      !window.serial2Logger &&
      (index === 2 ||
        titleLower.includes("bt") ||
        titleLower.includes("serial2"))
    ) {
      window.serial2Logger = log;
    }

    // --- BLE-style combobox change logic ---
    comboBox.addEventListener("change", function () {
      let selText = comboBox.value;

      // _isJsonStr and removeKeysWithPrefix are global helpers from your app
      if (typeof _isJsonStr === "function" && _isJsonStr(selText)) {
        let selObj =
          typeof removeKeysWithPrefix === "function"
            ? removeKeysWithPrefix(selText)
            : JSON.parse(selText);

        if ("macro" in selObj) {
          selText = JSON.stringify(selObj["macro"]);
        } else {
          selText = JSON.stringify(selObj);
        }

        console.log([
          arguments.callee.name,
          selText,
          selObj,
          "macro" in selObj,
        ]);
      }

      inputBox.value = selText;
    });

    // --- Send button click logic (BLE-style) ---
    sendButton.addEventListener("click", function () {
      const cmdStr = inputBox.value;
      let displayAction = cmdStr;

      // Try to decode JSON and extract 'action'
      try {
        if (typeof cmdStr === "string" && cmdStr.trim().startsWith("{")) {
          const obj = JSON.parse(cmdStr);

          if (obj && typeof obj === "object" && "action" in obj) {
            displayAction = obj.action;
          }
        }
      } catch (e) {
        console.warn("TX JSON decode failed:", e);
      }

      log(`TX: ${displayAction}`);
      sendCmd(cmdStr);
    });


    return frame;
  }

  // --- Build all frames into the panel ---
  const wrapper = document.createElement("div");
  wrapper.className = "dual-wrapper";

  if (framesCfg.length > 0) {
    framesCfg.forEach((frameCfg, idx) => {
      wrapper.appendChild(buildFrame(frameCfg, idx + 1));
    });
  } else {
    // Fallback: two empty frames if config missing
    wrapper.appendChild(buildFrame({ Title: "Frame 1", Command: [] }, 1));
    wrapper.appendChild(buildFrame({ Title: "Frame 2", Command: [] }, 2));
  }

  panel.appendChild(wrapper);
});
