
//util.js

var __ = {
  first:array=>array[0],
  last:array=>array[array.length-1],
  keys:object=>Object.keys(object),
  debounce:  function (func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    },
  isUndefined: (obj)=> typeof obj === 'undefined'
};

function OcurrenceCounter(){
    let counterObject = {};
    return {
        add:function(text){
            if(counterObject[text]){
                counterObject[text]++;
            } else{
                counterObject[text]=1;
            }
        },
        getData: function(){
            let keys = (Object.keys(counterObject));
            keys.sort()
            let data = {}
            keys.forEach((key)=>{
               data[key]=counterObject[key];
            });
            return data;
        }
    }
}

function clearSelection(select){
    select.options.forEach((option)=>{
        option = null;
    });
}

var ColorUtil = {
    "getBackgroundColorCode":function(element){
        var colorCode = $(element).css("background-color");
        console.log("background-color = "+ colorCode);
        return colorCode;
    },
    "colorCodeToRGB":function (colorCode){
        var i;
        var rgb = colorCode.replace("rgb(","").replace(")","").split(",");
        console.log("colorcode = " + colorCode);
        for(i in rgb){
            rgb[i]= parseInt(rgb[i]);
        }
        rgb.push()
        console.log("RGB = " + JSON.stringify(rgb));
        return rgb;
    },
    "getContrastingColor":function (color){

        var rgb = this.colorCodeToRGB(color);
        var c = 'rgb('+rgb[0]+','+rgb[1]+','+rgb[2]+')';
        var o = Math.round(((parseInt(rgb[0]) * 299) + (parseInt(rgb[1]) * 587) + (parseInt(rgb[2]) * 114)) /1000);
        console.log(o);

        if(o > 125) {
            return 'black';
        }else{
            return 'white';
        }
    }

};

export {ColorUtil,clearSelection,OcurrenceCounter,__}

//util.js
