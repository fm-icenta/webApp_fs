document.addEventListener("DOMContentLoaded", async function () {
    const motorTab = document.getElementById("turntableTab");

    if (!motorTab) {
        console.error("Error: Motor control tab not found!");
        return;
    }

    // console.log(appCfg.ui)

    const cmdObj = {'turnTable':{'i': 0, 'r': 'cw', 'd': '90', 's': 'slow','v':'2'}}
    let turnTableCmd = {};
    let turnTableButtonArr;
    // try {
    //     const response = await fetch("js/app.json");
    //     const appUI = await response.json();
    //     turnTableCmd = appUI.ui.turnTableCmd || {};
    //     turnTableButtonArr = appUI.ui.turnTableButtonArr;
    // } catch (error) {
    //     console.error("Error loading turnTableCmd from app_ui.json", error);
    //     // load default from app_cfg.js
    //     turnTableCmd = appCfg.ui.turnTableCmd
    //     turnTableButtonArr = appCfg.ui.turnTableButtonArr;
    // }

    turnTableCmd = appCfg.ui.turnTableCmd
    turnTableButtonArr = appCfg.ui.turnTableButtonArr;
    turnTableCmd = flattenArrayToJson(turnTableCmd);

    const controlContainer = document.createElement("div");
    controlContainer.style.border = "2px solid #007bff";
    controlContainer.style.borderRadius = "10px";
    controlContainer.style.padding = "20px";
    // controlContainer.style.backgroundColor = "#f9f9f9";
    controlContainer.style.boxShadow = "2px 2px 10px rgba(0, 0, 0, 0.1)";
    controlContainer.style.display = "flex";
    controlContainer.style.flexDirection = "column";
    controlContainer.style.gap = "15px";

    const inputRow1 = document.createElement("div");
    inputRow1.style.display = "flex";
    inputRow1.style.alignItems = "center";
    inputRow1.style.gap = "20px";

    const turnTableContainer = document.createElement("div");
    const turnTableLabel = document.createElement("label");
    turnTableLabel.textContent = "TurnTable:";
    const turnTableSelect = document.createElement("select");
    ["synced","0", "1", "2"].forEach(text => {
        const option = document.createElement("option");
        option.textContent = text;
        turnTableSelect.appendChild(option);
    });
    turnTableContainer.appendChild(turnTableLabel);
    turnTableContainer.appendChild(turnTableSelect);

    const directionContainer = document.createElement("div");
    const directionLabel = document.createElement("label");
    directionLabel.textContent = "Direction:";
    const directionSelect = document.createElement("select");
    ["CW", "CCW"].forEach(text => {
        const option = document.createElement("option");
        option.textContent = text;
        directionSelect.appendChild(option);
    });
    directionContainer.appendChild(directionLabel);
    directionContainer.appendChild(directionSelect);

    inputRow1.appendChild(turnTableContainer);
    inputRow1.appendChild(directionContainer);

    const inputRow2 = document.createElement("div");
    inputRow2.style.display = "flex";
    inputRow2.style.alignItems = "center";
    inputRow2.style.gap = "20px";

    const degreeContainer = document.createElement("div");
    const degreeLabel = document.createElement("label");
    degreeLabel.textContent = "Degree:";
    const degreeInput = document.createElement("input");
    degreeInput.type = "number";
    degreeInput.placeholder = "Enter degree";
    degreeInput.value = "100";
    degreeInput.style.width = "100px";
    degreeContainer.appendChild(degreeLabel);
    degreeContainer.appendChild(degreeInput);

    const speedContainer = document.createElement("div");
    const speedLabel = document.createElement("label");
    speedLabel.textContent = "Speed:";
    const speedSelect = document.createElement("select");
    ["Slow", "Fast", 'user_define'].forEach(text => {
        const option = document.createElement("option");
        option.textContent = text;
        speedSelect.appendChild(option);
    });
    speedContainer.appendChild(speedLabel);
    speedContainer.appendChild(speedSelect);

    inputRow2.appendChild(degreeContainer);
    inputRow2.appendChild(speedContainer);

    const sendButton = document.createElement("button");
    sendButton.textContent = "Send";
    sendButton.style.padding = "10px";
    sendButton.style.border = "none";
    sendButton.style.cursor = "pointer";
    sendButton.style.borderRadius = "5px";

    sendButton.addEventListener("click", function () {
        const turnTable = turnTableSelect.value;
        const direction = directionSelect.value.toLowerCase();
        const degree = degreeInput.value;
        const speed = speedSelect.value.toLowerCase();

        let i, r, s;
        // i = turnTable.includes("top") ? "0" : "1";
        i = turnTable

        r = direction.includes("ccw") ? "ccw" : "cw";
        s = speed.includes("fast") ? "fast" : "slow";

        let _cmdObj = _jsonClone(cmdObj);
        _cmdObj['turnTable']['i'] = i;
        _cmdObj['turnTable']['r'] = r;
        _cmdObj['turnTable']['d'] = degree;
        _cmdObj['turnTable']['s'] = s;
        sendCmd(_cmdObj);
    });

    const buttonGrid = document.createElement("div");
    buttonGrid.style.display = "grid";
    buttonGrid.style.gridTemplateColumns = "repeat(2, 1fr)"; 
    buttonGrid.style.gridTemplateRows = "repeat(4, auto)";
    buttonGrid.style.gap = "10px";
    buttonGrid.style.marginTop = "15px";

    buttonLabels = turnTableButtonArr;

    buttonLabels.forEach(label => {
        const button = document.createElement("button");
        button.textContent = label;
        button.style.padding = "10px";
        button.style.border = "none";
        button.style.cursor = "pointer";
        button.style.borderRadius = "5px";
        button.style.textAlign = "center";

        button.addEventListener("click", function () {
            // const degree = degreeInput.value;         
            if (label in turnTableCmd) {
                let _cmdObj = _jsonClone(cmdObj);
                _cmdObj['turnTable'] = turnTableCmd[label];
                
                const turnTable = turnTableSelect.value;    
                _cmdObj['turnTable']['i']=turnTable            
                console.log(arguments.callee.name,_cmdObj,turnTable);

                sendCmd(_cmdObj);
            }
        });
        buttonGrid.appendChild(button);
    });

    controlContainer.appendChild(inputRow1);
    controlContainer.appendChild(inputRow2);
    controlContainer.appendChild(sendButton);
    controlContainer.appendChild(buttonGrid);
    motorTab.innerHTML = "";
    motorTab.appendChild(controlContainer);

    function sendCmd(cmd) {
        const degree = degreeInput.value;     
        _cmd = _jsonClone(cmd);
        if (_cmd['turnTable']['d'] == '$'){
            _cmd['turnTable']['d'] = degree;
        }            
        console.log(arguments.callee.name,degree,_cmd,cmd);                
        sendGlbCmd(_cmd);
    }
});
