document.addEventListener("DOMContentLoaded", function () {
    const ledTab = document.getElementById("ledTab");

    if (!ledTab) {
        console.error("Error: LED control tab not found!");
        return;
    }

    ledTabCfg = appCfg.ui.ledTab
    console.log(arguments.callee.name, ledTabCfg);

    let ledObj = ledTabCfg.cmdObj

    // Create LED Control Section
    const controlContainer = document.createElement("div");
    controlContainer.style.border = "2px solid #007bff";
    controlContainer.style.borderRadius = "10px";
    controlContainer.style.padding = "20px";
    controlContainer.style.boxShadow = "2px 2px 10px rgba(0, 0, 0, 0.1)";
    controlContainer.style.display = "flex";
    controlContainer.style.flexDirection = "column";
    controlContainer.style.gap = "15px";

    // Create LED Brightness Control
    function createSlider(id, labelText) {
        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.alignItems = "center";
        wrapper.style.gap = "10px";

        // --- Label OR Combo (for LED_5) ---
        const isLed5 = (id === "led8");
        let labelEl;
        let modeEl = null; // new mode combobox (only for LED_5)

        if (isLed5) {
            // 1) Existing target-index combobox: (all, 0..50)
            labelEl = document.createElement("select");
            ["all", ...Array.from({length: 51}, (_, i) => String(i))].forEach(optVal => {
                const opt = document.createElement("option");
                opt.value = optVal;
                opt.textContent = optVal;
                labelEl.appendChild(opt);
            });
            labelEl.value = "5"; // default to LED_5
            labelEl.style.fontSize = "12px";
            labelEl.style.minWidth = "60px";
            labelEl.style.padding = "4px 6px";
            labelEl.style.borderRadius = "6px";
            labelEl.title = "Target index";

            // 2) NEW: mode combobox (direct, 1s, 2s, 3s, 4s)
            modeEl = document.createElement("select");
            ["0s","1s","2s","3s","4s"].forEach(v => {
                const opt = document.createElement("option");
                opt.value = v;
                opt.textContent = v;
                modeEl.appendChild(opt);
            });
            modeEl.value = "0s";
            modeEl.style.fontSize = "12px";
            modeEl.style.minWidth = "70px";
            modeEl.style.padding = "4px 6px";
            modeEl.style.borderRadius = "6px";
            modeEl.title = "Mode";

        } else {
            labelEl = document.createElement("label");
            labelEl.textContent = labelText + ": ";
            labelEl.style.fontSize = "12px";
            labelEl.style.minWidth = "50px";
            labelEl.style.whiteSpace = "nowrap";
        }

        const valueSpan = document.createElement("span");
        valueSpan.textContent = "50";

        const slider = document.createElement("input");
        slider.type = "range";
        slider.min = "0";
        slider.max = "100";
        slider.value = "50";
        slider.style.width = "100%";
        slider.id = id;  // ✅ Assign unique ID

        // Helper: get target index based on row (combo for led5, else numeric id)
        function getTargetIndex() {
            return isLed5 ? ("arr_" + labelEl.value) : id.replace("led", "");
        }
        // Helper: get mode value (only for led5); default "direct"
        function getModeValue() {
            return (isLed5 && modeEl) ? modeEl.value : "0s";
        }

        slider.addEventListener("input", function () {
            valueSpan.textContent = slider.value;
        });

        // Handle slider release
        function handleSliderRelease() {
            const led_index = getTargetIndex();
            ledObj['led']['i'] = led_index;
            ledObj['led']['b'] = slider.value;
            ledObj['led']['m'] = getModeValue();   // include mode
            sendCmd(ledObj);
            console.log(`Final brightness for ${labelText}: ${slider.value} -> i=${ledObj['led']['i']}, m=${ledObj['led']['m']}`);
        }

        slider.addEventListener("mouseup", handleSliderRelease);
        slider.addEventListener("touchend", handleSliderRelease);
        slider.addEventListener("keydown", function (event) {
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                setTimeout(() => {
                    handleSliderRelease();
                }, 100);
            }
        });

        // Real-time slider update (no send)
        slider.addEventListener("input", function () {
            valueSpan.textContent = slider.value;
            ledObj['led']['i'] = getTargetIndex();
            ledObj['led']['b'] = slider.value;
            ledObj['led']['m'] = getModeValue();
        });

        // Toggle Button for ON/OFF
        const toggleButton = document.createElement("button");
        toggleButton.textContent = "ON";
        toggleButton.style.padding = "5px 10px";
        toggleButton.style.backgroundColor = "#28a745";
        toggleButton.style.color = "white";
        toggleButton.style.border = "none";
        toggleButton.style.cursor = "pointer";
        toggleButton.style.borderRadius = "5px";

        toggleButton.addEventListener("click", function () {
            let val = '0';
            if (slider.disabled) {
                slider.disabled = false;
                toggleButton.textContent = "ON";
                toggleButton.style.backgroundColor = "#28a745";
                val = slider.value;
            } else {
                slider.disabled = true;
                toggleButton.textContent = "OFF";
                toggleButton.style.backgroundColor = "#dc3545";
            }
            ledObj['led']['i'] = getTargetIndex();
            ledObj['led']['b'] = val;
            ledObj['led']['m'] = getModeValue();
            sendCmd(ledObj);
        });

        // Assemble row
        wrapper.appendChild(labelEl);
        if (modeEl) wrapper.appendChild(modeEl);    // 👈 NEW mode combobox beside the first combobox
        wrapper.appendChild(valueSpan);
        wrapper.appendChild(slider);
        wrapper.appendChild(toggleButton);

        // Logging for combo changes
        if (isLed5) {
            labelEl.addEventListener("change", function () {
                console.log("LED_5 target index changed ->", labelEl.value);
            });
            modeEl.addEventListener("change", function () {
                console.log("LED_5 mode changed ->", modeEl.value);
            });
        }

        return wrapper;
    }

    // Create 6 LED sliders
    // for (let i = 0; i < 6; i++) {
    //     controlContainer.appendChild(createSlider(`led${i}`, `LED_${i}`));
    // }

    const labels = [
    "LED_0",
    "LED_1",
    "LED_2",
    "LED_3",    
    "LED_4",        
    "LED_ALL",    // formerly LED_4
    "LED_WHITE",
    "LED_254",
    "LED_365",
    "LED_5"
    ];

    labels.forEach((label, i) => {
    controlContainer.appendChild(createSlider(`led${i}`, label));
    });


    ledTab.innerHTML = "";
    ledTab.appendChild(controlContainer);

    function sendCmd(cmd) {
        if ("m" in cmd['led']) {
        cmd.led.m = cmd.led.m.replace("s", "");   // remove one 's' at the end
        }
        console.log(cmd);       
        sendGlbCmd(cmd);
    }

    // Update LED values from incoming data
    function updateLed(data) {
        console.log([arguments.callee.name, data]);

        if (!data.led) {
            console.error("Error: 'led' key not found in data");
            return;
        }

        const ledValues = data.led.split(",");

        ledValues.forEach((value, index) => {
            const slider = document.getElementById(`led${index}`);
            const valueSpan = slider?.parentElement.querySelector("span");

            if (slider) {
                slider.value = value;
                if (valueSpan) valueSpan.textContent = value;
            } else {
                console.warn(`⚠️ Slider for LED_${index} not found`);
            }
        });
    }

    window.updateLed = updateLed;
});
