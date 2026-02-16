// ble.js - Handles all Bluetooth-related functions

// BLE Configuration
// const deviceName = 'GLB PRO MAX';
const deviceName = 'GLB';

// GEMLIGHTBOX_UUID
const bleServiceUUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
const dataCharacteristicUUID = '0000ffe2-0000-1000-8000-00805f9b34fb';
const commandCharacteristicUUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

// Device Information Service UUIDs (Standard BLE Service)
const deviceInfoServiceUUID = '0000180a-0000-1000-8000-00805f9b34fb';
const modelNumberUUID = '00002a24-0000-1000-8000-00805f9b34fb';
const softwareVersionUUID = '00002a26-0000-1000-8000-00805f9b34fb';
const hardwareVersionUUID = '00002a27-0000-1000-8000-00805f9b34fb';
const manufacturerUUID = '00002a29-0000-1000-8000-00805f9b34fb';

let bleServer = null;
let bleServiceFound = null;
let commandCharacteristicFound = null;


let deviceInfo = {'name':'','manufacturer':'','hw_version':'','sw_version':'','model':''
                    ,'ts':'','tx' : '', 'rx':''
}; // JSON object to store device information

const deviceInfoContainer = document.getElementById('deviceInfo');

// Check if BLE is available in the browser
function isWebBluetoothEnabled() {
    if (!navigator.bluetooth) {
        console.log("Web Bluetooth API is not available in this browser!");
        alert("Web Bluetooth API is not available in this browser!");
        return false;
    }
    console.log('Web Bluetooth API supported in this browser.');
    return true;
}

// Connect to BLE Device and Enable Notifications
function connectToDevice() {
    if (!isWebBluetoothEnabled()) return;

    // namePrefix:     
    console.log([arguments.callee.name,'Initializing Bluetooth...']);
    navigator.bluetooth.requestDevice({
        // acceptAllDevices: true,             
        // optionalServices: ["0000abf0-0000-1000-8000-00805f9b34fb","0000abf1-0000-1000-8000-00805f9b34fb","0000abf1-0000-1000-8000-00805f9b34fb"] // Add Device Info Service

        // filters: [{ name: deviceName }],
        // filters: [{ namePrefix: deviceName }],   

        filters: [{ services: [bleServiceUUID] }],
        optionalServices: [bleServiceUUID, deviceInfoServiceUUID] // Add Device Info Service
    })
    .then(device => {
        console.log([arguments.callee.name,'Device Selected:', device.name]);       
        deviceInfo['name'] = device.name + ':connected';
        device.addEventListener('gattservicedisconnected', onDisconnected);
        return device.gatt.connect();
    })
    .then(gattServer => {
        bleServer = gattServer;
        console.log([arguments.callee.name,"Connected to GATT Server"]);
        return bleServer.getPrimaryService(bleServiceUUID);
    })
    .then(service => {
        bleServiceFound = service;
        console.log([arguments.callee.name,"Service discovered:", service.uuid]);
        // Get all characteristics and subscribe to notifications where possible
        return service.getCharacteristics().then(characteristics => {
            console.log([arguments.callee.name,"Discovered characteristics:"]);
            characteristics.forEach(characteristic => {
                console.log([arguments.callee.name,`Characteristic UUID: ${characteristic.uuid}`,commandCharacteristicUUID]);
                if (characteristic.uuid == commandCharacteristicUUID){
                    commandCharacteristicFound = characteristic
                    onConnected();
                }

                if (characteristic.properties.notify) {
                    characteristic.startNotifications()
                        .then(() => {
                            console.log([arguments.callee.name,`Notifications enabled for: ${characteristic.uuid}`]);                            
                            characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicChange);
                        })
                        .catch(error => console.log(`Error enabling notifications: ${error}`));
                }
            });
            return characteristics;
        });
    })
    .then(() => {
        // Read Device Information After Connection
        readDeviceInformation();
    })
    .catch(error => {
        console.log('Error: ', error);
        // onDisconnected(error);
    });
}

// Handle BLE Disconnection
function onDisconnected(event) {
    console.log([arguments.callee.name,'Device Disconnected:', event.target.device.name]);    
    deviceInfo['name'] = 'device:disconnected';    
    // connectToDevice(); // Auto-reconnect
    commandCharacteristicFound = null;
}

function onConnected()
{
    console.log([arguments.callee.name,'Device Connected:', commandCharacteristicFound]);   
    // setTimeout(writeOnCharacteristic,1000,"?0" ); // Executes query device info   after 1 second
    // setTimeout(writeOnCharacteristic,1200,"?1" ); // Executes query device status after 1 second

    setTimeout(writeOnCharacteristic,1000,["?1","?0"] ); // Executes query device status after 1 second    
}


