// glb_ui.js — WebApp UI with normal buttons for sys/rsl and a toggle for home
// Rows:
// 1) 3-position slide switch: Fast / APP / Slow
// 2) Two normal buttons: sys_on_off, rsl_on_off + one toggle: home_lo/home_hi
// 3) Text box to display change events
//
document.addEventListener("DOMContentLoaded", function () {
  // Find tab container; create a new tab + content
  const tabContainer = document.querySelector(".tab-container");
  if (!tabContainer) {
    console.error("glb_ui.js: .tab-container not found");
    return;
  }

  // Create the content panel
  const panelId = "glbWebAppTab";
  let panel = document.getElementById(panelId);
  if (!panel) {
    panel = document.createElement("div");
    panel.id = panelId;
    panel.className = "tab-content";
    // Insert before any log container if present; otherwise append to body
    const logContainer = document.getElementById("logContainer");
    if (logContainer && logContainer.parentNode) {
      logContainer.parentNode.insertBefore(panel, logContainer);
    } else {
      document.body.appendChild(panel);
    }
  }

  // Create the tab button
  const tabBtn = document.createElement("button");
  tabBtn.className = "tab";
  tabBtn.textContent = "WebUI";
  tabBtn.onclick = (e) =>
    typeof openTab === "function" ? openTab(e, panelId) : (panel.style.display = "block");
  tabContainer.appendChild(tabBtn);

  // --- Inject CSS once ---
  if (!document.getElementById("glb-ui-css")) {
    const style = document.createElement("style");
    style.id = "glb-ui-css";
    style.textContent = `
      .glb-frame {
        border: 2px solid #007bff;
        border-radius: 14px;
        padding: 18px;
        box-shadow: 2px 2px 10px rgba(0,0,0,.08);
        display: flex;
        flex-direction: column;
        gap: 16px;
        max-width: 760px;
        background: #ffffff;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji","Segoe UI Emoji";
      }
      .glb-row { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
      .glb-title { font-weight: 700; font-size: 14px; color: #0f172a; min-width: 120px; }

      /* Tri (3-position) switch */
      .glb-tri {
        --w: 360px;
        --h: 44px;
        --pad: 6px;
        --r: 999px;
        --track: #0f172a10;
        --border: #0f172a22;
        --thumb: #ffffff;
        --accent: #2563eb;
        position: relative;
        width: min(100%, var(--w));
        height: var(--h);
        padding: var(--pad);
        border-radius: var(--r);
        background: var(--track);
        border: 1px solid var(--border);
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        align-items: stretch;
        user-select: none;
        isolation: isolate;
      }
      .glb-tri label {
        position: relative;
        z-index: 2;
        display: grid;
        place-items: center;
        font-size: 14px;
        font-weight: 700;
        color: #334155;
        border-radius: calc(var(--r) - var(--pad));
        cursor: pointer;
      }
      .glb-tri .thumb {
        position: absolute;
        inset: var(--pad);
        width: calc((100% - var(--pad)*2) / 3);
        height: calc(100% - var(--pad)*2);
        translate: 0 0;
        background: var(--thumb);
        border-radius: calc(var(--r) - var(--pad));
        box-shadow: 0 6px 24px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.06);
        z-index: 1;
        transition: translate 180ms cubic-bezier(.2,.8,.2,1);
      }
      .glb-tri[data-index="0"] .thumb { translate: 0% 0; }
      .glb-tri[data-index="1"] .thumb { translate: 100% 0; }
      .glb-tri[data-index="2"] .thumb { translate: 200% 0; }
      .glb-tri[data-index="0"] label:nth-of-type(1),
      .glb-tri[data-index="1"] label:nth-of-type(2),
      .glb-tri[data-index="2"] label:nth-of-type(3) { color: var(--accent); }

      /* Button style (re-used for sys/rsl normal buttons and as a base style) */
      .glb-toggle-btn {
        display: inline-block;
        padding: 8px 18px;
        border-radius: 8px;
        font-weight: 700;
        font-size: 14px;
        cursor: pointer;
        user-select: none;
        border: none;
        color: #fff;
        min-width: 110px;
        text-align: center;
        transition: background 0.2s ease, opacity 0.2s ease, transform 0.02s ease;
      }
      .glb-toggle-btn:active { transform: translateY(1px); }
      .glb-toggle-btn.off { background-color: #dc2626; } /* red */
      .glb-toggle-btn.on  { background-color: #16a34a; } /* green */

      /* Text log */
      .glb-log {
        font: 13px/1.35 ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
        color: #334155;
        background: #f8fafc;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        width: 100%;
        min-height: 92px;
        resize: vertical;
      }
    `;
    document.head.appendChild(style);
  }

  // --- Helpers ---
  function attachTriSwitch(root, labels = ["Fast","APP","Slow"], initialIndex = 1) {
    root.classList.add("glb-tri");
    root.setAttribute("role", "radiogroup");
    const idxStart = Math.max(0, Math.min(2, Number.isFinite(initialIndex) ? initialIndex : 1));
    root.dataset.index = String(idxStart);

    // create three labels
    const labs = labels.slice(0, 3).map((txt, i) => {
      const lab = document.createElement("label");
      lab.textContent = txt;
      lab.setAttribute("role", "radio");
      lab.setAttribute("aria-checked", i === idxStart ? "true" : "false");
      lab.tabIndex = 0;
      lab.addEventListener("click", () => setIndex(i));
      lab.addEventListener("keydown", (e) => {
        if ([" ", "Enter", "Spacebar"].includes(e.key)) {
          e.preventDefault();
          setIndex(i);
        }
      });
      root.appendChild(lab);
      return lab;
    });

    const thumb = document.createElement("span");
    thumb.className = "thumb";
    thumb.setAttribute("aria-hidden", "true");
    root.appendChild(thumb);

    function setIndex(i, notify = true) {
      const prev = parseInt(root.dataset.index || "0", 10);
      const idx = Math.max(0, Math.min(2, i|0));
      if (idx === prev) return; // no-op: don't fire if unchanged
      root.dataset.index = String(idx);
      labs.forEach((l, j) => l.setAttribute("aria-checked", j === idx ? "true" : "false"));
      if (notify) {
        root.dispatchEvent(new CustomEvent("change", { bubbles: true, detail: { control: "tri", index: idx, value: labels[idx] } }));
      }
    }

    // keyboard left/right/home/end on container
    root.addEventListener("keydown", (e) => {
      const key = e.key;
      const idx = parseInt(root.dataset.index || "0", 10);
      if (["ArrowLeft","ArrowRight","Home","End"].includes(key)) {
        e.preventDefault();
        if (key === "ArrowLeft") setIndex(idx - 1);
        if (key === "ArrowRight") setIndex(idx + 1);
        if (key === "Home") setIndex(0);
        if (key === "End") setIndex(2);
      }
    });

    // pointer drag/tap on container
    const onPoint = (clientX) => {
      const rect = root.getBoundingClientRect();
      const pad = 6;
      const x = clientX - rect.left - pad;
      const segment = (rect.width - pad * 2) / 3;
      const i = Math.round(Math.max(0, Math.min(2, x / segment)));
      setIndex(i);
    };
    root.addEventListener("pointerdown", (e) => { root.setPointerCapture(e.pointerId); onPoint(e.clientX); });
    root.addEventListener("pointermove", (e) => { if (e.buttons === 1) onPoint(e.clientX); });
    root.addEventListener("pointerup",   (e) => { try { root.releasePointerCapture(e.pointerId); } catch {} });

    return {
      setIndex,
      get index() { return parseInt(root.dataset.index || "0", 10); },
      get value() { return labels[this.index]; }
    };
  }

  // Button-style toggle (used for "home" only)
  function attachButtonToggle(root, initial = false, labels = ["OFF","ON"], control = "toggle") {
    const btn = document.createElement("button");
    btn.className = "glb-toggle-btn";
    btn.setAttribute("type", "button");
    btn.setAttribute("aria-pressed", initial ? "true" : "false");
    root.appendChild(btn);

    function setState(isOn, notify = true) {
      btn.textContent = isOn ? labels[1] : labels[0];
      btn.classList.toggle("on", isOn);
      btn.classList.toggle("off", !isOn);
      btn.setAttribute("aria-pressed", isOn ? "true" : "false");
      if (notify) {
        root.dispatchEvent(new CustomEvent("change", { bubbles: true, detail: { control, checked: isOn, value: btn.textContent } }));
      }
    }

    btn.addEventListener("click", () => setState(!(btn.classList.contains("on"))));

    // Keyboard support
    btn.addEventListener("keydown", (e) => {
      if ([" ", "Enter", "Spacebar"].includes(e.key)) {
        e.preventDefault();
        setState(!(btn.classList.contains("on")));
      }
      if (["ArrowLeft","ArrowRight"].includes(e.key)) {
        e.preventDefault();
        setState(e.key === "ArrowRight");
      }
      if (e.key === "Home") { e.preventDefault(); setState(false); }
      if (e.key === "End")  { e.preventDefault(); setState(true); }
    });

    // initialize
    setState(initial, false);

    return { setState, get checked() { return btn.classList.contains("on"); }, get value() { return btn.textContent; } };
  }

  // --- Build the panel ---
  const frame = document.createElement("div");
  frame.className = "glb-frame";

  // Row 1: Tri switch
  const row1 = document.createElement("div"); row1.className = "glb-row";
  const triRoot = document.createElement("div");
  row1.appendChild(triRoot);

  // Row 2: Two normal buttons (sys/rsl) + one toggle (home)
  const row2 = document.createElement("div"); row2.className = "glb-row";

  const sysBtn = document.createElement("button");
  sysBtn.className = "glb-toggle-btn on"; // stylistic reuse (green)
  sysBtn.type = "button";
  sysBtn.textContent = "sys_on_off";
  row2.appendChild(sysBtn);

  const rslBtn = document.createElement("button");
  rslBtn.className = "glb-toggle-btn on"; // stylistic reuse (green)
  rslBtn.type = "button";
  rslBtn.textContent = "rsl_on_off";
  row2.appendChild(rslBtn);

  // NEW sl_on_off button
  const slBtn = document.createElement("button");
  slBtn.className = "glb-toggle-btn on";
  slBtn.type = "button";
  slBtn.textContent = "laser_on_off";
  row2.appendChild(slBtn);


  const homeWrap = document.createElement("div");
  const homeRoot = document.createElement("div");
  homeWrap.appendChild(homeRoot);
  row2.appendChild(homeWrap);

  // Row 3: Event log
  const row3 = document.createElement("div"); row3.className = "glb-row";
  const eventBox = document.createElement("textarea");
  eventBox.className = "glb-log";
  eventBox.readOnly = true;
  eventBox.placeholder = "Event log...";
  row3.appendChild(eventBox);

  // Append rows
  frame.appendChild(row1);
  frame.appendChild(row2);
  frame.appendChild(row3);
  panel.appendChild(frame);

  // Attach behaviors with required labels
  const tri  = attachTriSwitch(triRoot, ["Fast","APP","Slow"], 1);
  const home = attachButtonToggle(homeRoot, false, ["test_on","test_off"], "home");

  // Normal button click events (emit change events)
  sysBtn.addEventListener("click", () => {
    panel.dispatchEvent(new CustomEvent("change", {
      bubbles: true,
      detail: { control: "sys", value: "sys_on_off" }
    }));
  });

  rslBtn.addEventListener("click", () => {
    panel.dispatchEvent(new CustomEvent("change", {
      bubbles: true,
      detail: { control: "rsl", value: "rsl_on_off" }
    }));
  });

  slBtn.addEventListener("click", () => {
    panel.dispatchEvent(new CustomEvent("change", {
      bubbles: true,
      detail: { control: "sl", value: "laser_on_off" }
    }));
  });


  // Utility: append to log
  function log(msg) {
    const stamp = new Date().toLocaleTimeString();
    eventBox.value += `[${stamp}] ${msg}\n`;
    eventBox.scrollTop = eventBox.scrollHeight;
  }

  // Listen for all changes within the panel
  panel.addEventListener("change", (e) => {
    const d = e.detail || {};
    const text = (typeof d.value === "string") ? d.value : JSON.stringify(d);
    log(`${d.control || "control"} -> ${text}`);
    var cmd = ''
    if (d['value'] == 'Fast'){
      cmd = '@V00000040'
    }else if (d['value'] == 'APP'){
      cmd = '@V00000080'
    }else if (d['value'] == 'Slow'){      
      cmd = '@V00000100'
    }else if (d['value'] == 'sys_on_off'){
      cmd = '@V00000010'
    }else if (d['value'] == 'rsl_on_off'){      
      cmd = '@V00000004'    
    }else if (d['value'] == 'laser_on_off'){      
      cmd = '@V00000800'         
    }else if (d['value'] == 'test_on'){         
      cmd = '@V00001000'    
    }else if (d['value'] == 'test_off'){         
      cmd = '@V00002000'    
    }

    console.log("WebUI change:", d, d['value'], cmd);

    if (cmd !=''){
      _dict_cmd = {ble_write: '@V00000004'}
      _dict_cmd['ble_write'] = cmd
      sendCmd (_dict_cmd)
    }


  });

  function sendCmd(cmd) {
      console.log(`sendCmd `, cmd);
      sendGlbCmd(cmd);
  }

  // Expose to window for shell debugging
  window.GlbUI = { tri, sysBtn, rslBtn, home, logEl: eventBox };
});
