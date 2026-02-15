### bleWebApp

---
# 202510
- Update (app_cfg.js)
    - update version to v0.4.7
- Update (glb_led.js)
    - add UV LED control
{"component":"leds_white","action":"on","brightness":100,"insert_id":"9615d21a-4757-4ca2-b7c8-f667ce4d6cac"}
{"component":"leds_254","action":"on","brightness":100,"insert_id":"9615d21a-4757-4ca2-b7c8-f667ce4d6cac"}
{"component":"leds_365","action":"on","brightness":100,"insert_id":"9615d21a-4757-4ca2-b7c8-f667ce4d6cac"}
{"component":"leds_all","action":"on","brightness":100,"insert_id":"9615d21a-4757-4ca2-b7c8-f667ce4d6cac"}

---
# 20250925
- Update (app_cfg.js)
    - update version to v0.4.6
- Update (glb_led.js)
    - add led transition mode
- add webSerial.js
    - allow webApp connect to Serial port

---
# 20250912
- Update (app_cfg.js)
    - update version to v0.4.5
- Update (glb_led.js)
    - replace LED_5 to WS2811 leds_arr .
    - generate new command set, need FW_V0.9.16.5.UV or above 
{"component":"leds_arr","action":"on","brightness":50,"insert_id":"172729c3-8f96-4b69-978a-469ef26b5c52","index":255}
{"component":"leds_arr","action":"off","brightness":0,"insert_id":"172729c3-8f96-4b69-978a-469ef26b5c52","index":255}

---
# 20250828
- Update (app_cfg.js)
    - update version to v0.4.3
- Update (glb_turntable.js)
    - Adding individual motor control on turntable tab.git 

---
# 20250509
- Update (ble.js)
    - BLE filter by service_id
```    
       // filters: [{ namePrefix: deviceName }],   
        filters: [{ services: [bleServiceUUID] }],
```

---
# 20250416
- Update (app_cfg.js)
    - update version to v0.4.1
    - update ui.ledTab
- Update (glb_cmd.js)
    - add JSON LED command

---
# 20250226
- Update (app_cfg.js)
    - update version to v0.4.0
- Add test_ui.js test.js
    - add burn-in test

---

# 20250225
- Update (ble.js)
    - support send multiple ble command 

---
# 20250220
- Update (app.json)
    - update version to v0.3.3
- Update (app_cfg.js)
    - make it run offline
- Update (glb_led.js)
    - invert the LED brightness logic

---


# 20250214
- Update (app.json)
    - update version to v0.3.2

# 20250211
- Update (glb_led.js)
    - update led control from 4 to 6

# 20250209
- Update (ble.js)
    - update version to v0.3.1
    - update BLE_UUID to GemLightBox UUID
     - tested with FW v0.3.2


# 20250208
- Update UI (ble_ui.js)
    - add combobox to select json command

---

# 20250207
- Update UI
- BLE connected
- Add ble_cmd.js

---

# 20250203
- Initial UI release
