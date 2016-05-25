//trigger.js

if(window.location.pathname.indexOf("secure/RapidBoard")>-1){
    console.log("Jira kanban buddy");
    setInterval(boardEnhancer(), 500);
}

// trigger.js