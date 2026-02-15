document.addEventListener("DOMContentLoaded", function() {
    const infoTab = document.getElementById("testTab");
  
    const infoFrame = document.createElement("div");
    infoFrame.style.border = "2px solid #007bff"; // Blue border
    infoFrame.style.borderRadius = "10px";
    infoFrame.style.padding = "20px";
    // infoFrame.style.backgroundColor = "#f9f9f9";
    infoFrame.style.boxShadow = "2px 2px 10px rgba(0, 0, 0, 0.1)";
    infoFrame.style.display = "flex";
    infoFrame.style.flexDirection = "column";
    infoFrame.style.gap = "10px";
  
    // load Json object from app_cfg.js
    testTab = appCfg.ui.testTab
    console.log([arguments.callee.name,testTab])

    // Row 1: ComboBox, Upload Button, Toggle (Start/Stop) Button, Test Button
    const row1 = document.createElement("div");
    row1.style.display = "flex";
    row1.style.gap = "10px";
  
    // ComboBox (Dropdown)
    const comboBox = document.createElement("select");
    // option = ["Option 1a", "Option 2a", "Option 3a"]

    // option = testTab.commands
    let option = []; 
    testTab.commands.forEach((script, index) => {
        let item = JSON.stringify(script['macro'])        
        option.push(item)  
      });

    option.forEach(optionText => {
      let option = document.createElement("option");
      option.textContent = optionText;
      comboBox.appendChild(option);
    });
  

  // ComboBox for TestScripts titles
  const testScriptSelector = document.createElement("select");
  testScriptSelector.style.padding = "5px";
  testScriptSelector.style.borderRadius = "5px";

  // Populate with titles from TestScripts
  testTab.TestScripts.forEach((script, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = script.title;
      testScriptSelector.appendChild(option);
  });

  // On selection, update listBox with the selected script's macros
  testScriptSelector.addEventListener("change", function () {
      const selectedIndex = parseInt(testScriptSelector.value);
      const selectedScript = testTab.TestScripts[selectedIndex];
      if (selectedScript && Array.isArray(selectedScript.scripts)) {
          const items = selectedScript.scripts.map(s => JSON.stringify(s.macro));
          updateListbox(items);
          listBox.selectedIndex = 0;
          textBox.value = listBox.options[0]?.text || "";
      }
  });




    // Create a hidden file input for uploading JSON files.
    // Position it off-screen so it remains in the DOM.
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json,application/json";
    fileInput.style.position = "absolute";
    fileInput.style.left = "-9999px";
  
    // Upload Button
    const uploadButton = document.createElement("button");
    uploadButton.textContent = "Upload";
    uploadButton.style.padding = "5px 15px";
    uploadButton.style.backgroundColor = "#17a2b8"; // Info blue
    uploadButton.style.color = "white";
    uploadButton.style.border = "none";
    uploadButton.style.cursor = "pointer";
    uploadButton.style.borderRadius = "5px";
  
    // Trigger the file dialog when the Upload button is clicked.
    uploadButton.addEventListener("click", function() {
      fileInput.click();
    });
  
    // Handle file selection for JSON upload.
    fileInput.addEventListener("change", function(event) {
      const file = event.target.files[0];
      if (!file) {
        console.error("No file selected");
        return;
      }
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const jsonData = JSON.parse(e.target.result);
          console.log("Uploaded JSON data:", jsonData);
          // Process jsonData here as needed.
          if ('scripts' in jsonData){
            loadScripts(jsonData.scripts)
          }
        } catch (error) {
          console.error("Error parsing JSON file:", error);
        }
      };
      reader.readAsText(file);
    });
  
    // Toggle Button (acts as Start/Stop)
    const toggleButton = document.createElement("button");
    toggleButton.textContent = "Start";
    toggleButton.style.padding = "5px 15px";
    toggleButton.style.backgroundColor = "#28a745";
    toggleButton.style.color = "white";
    toggleButton.style.border = "none";
    toggleButton.style.cursor = "pointer";
    toggleButton.style.borderRadius = "5px";
  
    // Test Button (formerly Stop Button)
    const testButton = document.createElement("button");
    testButton.textContent = "Test";
    testButton.style.padding = "5px 15px";
    testButton.style.backgroundColor = "#dc3545";
    testButton.style.color = "white";
    testButton.style.border = "none";
    testButton.style.cursor = "pointer";
    testButton.style.borderRadius = "5px";
  
    // Timer Display
    const timerDisplay = document.createElement("div");
    timerDisplay.textContent = "TestTime: 0 seconds";
    timerDisplay.style.fontSize = "16px";
    timerDisplay.style.fontWeight = "bold";
  
    // Initialize the timer module with the display element
    TimerModule.initialize(onTestTimer);
  
    // Toggle button: switches between starting and stopping the timer.
    toggleButton.addEventListener("click", function() {
      if (toggleButton.textContent === "Start") {
        console.log("Timer started");
        TimerModule.reset();
        TimerModule.start();
        toggleButton.textContent = "Stop";
        toggleButton.style.backgroundColor = "#dc3545"; // Red indicates Stop
      } else {
        TimerModule.stop();
        toggleButton.textContent = "Start";
        toggleButton.style.backgroundColor = "#28a745"; // Green indicates Start
        console.log("Timer stopped at", TimerModule.getCount(), "seconds");
      }
    });
  
    // Test Button action.
    testButton.addEventListener("click", function() {
      console.log("Test button clicked", textBox.value);
      sendMacro(textBox.value);
      // Insert test logic here.
    });
  
    // Append controls to row 1 in order: ComboBox, Upload, Toggle, Test.
    row1.appendChild(comboBox);       
    row1.appendChild(testButton);
    row1.appendChild(uploadButton);
    row1.appendChild(toggleButton);
    // row1.appendChild(testScriptSelector);         
  
    // Row 2: Text Box
    const textBox = document.createElement("input");
    textBox.type = "text";
    textBox.placeholder = "Enter text here...";
    textBox.style.width = "100%";
    textBox.style.padding = "8px";
    textBox.style.border = "1px solid #ccc";
    textBox.style.borderRadius = "5px";
  
    // Row 3: Listbox with items
    const listBox = document.createElement("select");
    listBox.size = 5; // Visible rows count
    listBox.style.width = "100%";
    listBox.style.padding = "5px";
    listBox.style.border = "1px solid #ccc";
    listBox.style.borderRadius = "5px";
  
    // Populate the listbox with default items.
    ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"].forEach(itemText => {
      let option = document.createElement("option");
      option.textContent = itemText;
      listBox.appendChild(option);
    });
  

    // Function to update the listbox content from a text array.
    function updateListbox(items) {
      if (!Array.isArray(items)) {
        console.error("updateListbox: provided value is not an array");
        return;
      }
      // Clear existing listbox items.
      listBox.innerHTML = "";
      // Add each item from the array as an option.
      items.forEach(itemText => {
        let option = document.createElement("option");
        option.textContent = itemText;
        listBox.appendChild(option);
      });
    }

    function loadScripts(scriptsArr){
        let items = [];         
        scriptsArr.forEach((script, index) => {
            let item = JSON.stringify(script['macro'])     
            items.push(item)  
          });
        updateListbox(items);
        listBox.selectedIndex = 0;    
    }

    loadScripts (testTab.scripts)
    
    // Add an event listener so that when the listbox selection changes,
    // the selected item's text is copied to the text box.
    listBox.addEventListener("change", function() {
        textBox.value = listBox.options[listBox.selectedIndex].text;
        // console.log("Listbox changed. Selected item:", textBox.value);
    });

    comboBox.addEventListener("change", function() {
        textBox.value = comboBox.options[comboBox.selectedIndex].text;
        // console.log("Combobox changed. Selected item:", textBox.value);
      });    

    function onTestTimer(event){

        time = event['timer']
        elapsed = event['elapsed']
        selectIndex = time % listBox.options.length
        // console.log(arguments.callee.name,event,listBox.selectedIndex,listBox.options.length,selectIndex)
        listBox.selectedIndex = selectIndex
        textBox.value = listBox.options[listBox.selectedIndex].text;        
        sendMacro(textBox.value)
        timerDisplay.textContent = "TestTime : " + elapsed + " seconds";
        console.log(arguments.callee.name,event,listBox.selectedIndex,listBox.options.length,selectIndex,textBox.value)
    }

    // Expose the updateListbox function globally.
    window.updateListbox = updateListbox;
    window.onTestTimer = onTestTimer;    
  
    // Append all rows and elements to the container.
    infoFrame.appendChild(row1);
    infoFrame.appendChild(textBox);
    infoFrame.appendChild(testScriptSelector); 
    infoFrame.appendChild(listBox);
    // Append the timer display (new row)
    infoFrame.appendChild(timerDisplay);
    // Append the hidden file input.
    infoFrame.appendChild(fileInput);
  
    infoTab.appendChild(infoFrame);

    function sendMacro(msg){
        console.log(arguments.callee.name,msg,typeof msg === 'string')
        if (typeof msg === 'string') {
            _jsonExtractEx(msg).forEach(cmdObj => {
            console.log(arguments.callee.name,cmdObj)
            sendCmd(cmdObj)
            });
        }        
    }

    function sendCmd(cmd){
        if (_isJSONObject(cmd)) {
            // console.log(arguments.callee.name,cmd)
        
            if ('test_interval' in cmd){
                TimerModule.setIntervalTime(parseInt(cmd['test_interval'], 10))
            }
            else if (('ble_write' in cmd) || ('component' in cmd)) {

                if (bleServer !== null){
                    if (bleServer.connected === true){
                        sendGlbCmd(cmd)            
                    }
                    else{
                        TimerModule.stop();
                        toggleButton.textContent = "Start";
                        toggleButton.style.backgroundColor = "#28a745"; // Green indicates Start   
                        window.alert("Bluetooth is not connected. Cannot write to characteristic. \nConnect to BLE first!");                        
                    }
                }
                else{
                    TimerModule.stop();
                    toggleButton.textContent = "Start";
                    toggleButton.style.backgroundColor = "#28a745"; // Green indicates Start
                    window.alert("Bluetooth is not connected. Cannot write to characteristic. \nConnect to BLE first!");                                        
                }

            }
        }        
    }


  });
  