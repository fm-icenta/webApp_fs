// @ts-check

/**
 * @file common.js is the common js function
 * @author FM
 * @see readme.md
 */



commons = function () {
    var version = "commons.js ver 1.2";
    var name = "commons."
    /**
     * 
     * @param {string} str - test input string
     */
    function test(str) {
        console.log([name + arguments.callee.name, version, str])
        var x = document.createElement("TEXTAREA");
        x.setAttribute("id", 'Div1');
        x.setAttribute("rows", "3");
        console.log([name + arguments.callee.name, x, x.outerHTML, x.innerHTML])
    }

    return {
        test: test,
    }
}();

/**
 *
 * get version of this file  
 *  
 * @return  {string} - version string
 * @example _get_commons_ver()
 * 
 */
function _get_commons_ver() {
    return ("FM's Javascript commons ver 1.0 , 220701");
}



function _getQueryParam(key, def=""){ 
  return new URLSearchParams(location.search).get(key) ?? def;
}


/**
 *
 * This is a function to save cookie  
 * 
 * @param  {string}     cname  - cookie name
 * @param  {string}     cvalue - cookie value
 * @param  {number}     exdays - cookie expiry in day 
 * @return {void}       
 * 
 * @example _setCookie('targetip', '192.168.124.199', 10)
 * 
 */

function _setCookie(cname, cvalue, exdays) {

    if (exdays == undefined)
        exdays = 1

    // console.log ([arguments.callee.name,cname,cvalue,exdays])  

    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}


/**
 *
 * This is a function to get cookie  
 * 
 * @param  {string}     cname - cookie name
 * @return {string}     - cookie ret value
 * 
 * @example _getCookie('targetip')
 * 
 */

function _getCookie(cname) {

    // console.log ([arguments.callee.name,cname])  

    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}


/**
 *
 * This is a function to reload the browser  
 * 
 * @example _window_reload()
 * 
 */

function _window_reload() {
    location.reload();
}

/**
 *
 * This is a function to load the file from URL sync mode
 * 
 * @param  {string}     url - url
 * @param  {string}     mimeType - mimeType
 * @return {string}     - filecontent
 * 
 * @example _loadTextFileAjaxSync('/test.json')
 * 
 */

function _loadTextFileAjaxSync(url, mimeType) {
    if (mimeType == undefined)
        mimeType = "application/json"

    // console.log ([arguments.callee.name,url,mimeType])  

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, false);
    if (mimeType != null) {
        if (xmlhttp.overrideMimeType) {
            xmlhttp.overrideMimeType(mimeType);
        }
    }
    xmlhttp.send();
    if (xmlhttp.status == 200 && xmlhttp.readyState == 4) {
        return xmlhttp.responseText;
    }
    else {
        // TODO Throw exception
        return "";
    }
}

/**
 *
 * This is a function to load the file from URL Async mode
 * 
 * @param  {string}             url - url    
 * @param  {CallableFunction}   myCallback - myCallback    
 * @return {void}    
 * 
 * @example _fetch_json('/test.json',myCallback)
 * 
 */
function _fetch_json(url, myCallback) {
    console.log([arguments.callee.name, url])
    fetch(url)
        .then(res => res.json())
        .then((out) => {
            console.log('Checkout this JSON! ', typeof (out), out);
            myCallback(out)
        })
        .catch(err => { throw err });
}

/**
 *
 * This is a function to download a file from URL
 * 
 * @param  {string}    fileName - url
 * @return {void}    
 * 
 * @example _DownloadFile('/test.json') * 
 */