function readDeviceInformation() {
    if (!bleServer) {
        console.error("BLE server not connected.");
        return;
    }

    bleServer.getPrimaryService('device_information')
    .then(service => {
        console.log([arguments.callee.name,"Device Information Service Found"]);
        // Get all characteristics in the service
        return service.getCharacteristics();
    })
    .then(characteristics => {
        console.log([arguments.callee.name,"Available Characteristics:", characteristics.map(c => c.uuid)]);

        // Read and display all characteristics dynamically
        return Promise.all(characteristics.map(characteristic => {
            return characteristic.readValue()
                .then(value => {
                    const decodedValue = new TextDecoder().decode(value);
                    console.log([arguments.callee.name,`Characteristic ${characteristic.uuid}: ${decodedValue}`]);                    

                    // Store in deviceInfo JSON object
                    if (characteristic.uuid === manufacturerUUID) {
                        deviceInfo['manufacturer'] = decodedValue;
                    }
                    if (characteristic.uuid === softwareVersionUUID) {
                        deviceInfo['sw_version'] = decodedValue;
                    }
                    if (characteristic.uuid === hardwareVersionUUID) {
                        deviceInfo['hw_version'] = decodedValue;
                    }
                    if (characteristic.uuid === modelNumberUUID) {  // ✅ Fixed variable name
                        deviceInfo['model'] = decodedValue;
                    }
                })
                .catch(error => {
                    console.warn(`Error reading characteristic ${characteristic.uuid}:`, error);
                });
        }));
    })
    .then(() => {
        // ✅ Runs after all characteristics are read
        console.log([arguments.callee.name,"✅ All characteristics read. Updated Device Info:", JSON.stringify(deviceInfo, null, 2)])
        updateDeviceInfo(JSON.stringify(deviceInfo, null, 2))
    })
    .catch(error => console.error("Error reading device information:", error));
}


// Read a Single Characteristic from Device Info Service
function readCharacteristic(service, characteristicUUID, label) {
    return service.getCharacteristic(characteristicUUID)
    .then(characteristic => characteristic.readValue())
    .then(value => {
        const decodedValue = new TextDecoder().decode(value);
        console.log([arguments.callee.name,`${label}: ${decodedValue}`])

        alert(`${label}: ${decodedValue}`);  // Display in an alert box
        return decodedValue;
    })
    .catch(error => console.error(`Error reading ${label}:`, error));
}

// Write a String to BLE Device
function writeOnCharacteristic_(value) {
    if (bleServer && bleServer.connected && commandCharacteristicFound) {

        const encoder = new TextEncoder();
        const data = encoder.encode(value);

        console.log([arguments.callee.name,"Found the Command characteristic: ", commandCharacteristicFound.uuid,data,value]);

        // deviceInfo['tx'] = getDateTime() + ' > ' + value;        
        deviceInfo['ts'] = getDateTime();   
        deviceInfo['tx'] = value;                   
        updateDeviceInfo(JSON.stringify(deviceInfo, null, 2));      

        commandCharacteristicFound.writeValue(data)
        .then(() => {
            console.log([arguments.callee.name,"Value written to CommandCharacteristic:", value])                
        })
        .catch(error => {
            console.error("Error writing to the CommandCharacteristic: ", error);
        });
    } else {
        console.error("Bluetooth is not connected. Cannot write to characteristic.");
        window.alert("Bluetooth is not connected. Cannot write to characteristic. \nConnect to BLE first!");
    }
}

let writeQueue = [];
let writingInProgress = false;
async function processQueue() {
    if (writingInProgress || writeQueue.length === 0) {
        return;  // Skip if already writing or queue is empty
    }

    writingInProgress = true;
    while (writeQueue.length > 0) {
        let value = writeQueue.shift();  // Get next value from queue
        await writeValue(value);  // Wait for previous write to finish
    }
    writingInProgress = false;
}

async function writeValue(value) {
    if (bleServer && bleServer.connected && commandCharacteristicFound) {
        const encoder = new TextEncoder();
        const data = encoder.encode(value);

        // console.log("Writing to BLE:", value);
        try {
            await commandCharacteristicFound.writeValue(data);
            console.log("Write successful:", value);
        } catch (error) {
            console.error("Error writing to BLE:", error);
        }
    } else {
        console.error("Bluetooth is not connected.");
        alert("Bluetooth is not connected.");
    }
}

// Updated function to queue writes
function writeOnCharacteristic__(value) {
    writeQueue.push(value);
    processQueue();
}

