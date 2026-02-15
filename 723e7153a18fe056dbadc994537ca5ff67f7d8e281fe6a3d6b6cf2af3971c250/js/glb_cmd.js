// Function to send a command to the device
function sendGlbCmd(cmd) {

    // console.log([arguments.callee.name, cmd,(typeof cmd === 'string')])        
    if (typeof cmd === 'string') {
        _jsonExtractEx(cmd).forEach(cmdObj => {
            sendGlbCmdEx(cmdObj);
        });
    } else if (_isJSONObject(cmd)) {
        sendGlbCmdEx(cmd);
    }
}

function sendGlbCmdEx(cmd) {
    console.log(`sendGlbCmdEx :`, cmd, _isJSONObject(cmd));

    // if (!("led" in cmd)){
    //     addToLog(JSON.stringify(cmd));
    // }
    
    const handlers = {
        'ble': cmd_ble,
        'ble_write': cmd_bleWrite,
        'led': cmd_led,
        'turnTable': cmd_turnTable,
        'setting': cmd_setting,        
    };

    Object.entries(cmd).forEach(([key, value]) => handlers[key]?.(value));
    if ("component" in cmd){
        cmd_componet (cmd)
    }
}

// BLE Command Handler
function cmd_componet(data){

    console.log(`cmd_componet :`, data);

    const cmd_str = _isJSONObject(data) ? JSON.stringify(data) : (typeof data === "string" ? data : "");  
    sendToBle(cmd_str);

}

function cmd_setting(data){

    console.log([arguments.callee.name, data])    
// #define  json_cmd_system_write_sn                   "{\"component\":\"system\",\"action\":\"write_setting\",\"sn\":\"11223344\",\"insert_id\":\"30CF9D5F-CF3F-4032-AC4B-1FEF498E7A83\"}"
// #define  json_cmd_system_write_mfg_date             "{\"component\":\"system\",\"action\":\"write_setting\",\"mfg_date\":\"250102\",\"insert_id\":\"30CF9D5F-CF3F-4032-AC4B-1FEF498E7A83\"}"
// #define  json_cmd_system_write_speed_scale          "{\"component\":\"system\",\"action\":\"write_setting\",\"speed_scale\":1.1,\"insert_id\":\"30CF9D5F-CF3F-4032-AC4B-1FEF498E7A83\"}"
// #define  json_cmd_system_write_angle_scale          "{\"component\":\"system\",\"action\":\"write_setting\",\"angle_scale\":1.2,\"insert_id\":\"30CF9D5F-CF3F-4032-AC4B-1FEF498E7A83\"}"
// #define  json_cmd_system_commit_setting             "{\"component\":\"system\",\"action\":\"commit_setting\",\"insert_id\":\"30CF9D5F-CF3F-4032-AC4B-1FEF498E7A83\"}"
// #define  json_cmd_system_read_setting               "{\"component\":\"system\",\"action\":\"read_setting\",\"insert_id\":\"30CF9D5F-CF3F-4032-AC4B-1FEF498E7A83\"}"

    let default_insert_id = "019614a5-e2ad-7e4e-8110-f07ba42361c0-"
    let cmd ={"component":"system"}
    
    if (data['k'] == 'sn'){
        cmd = {"component":"system","action":"write_setting","sn":"11223344","insert_id":"30CF9D5F-CF3F-4032-AC4B-1FEF498E7A83"}
        cmd['sn'] = data['d']
    }else if (data['k'] == 'mfg_date'){
        cmd = {"component":"system","action":"write_setting","mfg_date":"250102","insert_id":"30CF9D5F-CF3F-4032-AC4B-1FEF498E7A83"}
        cmd['mfg_date'] = data['d']        
    }else if (data['k'] == 'speedscale'){
        cmd = {"component":"system","action":"write_setting","speed_scale":1.1,"insert_id":"30CF9D5F-CF3F-4032-AC4B-1FEF498E7A83"}
        cmd['speed_scale'] = data['d']            
    }else if (data['k'] == 'anglescale'){
        cmd = {"component":"system","action":"write_setting","angle_scale":1.2,"insert_id":"30CF9D5F-CF3F-4032-AC4B-1FEF498E7A83"}
        cmd['angle_scale'] = data['d']        
    }else if (data['k'] == 'setting'){
        cmd = {"component":"system","action":"read_setting","insert_id":"30CF9D5F-CF3F-4032-AC4B-1FEF498E7A83"}
    }else if (data['k'] == 'commit'){
        cmd = {"component":"system","action":"commit_setting","insert_id":"30CF9D5F-CF3F-4032-AC4B-1FEF498E7A83"}
    }

    cmd['insert_id'] = default_insert_id + _hashFnv32a(_getTimestampMs(),true)


    console.log([arguments.callee.name, cmd])    
    cmdStr = JSON.stringify(cmd)
    addToLog(cmdStr)
    sendToBle(cmdStr);    

}