function _DownloadFile(fileName) {
    //Set the File URL.
    var url = fileName;
    var fArr = fileName.split("/")
    var fname = fileName

    console.log([arguments.callee.name, url, fileName, fArr, fArr.length])
    if (fArr.length != 0) {
        fname = fArr[fArr.length - 1]
    }

    //Create XMLHTTP Request.
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.responseType = "blob";
    req.onload = function () {
        //Convert the Byte Data to BLOB object.
        var blob = new Blob([req.response], { type: "application/octetstream" });

        //Check the Browser type and download the File.
        var isIE = false || !!document.documentMode;
        if (isIE) {
            window.navigator.msSaveBlob(blob, fname);
        } else {
            var url = window.URL || window.webkitURL;
            link = url.createObjectURL(blob);
            var a = document.createElement("a");
            a.setAttribute("download", fname);
            a.setAttribute("href", link);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };
    req.send();
};


/**
 *
 * This is a function to save content to a file
 * 
 * @param  {string}    fileName - 
 * @param  {string}    content -  * 
 * @return {void}    
 * 
 * @example _DownloadFile('/test.json') * 
 */

function _SaveFile(content, fileName) {

    console.log([arguments.callee.name, content, fileName])
    // Data to be saved
    // var data = "Hello, world!";

    // content = "abc"
    // Create a Blob object
    // var blob = new Blob([content], {type: "text/plain;charset=utf-8"});
    var blob = new Blob([content], { type: "text/plain;charset=us-ascii" });

    // Use FileSaver.js to prompt the user to save the file
    saveAs(blob, fileName);

}

/**
 *
 * This is a function to load a file from url and return the content and parameter to callback function
 * 
 * @param  {string}    url      - 
 * @param  {string}    callback -  callback function* 
 * @param  {string}    param    -  return to callback function* 
 * @return {void}    
 * 
 * @example _LoadFile('usr_vol/abc/test.json',callback,'abc') * 
 */

function _LoadFile(url, callback, param) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = function () {
        if (xhr.status === 200) {
            callback(xhr.responseText, param);
        } else {
            console.log('Request failed.  Returned status of ' + xhr.status);
        }
    };
    xhr.send();
}




/**
 *
 * This is a function to copy text to clipboard
 * 
 * @param  {string}    str - input string
 * 
 * @example _cp2clipboard('hello') 
 * 
 */
function _cp2clipboard(textToCopy) {

    if (navigator.clipboard) {
        // copy text to clipboard
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                console.log("Text copied to clipboard");
            })
            .catch((error) => {
                console.error("Failed to copy text: ", error);
            });
    }
    else {
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);

        textarea.select();

        try {
            const successful = document.execCommand("copy");
            const message = successful ? "Text copied to clipboard" : "Failed to copy text";
            console.log(message);
        } catch (error) {
            console.error("Failed to copy text: ", error);
        }

        document.body.removeChild(textarea);
    }


}


/**
 *
 * This is a function to encode string in base64 format
 * 
 * @param  {string}    str - input string
 * @return {string}        - base64 encoded string
 * 
 * @example _base64_encode('ls') 
 * 
 */
function _base64_encode(str) {

    return (window.btoa(str))
}

/**
 *
 * This is a function to check if the str is base64 encoded
 * 
 * @param  {string}    str - input string
 * @return {boolean}   - true/false
 * 
 * @example _is_base64_str("bHM=")
 * 
 */
function _is_base64_str(str) {

    var regexBase64 = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    var regexAscii = /^[\x00-\x7F]*$/;


    // base64 length must be divided by 4
    if (str.length % 4 != 0)
        return false

    // str contain non base64 character
    if (regexBase64.test(str) == false)
        return false

    var _str_dec = _base64_decode(str).toString()

    // console.log ([arguments.callee.name,str,regexBase64.test(str),_str_dec,regexBase64.test(_str_dec),regexAscii.test(_str_dec)])        

    // str_dec contain non base64 character
    if (regexAscii.test(_str_dec) == false)
        return false

    return true

}

/**
 *
 * This is a function to decode string in base64 format
 * 
 * @param  {string}     str - base64 encoded string    
 * @return {string}     - base64 decoded string
 * 
 * @example _base64_decode("bHM=")
 * 
 */
function _base64_decode(str) {

    return (window.atob(str))
}


/**
 * --------------------------------------------------------------------------------------
 * common browser function - End
 * --------------------------------------------------------------------------------------
*/


/**
 * --------------------------------------------------------------------------------------
 * common json object function - Start
 * --------------------------------------------------------------------------------------
*/

/**
 *
 * This is a function to check if the input string is JSON string
 * 
 * @param  {string}     str - input string    
 * @return {boolean}    - true/false
 * 
 * @example _isJsonStr('{"ABC":"123"})
 * 
 */

function _isJsonStr(str) {

    if (typeof str !== 'string' || str.length < 10) {
        return false;
    }

    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }

    return true;
}

/**
 *
 * This is a function to clone the json object
 * 
 * @param  {object}    obj - json object    
 * @return {object}    cloned json object  
 * 
 * @example _jsonClone('{"ABC":"123"})
 * 
 */

function _jsonClone(obj) {
    var _obj = JSON.parse(JSON.stringify(obj))
    return (_obj)
}

