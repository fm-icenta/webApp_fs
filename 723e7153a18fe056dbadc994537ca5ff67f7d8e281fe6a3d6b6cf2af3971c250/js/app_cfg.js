const appCfg = {
    "appInfo" :{
        "title" : "OriginBT",
        "description" : "OriginBT Web Control Application",
        "version" : "v0.4.9",
        "build_date" : "251205"
    },

    "appParam" :{
        "connection" : "ble",
        "baud" : 115200,
        "port" : "com5",
    },

    "ble": {
        "deviceName": "GLB",
        "bleService":           "0000ffe0-0000-1000-8000-00805f9b34fb",
        "bleCharacteristic":    "0000ffe1-0000-1000-8000-00805f9b34fb",
        "__comments": [
            "registered UUID",
            "bleService : 0000ffe0-0000-1000-8000-00805f9b34fb",
            "bleCharacteristic : 0000ffe1-0000-1000-8000-00805f9b34fb", 
            "Testing UUID",
            "bleService : 00008018-0000-1000-8000-00805f9b34fb",
            "bleCharacteristic : 00008022-0000-1000-8000-00805f9b34fb"            
          ]
    },

    "ui": {
        "ble_comboOption": [
            { "^": "^"},             
            { "ble": "connect"},           
            { "ble": "disconnect"},      
            {"_":"System Command" },           
            {"_":"logger_p0" ,         "component":"logger","action":"0:123","insert_id":"logger"},
            {"_":"logger_p1" ,         "component":"logger","action":"1:456","insert_id":"logger"},
            {"_":"sensor_pulse" ,         "component":"pulse","action":"0:23","insert_id":"pulser"},   
            { "_": "_"} 
                       
        ],


        "flowsensor_Panel":{
        "Frames": [
            {
            "Title": "FlowSensor",
            "Command": [
                { "_": "_" } ,      
                {"_":"sensor_pulse" ,         "component":"pulse","action":"0:23","insert_id":"pulser"},   
                { "_": "_" }
            ]
            }
        ]
        },

        "Command_Panel":{
        "Frames": [
            {
            "Title": "To STM",
            "Command": [
                { "_": "_" } ,               
                // { "_": "STM Command" },                
                // {"_":"RST_AMP HI" ,         "component":"serial1","action":"@03012A01","insert_id":"stm"},
                // {"_":"RST_AMP LO" ,         "component":"serial1","action":"@03012A00","insert_id":"stm"},
                // {"_":"Init Ti Profile 00" , "component":"serial1","action":"@120500","insert_id":"stm"},
                // {"_":"Init Ti Profile 01" , "component":"serial1","action":"@120501","insert_id":"stm"},
                // {"_":"Init Ti Profile 02" , "component":"serial1","action":"@120502","insert_id":"stm"},
                { "_": "_" }
            ]
            },
            {
            "Title": "To BT",
            "Command": [
                { "_": "_" } ,                   
                // { "_": "Action Command" },                
                // {"_":"BT Pairing " ,    "component":"serial2","action":"AT#CA","insert_id":"BT_ACTION"},
                // {"_":"Clear Pairing " , "component":"serial2","action":"AT#FR","insert_id":"BT_ACTION"},
                // {"_":"Cancel Pairing ", "component":"serial2","action":"AT#CB","insert_id":"BT_ACTION"},
                // { "_": "IDC Command" },               
                // {"_":"HELP " ,          "component":"serial2","action":"HELP","insert_id":"BT_IOT"},
                // {"_":"RESET " ,         "component":"serial2","action":"RESET","insert_id":"BT_IOT"},
                // {"_":"STATUS " ,        "component":"serial2","action":"STATUS","insert_id":"BT_IOT"},
                // {"_":"CONFIG " ,        "component":"serial2","action":"CONFIG","insert_id":"BT_IOT"},
                // {"_":"RESTORE" ,        "component":"serial2","action":"RESTORE","insert_id":"BT_IOT"},
                // {"_":"VERSION" ,        "component":"serial2","action":"VERSION","insert_id":"BT_IOT"},
                // {"_":"DISCOVERABLE ON", "component":"serial2","action":"DISCOVERABLE ON","insert_id":"BT_IOT"},
                // {"_":"I2S Audio" ,      "component":"serial2","action":"SET AUDIO=1.1","insert_id":"BT_IOT"},
                // {"_":"I2S Audio" ,      "component":"serial2","action":"SET AUDIO_DIGITAL=0 44100 64 01100100 00000000","insert_id":"BT_IOT"},
                // {"_":"WRITE TO NVMEM",  "component":"serial2","action":"WRITE","insert_id":"BT_IOT"},
                // {"_":"RESET " ,         "component":"serial2","action":"RESET","insert_id":"BT_IOT"},                
                { "_": "_" }
            ]
            }
        ]
        }
    }

}

// Get parameter input
appCfg.appParam.connection = _getQueryParam("connect","ble")
appCfg.appParam.port = _getQueryParam("com","com5")
appCfg.appParam.baud = _getQueryParam("baud",115200)
appCfg.appParam.data = _getQueryParam("data",8)
appCfg.appParam.parity = _getQueryParam("parity","none")
appCfg.appParam.stopbits = _getQueryParam("stopbits",1)
appCfg.appParam.flowcontrol = _getQueryParam("flowcontrol","none")
