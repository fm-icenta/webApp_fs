function removeKeysWithPrefix(input, prefix = "_") {
    let obj;

    // ✅ Check if input is a JSON string and parse it
    if (typeof input === "string") {
        try {
            obj = JSON.parse(input);
        } catch (error) {
            console.error("Invalid JSON string:", error);
            return null; // Return null if parsing fails
        }
    } else if (typeof input === "object" && input !== null) {
        obj = input;
    } else {
        console.error("Input must be a JSON object or JSON string.");
        return null;
    }

    // ✅ Recursive function to clean JSON
    function clean(obj) {
        if (Array.isArray(obj)) {
            return obj.map(clean);
        } else if (typeof obj === "object" && obj !== null) {
            return Object.fromEntries(
                Object.entries(obj)
                    .filter(([key]) => !key.startsWith(prefix)) // ✅ Remove keys with prefix
                    .map(([key, value]) => [key, clean(value)])
            );
        }
        return obj;
    }

    return clean(obj);
}


function flattenArrayToJson(arr) {
    let flatObject = {};
    
    arr.forEach((item, index) => {
        for (let key in item) {
            flatObject[`${key}`] = item[key];
        }
    });

    return flatObject;
}

function getLastDigit(str) {
    let match = str.match(/\d$/);
    return match ? match[0] : '0';  // Returns the last digit or null if no digit is found
}

