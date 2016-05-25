
//util.js

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

//util.js
