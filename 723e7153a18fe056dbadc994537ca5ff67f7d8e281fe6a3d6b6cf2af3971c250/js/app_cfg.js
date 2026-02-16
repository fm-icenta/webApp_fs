const appCfg = {
    "appInfo" :{
        "title" : "iCenta FlowSensor",
        "description" : "iCenta FlowSensor Web Control Application",
        "version" : "v0.1.1",
        "build_date" : "260216",
        "release_note" : [
            "add chart.plot",
            "add infoTab"
        ]
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
                {"_":"test" ,                 "component":"localtest","action":"123"},   
                { "_": "_" }
            ]
            }
        ]
        },

        "info_Panel":{
            "button_matrix" : [
            [ { display: "Save A", id: "saveA" }, { display: "Load A", id: "loadA" } ],
            [ { display: "Test A", id: "testA" }, { display: "Test B", id: "testB" } ],                    // only 1 button
            [ { display: "Start", id: "start" }, { display: "Stop", id: "stop" } ],
            [ { display: "Reset", id: "reset" } ]
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
