import $ from 'jquery';
import {ColorUtil,clearSelection,OcurrenceCounter,__} from './util';
function saveFreeTextFilter(text){
    localStorage.setItem("filter", text);
}

function FreetextFilter(filterIssues){
    return {
        freetextFilterTextbox:function () {


            function watermark(inputId,watermarkText) {

                $('#'+inputId).blur(function(){
                    if ($(this).val().length === 0){
                        $(this).val(watermarkText).addClass('watermark');
                    }

                }).focus(function(){
                    if ($(this).val() === watermarkText){
                        $(this).val('').removeClass('watermark');
                    }
                }).blur();
            }

            function filterBoard(textFilter){
                return function(){
                    saveFreeTextFilter(textFilter());
                    filterIssues();
                }
            }



            if($("#filter-text").length){
                return;
            }
            const textbox = document.createElement('input');
            textbox.type = 'text';
            textbox.setAttribute("id","filter-text");
            textbox.setAttribute("style","padding-left:10px;");
            if(localStorage.getItem("filter")){
                $(textbox).val(localStorage.getItem("filter"));
            }


            $(textbox).keyup(__.debounce(filterBoard(this.getTextFilterValue),250));

            watermark("filter-text","Find");
            $("#filter-text").change();
            return textbox;
        },
        getTextFilterValue: function(){
            let filterString = "";
            let textbox = $("#filter-text");
            if(!textbox.hasClass("watermark")){
                filterString = textbox.val();
            }
            return filterString;
        },
        clearFilter:function (){
            $("#filter-text").val("");
            saveFreeTextFilter("");
            filterIssues();
        },
        getFreetextFilterTextboxElement: ()=> $("#filter-text")[0]

    }
}



export default FreetextFilter;