function writeOnCharacteristic(value) {

    // console.log([arguments.callee.name,value,Array.isArray(value),typeof value === "string"])

    if (typeof value === "string") {
        writeQueue.push(value);  // ✅ Push string directly
    } else if (Array.isArray(value)) {
        value.forEach(item => {
            if (typeof item === "string") {
                writeQueue.push(item);  // ✅ Push each item if it's a string
            } else {
                console.warn("Skipping non-string item:", item);
            }
        });
    } else {
        console.error("Error: Value must be a string or an array. Received:", value);
        return;
    }

    processQueue();  // Process the queue after adding the value
}


// Disconnect BLE Device
function disconnectDevice() {
    if (bleServer && bleServer.connected) {
        bleServer.disconnect();
        console.log([arguments.callee.name,"Device Disconnected"])        
        deviceInfo['name'] = 'device:disconnected';       
        updateDeviceInfo(JSON.stringify(deviceInfo, null, 2))         
    } else {
        console.error("Bluetooth is not connected.");
        window.alert("Bluetooth is not connected.");
    }
}

function handleCharacteristicChange(event){
    let valueArrayBuffer = event.target.value; // Get raw ArrayBuffer
    if (!valueArrayBuffer) {
        console.error("Received an empty value from characteristic.");
        return;
    }

    const newValueReceived = new TextDecoder().decode(event.target.value);    
    console.log([arguments.callee.name, `Characteristic ${event.target.uuid} notify :`, newValueReceived])         
  
    onRxMessage(newValueReceived)

}

function onRxObj(data){

    console.log([arguments.callee.name, data])     

    if ("insert_id" in data) {
        if (data.insert_id != "flowcount"){
            addToLogContainer(JSON.stringify(data));        
        }
    }
    
    if (data.devstatus?.led !== undefined) {
        console.log("✅ 'led' exists!", data.devstatus.led);
        cmd ={}
        cmd['led'] = data.devstatus.led
        updateLed(cmd);
    }

    if (data.devstatus?.turntable !== undefined) {
        console.log("✅ 'turntable' exists!", data.devstatus.turntable);
    }

    if (data.insert_id == "serialRx"){
        // console.log("'serialRx", data);
        onSerialRx(data);
    }

    if (data.insert_id == "log"){
        // console.log("'log", data);
        onLog(data);   
    }

    if (data.remark == "flowcount"){
        // console.log("'log", data);
        onFlowSensorData(data);
    }

    if (data.insert_id == "flowcount"){
        onFlowSensorData(data);
    }
    

}

function onRxMessage(msg){

    console.log([arguments.callee.name, _isJsonStr(msg),msg])         
    // deviceInfo['rx'] = msg;      
    let rx ={}
    let rxObj = {}
    rx['ts'] = getDateTime()
    rx['msg'] = msg

    if (msg.charAt(0) === '#'){
        _rxObj = _jsonExtract(msg)
        _jsonExtractEx(msg).forEach(cmdObj => {
            onRxObj(cmdObj)
        });
    }

    if (_isJsonStr(msg)){
        // rx['msg'] = JSON.parse(msg)
        rxObj = JSON.parse(msg)
        onRxObj(rxObj)
    }

    console.log([arguments.callee.name, _isJsonStr(msg),msg,rxObj])        

    // deviceInfo['rx'] = rx 
    deviceInfo['rx'] = msg;   
    console.log (rx)
    deviceInfo['ts'] = getDateTime()
    updateDeviceInfo(JSON.stringify(deviceInfo, null, 2))    

    if (msg=="0"){
        addToLogContainer(msg);
    }
}


// Get Date and Time
function getDateTime() {

    const now = new Date();
    
    return (`${now.getHours().toString().padStart(2, '0')}:` +
    `${now.getMinutes().toString().padStart(2, '0')}:` +
    `${now.getSeconds().toString().padStart(2, '0')}`);
}

function updateDeviceInfo(infoText) {
    const deviceInfoField = document.getElementById("deviceInfo");
    
    if (!deviceInfoField) {
        console.error("Error: Device info field not found!");
        return;
    }

    deviceInfoField.value = infoText;
    console.log([arguments.callee.name, infoText])        
}



setTimeout(updateDeviceInfo, 1000, JSON.stringify(deviceInfo, null, 2)); // Executes updateDeviceInfo(JSON.stringify(deviceInfo, null, 2)) after 1 second

// Expose Functions to Global Scope
window.connectToDevice = connectToDevice;
window.disconnectDevice = disconnectDevice;
window.writeOnCharacteristic = writeOnCharacteristic;
window.readDeviceInformation = readDeviceInformation;
window.deviceInfo = deviceInfo; 
window.bleServer = bleServer;