function cmd_ble(data) {

    console.log([arguments.callee.name, data,appCfg.appParam])  

    connection = appCfg.appParam.connection

    if (connection == 'ble'){
        switch (data.toLowerCase()) {
            case 'connect':
                connectToDevice();
                break;
            case 'disconnect':
                disconnectDevice();
                break;
            default:
                console.warn(`Unknown BLE Command: ${data}`);
        }
    }
    else if (connection == 'serial'){

        console.log([arguments.callee.name, data, "serial"])          
        switch (data.toLowerCase()) {
            case 'connect':
                connectSerial();
                break;
            case 'disconnect':
                disconnectSerial();
                break;
            default:
                console.warn(`Unknown BLE Command: ${data}`);
        }
    }

}

// LED Command Handler
function cmd_led(data) {
    console.log([arguments.callee.name, data])    

    // {'led':{'i':'0','b':'0','v':'2'}}    
    cmd = 'BXXXX'
    if (data['v']=='2A'){
        num = parseInt(data['b'])        
        cmd = 'B' + data['i'] + num.toString().padStart(3, '0')
        // addToLog(JSON.stringify(data));        
        addToLog(cmd);          
        sendToBle(cmd)
    }
    else if (data['v']=='2'){    

        cmd = {"component":"led_4","action":"on","brightness":70,"insert_id":"019618b9-dd9e-759d-859a-15a6c7d75831"}
        cmd['component'] = "led_"+data['i']
        cmd['brightness'] = parseInt(data['b']) 
        cmd['insert_id'] = generateUUID()
        if (cmd['brightness'] ==0)
            cmd['action'] = 'off'

        // Remap LED name for UV LED control 
        if (cmd['component'] == "led_5"){
            cmd['component'] = "leds_all"            
        } else if (cmd['component'] == "led_6"){
            cmd['component'] = "leds_white"   
        } else if (cmd['component'] == "led_7"){
            cmd['component'] = "leds_254"   
        } else if (cmd['component'] == "led_8"){
            cmd['component'] = "leds_365"   
        }

        if (data['i'].includes("arr")) {
            cmd['component'] = "leds_arr";
            cmd['index'] = data['i'].replace("arr_",'');
            if (cmd['index'] == 'all'){
                cmd['index'] = 255
            }
            cmd['index'] = parseInt(cmd['index'], 10)   // force to integer

            if ("m" in data) {
                cmd['index'] = cmd['index'] + (255 * parseInt(data['m'], 10)) 
            }
        }

        console.log(arguments.callee.name,cmd);     
        // console.log(arguments.callee.name,deviceInfo);      
        addToLog(JSON.stringify(cmd));
        sendToBle(cmd)        
    }
    else if (data['v']=='3'){    

        cmd = {"component":"led_4","action":"on","brightness":70,"insert_id":"019618b9-dd9e-759d-859a-15a6c7d75831"}
        cmd['component'] = "led_"+data['i']
        cmd['brightness'] = parseInt(data['b']) 
        cmd['insert_id'] = generateUUID()
        if (cmd['brightness'] ==0)
            cmd['action'] = 'off'
        // console.log(arguments.callee.name,cmd);     
        // console.log(arguments.callee.name,deviceInfo);      
        addToLog(JSON.stringify(cmd));
        sendToBle(cmd)        
    }
}

