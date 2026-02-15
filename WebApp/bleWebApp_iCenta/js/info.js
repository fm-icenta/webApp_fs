document.addEventListener("DOMContentLoaded", function() {
    const infoTab = document.getElementById("infoTab");
    
    const infoFrame = document.createElement("div");
    infoFrame.style.border = "2px solid #007bff"; // Blue border
    infoFrame.style.borderRadius = "10px";
    infoFrame.style.padding = "20px";
    // infoFrame.style.backgroundColor = "#f9f9f9";
    infoFrame.style.boxShadow = "2px 2px 10px rgba(0, 0, 0, 0.1)";
    infoFrame.style.display = "flex";
    infoFrame.style.flexDirection = "column";
    infoFrame.style.gap = "10px";

    
    const appInfo = document.createElement("textarea");
    appInfo.id = "appInfo";
    appInfo.rows = "10";
    appInfo.style.width = "100%";
    appInfo.readOnly = true;
    
    // fetch('js/app.json')
    //     .then(response => response.json())
    //     .then(data => {
    //         appInfo.textContent = JSON.stringify( data.appInfo,null,2) || "No app info available";
    //     })
    //     .catch(error => {
    //         console.error("Error loading app.json:", error);
    //         appInfo.textContent = JSON.stringify( appCfg.appInfo,null,2)
    //     });
    
    appInfo.textContent = JSON.stringify( appCfg.appInfo,null,2)        
    infoFrame.appendChild(appInfo);
    infoTab.appendChild(infoFrame);
});
