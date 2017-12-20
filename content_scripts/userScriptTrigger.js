import issues from './issues';
import browse from './browse';
import board from './board';
import css from './css';
css();
console.log("userScriptTrigger.js");


let url, page;

let path = pathName => pathName.split('/')[1];


setInterval(()=>{

    if(url !== location.href ||location.pathname.indexOf("secure/RapidBoard")>-1){
        if(location.pathname.indexOf("secure/RapidBoard")>-1){
            page = "secure/RapidBoard";
            board();
        }else if (location.pathname.indexOf("issues")>-1 && page !== path(location.pathname)){
            page = path(location.pathname);
            issues();
        }else if (location.pathname.indexOf("browse")>-1 && page !== path(location.pathname)){
            page = path(location.pathname);
            browse();
        }
        url = location.href;
    }

},500);