function cmd_convert_to_v2_json_cmd(data){

    // {"i":"0","r":"cw","d":"100","s":"slow","v":"2"}      // {"component":"turntable_synced","action":"rotate_clockwise","rotate_angle":100,"rotate_speed":"slow","insert_id":"019614a5-e2ad-7e4e-8110-f07ba42361c0_L0909"}
    // {"i":"0","r":"cw","d":"000","s":"slow","v":"2"}      // {"component":"turntable_synced","action":"stop_rotation","insert_id":"019614a5-e2ad-7e4e-8110-f07ba42361c0_P0000"}
    // {"i":"0","r":"cw","d":"999","s":"fast","v":"2"}      // {"component":"turntable_synced","action":"nonstop_rotate_clockwise","rotate_speed":fast,"insert_id":"019614a5-e2ad-7e4e-8110-f07ba42361c0_R999_6rpm"}
    // {"i":"0","r":"ccw","d":"999","s":"fast","v":"2"}     // {"component":"turntable_synced","action":"nonstop_rotate_counter_clockwise","rotate_speed":fast,"insert_id":"019614a5-e2ad-7e4e-8110-f07ba42361c0_R999_6rpm"}

    let cmd_v2 = {"component":"turntable_synced","action":"rotate_clockwise","rotate_angle":90,"rotate_speed":"fast","insert_id":"019614a5-e2ad-7e4e-8110-f07ba42361c0"}

    let default_insert_id = "019614a5-e2ad-7e4e-8110-f07ba42361c0-"

    // mapping component name
    if (data['i'] == '0'){
        cmd_v2['component'] = "turntable_0"
    }else if (data['i'] == '1'){
        cmd_v2['component'] = "turntable_1"
    }else if (data['i'] == '2'){
        cmd_v2['component'] = "turntable_2"
    }else if (data['i'] == 'synced'){
        cmd_v2['component'] = "turntable_synced"
    }

    console.log(arguments.callee.name,data,cmd_v2);     

    let num = parseFloat(data['d']);
    let d = num.toString().padStart(3, '0');

    // mapping action    
    if (num == 999) {
        delete cmd_v2['rotate_angle']
        cmd_v2['rotate_speed'] = data['s']     
        if (data['r'] == 'cw'){
            cmd_v2['action'] = "nonstop_rotate_clockwise"
        }else if (data['r'] == 'ccw'){
            cmd_v2['action'] = "nonstop_rotate_counter_clockwise"       
        }
    } else if (num == 0) {
        delete cmd_v2['rotate_angle']
        delete cmd_v2['rotate_speed']             
        cmd_v2['action'] = "stop_rotation"            
    }else{
        cmd_v2['rotate_angle'] = num
        if (data['r'] == 'cw'){
            cmd_v2['action'] = "rotate_clockwise"
        }else if (data['r'] == 'ccw'){
            cmd_v2['action'] = "rotate_counter_clockwise"       
        }
        cmd_v2['rotate_speed'] = data['s']
    }

    cmd_v2['insert_id'] = default_insert_id + _hashFnv32a(_getTimestampMs(),true)


    return (cmd_v2)

}

function cmd_turnTable(data) {
    if (!["1", "2"].includes(data['v'])) return;

    let num = parseInt(data['d']);
    let d = num.toString().padStart(3, '0');
    let dir = data['r'].includes("ccw") ? "R" : "L";
    let speed = data['s'].includes("fast") ? "9" : "8";

    if (d === "000") {
        dir = "p";
        speed = "0";
    }

    // let cmd_v2 = {"component":"turntable_synced","action":"rotate_clockwise","rotate_angle":90,"rotate_speed":"fast","insert_id":"019614a5-e2ad-7e4e-8110-f07ba42361c0_L0909"}
    let cmd_v2 = {}
    let cmd 

    if (data['v'] === "2"){
        cmd_v2 = cmd_convert_to_v2_json_cmd(data)
        cmd = JSON.stringify(cmd_v2);
    }else if (data['v'] === "1"){
        cmd = `${dir}${d}${speed}`
    }

    addToLog(cmd)
    sendToBle(cmd);
}

function cmd_write2device(cmd_str){

    connection = appCfg.appParam.connection
    console.log([arguments.callee.name,connection,cmd_str]);   


    if (connection == 'ble'){
        writeOnCharacteristic(cmd_str)      // ble.js
    }
    else if (connection == 'serial'){
        handleDataSent(cmd_str)             // webSerial.js
    }



}

// BLE write Command Handler
function cmd_bleWrite(data) {
    const cmd_str = _isJSONObject(data) ? JSON.stringify(data) : (typeof data === "string" ? data : "");  
    if (cmd_str) cmd_write2device(cmd_str);
}

function sendToBle(data){
    console.log([arguments.callee.name, data])   
    cmd_bleWrite(data) 
}

// Map to external log container
function addToLog(message) {
    addToLogContainer(message);
}

// Export function for global use
window.sendGlbCmd = sendGlbCmd;