/**
 *
 * This is a function to extract json object from string
 * 
 * @param  {string}    jsonString - string contain mix json string    
 * @return {object}    json object  
 * 
 * @example _jsonExtract('afds fadsjlkfds afds {"abc":"123"} fjds dsafj {"ec1":"aa3"} ldsaf jds')
 * 
 */
function _jsonExtract(jsonString) {
    const regex = /{[^{}]*}/g;
    const matches = jsonString.match(regex);
    const objects = matches.map(match => JSON.parse(match));
    // console.log(objects);
    return (objects)
}

function _jsonExtractEx(jsonString) {
    let results = [];
    let stack = [];
    let startIndex = -1;

    for (let i = 0; i < jsonString.length; i++) {
        const char = jsonString[i];

        if (char === '{') {
            if (stack.length === 0) {
                startIndex = i; // Start of a potential JSON object
            }
            stack.push('{');
        } 
        else if (char === '}') {
            stack.pop();

            if (stack.length === 0 && startIndex !== -1) {
                let jsonSubstring = jsonString.substring(startIndex, i + 1);
                try {
                    let parsedObject = JSON.parse(jsonSubstring);
                    results.push(parsedObject);
                } catch (error) {
                    console.error("Invalid JSON detected:", jsonSubstring, error);
                }
                startIndex = -1; // Reset start index
            }
        }
    }

    return results;
}

// // Example Usage:
// const testString = 'Text before {"abc":"123", "nested": {"key": "value"}} more text {"ec1":"aa3"} end';
// console.log(_jsonExtract(testString));



function _isJSONObject(input) {
    return typeof input === "object" && input !== null && !Array.isArray(input);
}

/**
 * --------------------------------------------------------------------------------------
 * common json object function - End
 * --------------------------------------------------------------------------------------
*/

/**
 * --------------------------------------------------------------------------------------
 * common time function - Start
 * --------------------------------------------------------------------------------------
*/


/**
 *
 * This is a function to generate timestamp string in Hex
 *  
 * @return {string}   - timestamp in this format 
 * 
 *                    yyyyMMDDhhmmssts 
 *                  yyyy = year
 *                    MM = month
 *                    DD = day
 *                    hh = hour
 *                    mm = minute
 *                    ss = sec
 *                    ts = tenth of sec
 * 
 * @example _get_ts()  
 * 
 */


function _get_ts() {

    var ts = _getTimestampMs();
    ts = "20" + ts
    ts = ts.replace(":", "").replace(".", "");
    var ts_hex = ""

    // console.log ([arguments.callee.name,ts,ts_hex])  

    for (let i = 0; i < 8; i++) {
        var _dec_digit = parseInt(ts.substring(i * 2, i * 2 + 2))
        ts_hex += _int2hex(_dec_digit, 2);
        // console.log ([arguments.callee.name,ts,i,_dec_digit,ts_hex])  
    }

    // YYYYMMDDHHMMSSMS  
    // 20220701215727174
    // 1416070115391B11
    return (ts_hex);
}

/**
 *
 * This is a function to generate timestamp string  
 *  
 * @return {string}   - timestamp in this format yymmdd:hhmmss.{3digits ms} 
 * 
 * @example _getTimestampMs()   
 * 160721:163917.067
 * 
 */

function _getTimestampMs() {
    var now = new Date();
    var year = ("" + now.getFullYear()).substring(2, 4);
    var month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
    var day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
    var hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
    var minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
    var second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }

    var msecond = now.getMilliseconds();
    var tsecond = Math.round(msecond / 10);

    // 160721:163917.067
    var myTime = year + month + day + ":" + hour + minute + second + "." + msecond;

    return (myTime);

}

/**
 *
 * This is a function to do sync. wait 
 * 
 * @param  {number}     ms - number in milisec
 * @return {void}  
 * 
 * @example _wait(100)   
 * 
 */

function _wait(ms) {
    var start = Date.now(),
        now = start;
    while (now - start < ms) {
        now = Date.now();
    }
}

/**
 *
 * This is a function to do sync. wait 
 * 
 * @param  {number}     milliseconds - number in milisec 
 * @return {void}  
 * 
 * @example _sleep(100)   
 */

function _sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}



/**
 * --------------------------------------------------------------------------------------
 * common time function - End
 * --------------------------------------------------------------------------------------
*/


/**
 * --------------------------------------------------------------------------------------
 * common string function - Start
 * --------------------------------------------------------------------------------------
*/

