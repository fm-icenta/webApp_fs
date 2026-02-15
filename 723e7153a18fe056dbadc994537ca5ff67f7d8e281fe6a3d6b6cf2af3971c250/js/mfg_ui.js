document.addEventListener("DOMContentLoaded", async function () {
    const mfgTab = document.getElementById("mfgTab");

    if (!mfgTab) {
        console.error("Error: MFG control tab not found!");
        return;
    }

    let _mfgTab = {};

    // try {
    //     const response = await fetch("js/app.json");
    //     const appUI = await response.json();
    //     _mfgTab = appUI.ui.mfgTab || {};
    // } catch (error) {
    //     console.error("Error loading mfgTab from app.json", error);
    //     _mfgTab = appCfg.ui.mfgTab
    // }

    _mfgTab = appCfg.ui.mfgTab

    console.log([arguments.callee.name, _mfgTab.commands.length, _mfgTab]);

    const cmdObj = {'setting':{'c': 'wr', 'k': '-', 'd': '-','v':'2'}}
    function sendCmd(name, data) {
        let _cmdObj = _jsonClone(cmdObj)
        _cmdObj['setting']['k']=name
        _cmdObj['setting']['d']=data        
        console.log(_cmdObj);
        console.log([arguments.callee.name, _cmdObj]);    
        sendGlbCmd(_cmdObj);            
    }

    const mfgContainer = document.createElement("div");
    mfgContainer.style.display = "grid";
    mfgContainer.style.gridTemplateColumns = "1fr";
    mfgContainer.style.gap = "10px";

    _mfgTab.commands.forEach(cmd => {
        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.alignItems = "center";
        wrapper.style.gap = "10px";
        wrapper.style.width = "100%";

        const input = document.createElement("input");
        input.type = "text";
        input.style.flexGrow = "1";
        input.value = cmd.value;

        const sendButton = document.createElement("button");
        sendButton.textContent = cmd.name;
        sendButton.style.padding = "5px 10px";
        sendButton.style.backgroundColor = "#007bff";
        sendButton.style.color = "white";
        sendButton.style.border = "none";
        sendButton.style.cursor = "pointer";
        sendButton.style.borderRadius = "5px";
        sendButton.disabled = !cmd.enable;

        sendButton.addEventListener("click", function () {
            sendCmd(cmd.key, input.value);
        });

        wrapper.appendChild(input);
        wrapper.appendChild(sendButton);
        mfgContainer.appendChild(wrapper);
    });


    const buttonGrid = document.createElement("div");
    buttonGrid.style.display = "grid";
    buttonGrid.style.gridTemplateColumns = "repeat(2, 1fr)"; 
    buttonGrid.style.gridTemplateRows = "repeat(4, auto)";
    buttonGrid.style.gap = "10px";
    buttonGrid.style.marginTop = "15px";

    buttonLabels = _mfgTab.buttonArr;

    buttonLabels.forEach(label => {
        const button = document.createElement("button");
        button.textContent = label;
        button.style.padding = "10px";
        button.style.border = "none";
        button.style.cursor = "pointer";
        button.style.borderRadius = "5px";
        button.style.textAlign = "center";

        const _cmdObj = {'setting':{'c': 'wr', 'k': '-', 'd': '-','v':'2'}}        
        button.addEventListener("click", function () {
            if (label == 'commit'){
                _cmdObj['setting']['k'] = 'commit'
            }else if  (label == 'readSetting'){
                _cmdObj['setting']['c'] = 'rd'
                _cmdObj['setting']['k'] = 'setting'
            }
            console.log(_cmdObj)
            sendGlbCmd(_cmdObj);              
        });
        buttonGrid.appendChild(button);
    });

    mfgContainer.appendChild(buttonGrid);

    mfgTab.innerHTML = "";
    mfgTab.appendChild(mfgContainer);
});