/**
 *
 * This is a function _str_searchNreplace string started with prefix 
 * 
 * @param  {string}     _str     - "$$ABC $$CDE ##FGH"
 * @param  {object}     _var     - {"ABC":"123", "CDE":"456", "FGH":"$$ABC"}
 * @param  {array}      _prefArr - ["$$","##"] 
 * @param  {number}     _loop    -  1
 * @return {string}     - output string with updated variable
 * 
 * @example _str_searchNreplace("$$ABC $$CDE $$FGH", {"ABC":"123", "CDE":"456", "FGH":"$$CDE"},["$$","##"],2)
 * 
 */

function _str_searchNreplace(_str, _var, _prefArr, _loop, _debug) {
    var _ret_str = _str

    _prefArr = typeof (_prefArr) === "undefined" || _prefArr === null ? _prefArr = ["$$", "##"] : _prefArr;
    _loop = typeof (_loop) === "undefined" || _loop === null ? _loop = 1 : _loop;
    _debug = typeof (_debug) === "undefined" || _debug === null ? _debug = false : _debug;

    if (_debug)
        console.log([arguments.callee.name, "0", _str, _var, _prefArr, _loop, _ret_str, _debug])

    var _$key = ""
    for (let i = 0; i < _loop; i++) {
        for (var _key in _var) {
            for (var index in _prefArr) {
                _$key = (_prefArr[index] + _key).toString()
                // console.log ([arguments.callee.name,"0.1",_$key,_ret_str,_ret_str.includes(_$key)])                      
                if (_ret_str.includes(_$key)) {
                    // $ has special function for javascript string
                    var _str_key_val = _var[_key].replace("$$", "##")
                    // console.log ([arguments.callee.name,"1",_$key,_var[_key],_str_replaced])                       
                    _ret_str = _ret_str.replaceAll(_$key, _str_key_val)
                    // console.log ([arguments.callee.name,"3.1",_str, _var,_$key,_key,_str_replaced,_ret_str])     
                }
            }
        }
    }
    return (_ret_str)
}

/**
 *
 * This is a function to replace the "\r" and "\n" with 
 * 
 * @param  {string}     str - input string
 * @return {string}     - string remove "\r" and "\n"
 * 
 * @example _str_replace_crlf("1234\r\n")
 * 
 */

function _str_replace_crlf(str) {
    var _str = str.replace(/[\n\r]/g, '')
    return (_str)
}

/**
 *
 * This is a function to add padding until
 * 
 * @param  {string}     str - input string
 * @param  {number}     len - length of the output string
 * @param  {string}     padding - padding string 
 * @return {string}     = return string starting padding  
 * 
 * @example _str_fixlength("1234",10,"0")
 * 
 */

function _str_fixlength(str, len, padding) {
    return (str.padStart(len, padding))
}

/**
 *
 * This is a function to convert decimal to Hex with padding "0"
 * 
 * @param  {number}    d - input integer
 * @param  {number}    padding - length of the output hexstring
 * @return {string}  
 * 
 * @example _decimalToHex(12,2)
 * 
 */

function _decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
}

/**
 *
 * This is a function to convert decimal to Hex with padding "0"
 * 
 * @param  {number}  val - input integer
 * @param  {number}  len - length of the output string 
 * @return {string}  - ascii hex of the input integer
 * 
 * @example _int2hex(12,2)
 * 
 */

function _int2hex(val, len) {

    len = typeof (len) === "undefined" || len === null ? len = 2 : len;

    var hex = parseInt(val).toString(16).toUpperCase()
    hex = hex.padStart(len, "0")

    return (hex);
}

/**
 *
 * This is a function to calculate the hash value of a string
 * 
 * @param  {string}     str - input string
 * @param  {boolean}    asString - true/false true:Hex output, false:int output
 * @param  {number}     seed - defulat=0x811c9dc5 
 * @return {string}     - hash result of the input string
 * 
 * @example _hashFnv32a("fsadf", true) 
 * 
 */

function _hashFnv32a(str, asString, seed) {
    /*jshint bitwise:false */
    /*_hashFnv32a("fsadf", true) */

    var i, l,
        hval = (seed === undefined) ? 0x811c9dc5 : seed;

    for (i = 0, l = str.length; i < l; i++) {
        hval ^= str.charCodeAt(i);
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    if (asString) {
        // Convert to 8 digit hex string
        return ("0000000" + (hval >>> 0).toString(16)).substr(-8);
    }
    return hval >>> 0;
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = (c === 'x') ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * --------------------------------------------------------------------------------------
 * common string function - End
 * --------------------------------------------------------------------------------------
*/



