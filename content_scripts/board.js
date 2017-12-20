console.log("board.js");

import $ from 'jquery';
import JiraBoard from './JiraBoard'
import {ColorUtil,clearSelection,OcurrenceCounter,__} from './util';
import issuetypeConfig from './config/issuetypeConfig';

function boardEnhancer(){

    let width = '';
    let jiraBoard = new JiraBoard();
    let filterClass = "hide";
    let filter = "";
    let filterElement;

    function saveFreeTextFilter(text){
        localStorage.setItem("filter", text);
    }

    function freetextFilterTextbox() {
        let textbox ;

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
                $.each($(".js-issue"),filterElement);
                $.each($(".ghx-parent-stub"),filterElement);
            }
        }



        if($("#filter-text").length){
            return;
        }
        textbox = document.createElement('input');
        textbox.type = 'text';
        textbox.setAttribute("id","filter-text");
        textbox.setAttribute("style","padding-left:10px;");
        if(localStorage.getItem("filter")){
            $(textbox).val(localStorage.getItem("filter"));
        }


        $(textbox).keyup(__.debounce(filterBoard(getTextFilterValue),250));

        watermark("filter-text","Find");
        $("#filter-text").change();
        return textbox;
    }

    let getTextFilterValue = function(){
        let filterString = "";
        let textbox = $("#filter-text");
        if(!textbox.hasClass("watermark")){
            filterString = textbox.val();
        }
        return filterString;
    };




    function countOpenIssuesPerEpicLinkTitle(){
        let epicTitles = OcurrenceCounter();
        $('[data-epickey]').each(function(){
            const element = $(this);

            if(! element.closest(".ghx-done").length ) { //Only open issues
                epicTitles.add([$(this).attr("title")]);
            }
            //Makes clicking an epic link open the epic in new tab
            element.click((event)=>{
                window.open('/browse/'+element.attr("data-epickey"),element.attr("data-epickey"));
                event.preventDefault();

            });
        });
        //console.log(JSON.stringify(epicTitles));
        return epicTitles.getData();

    };


    function countIssuesPerExtraFieldTooltip(){
        let extraFields = {};
        let fields = $('.ghx-extra-field');
        fields.each(function(){

            const element = $(this);
            if(! element.closest(".ghx-done").length ) {
                let tooltip = element.attr("data-tooltip");
                let parts = tooltip.split(": ");
                let fieldName = parts[0];
                let part = parts[1];
                let values;
                if (part) {
                    values = part.split(", ");
                } else {
                    values = parts[1].split(", ");
                }
                if (!extraFields[fieldName]) {
                    extraFields[fieldName] = {
                        "values": OcurrenceCounter()
                    }
                }
                values.forEach(value => {
                    extraFields[fieldName]["values"].add([value]);
                });
            }
        });


        let keys = Object.keys(extraFields);
        keys.forEach(key=>{
            let filters = {};
            try{
                Object.keys(extraFields[key].values.getData()).forEach((item)=>{
                    let trimmed = jiraBoard.trimTooltip(item);
                    filters[trimmed]= extraFields[key].values.getData()[item];

                });
            }catch(e){
                filters =  extraFields[key].values.getData();
            }
            extraFields[key].values = filters;
        });
        return extraFields;
    }

    function groupByAttribute(query,attribute){
        const groups = {};
        $(query).each(function(){
            const element = $(this);
            if(! element.closest(".ghx-done").length ) {
                groups[$(this).attr(attribute)]="";
            }
        });
        return groups;

    }



     function findFilters(){
        const filters = countIssuesPerExtraFieldTooltip();
        const standardFilters = [];
         //standardFilters.push(["Assignee", groupByAttribute(".ghx-avatar-img","data-tooltip")]);
        //standardFilters.push(["Card type", groupByAttribute(".ghx-type","title"),".ghx-type"]);
        standardFilters.push([issuetypeConfig.epic, countOpenIssuesPerEpicLinkTitle(),"span[data-epickey]"]);



        standardFilters.forEach(filter=>{
            if(Object.keys(filter[1]).length){

             filters[filter[0]] = {
                 queryString: filter[2],
                 values: filter[1]
             }
         }
        });


        return filters;
    }


    function addFilterDropdowns(filters) {
        console.log(JSON.stringify(filters));

        function setFilters(filterName,filters) {
            let html = "<option value=''>Show all </option>";
            localStorage.setItem("category",filterName);
            if(filters.queryString){
                html+= "<option value='{$$}'>No "+filterName+" </option>";
            }
            Object.keys(filters.values).sort().forEach(filter => {
                html += "<option value='" + filter + "'>" + filter + " ,"+ filters.values[filter]+ "</option>";
            });
            //select.setAttribute("style","position: absolute;bottom: 0;right: 0;opacity:0.5");
            filterSelect.innerHTML = html;
            filterElement = filterElementBy(filters.queryString);
            filterIssues();
        }

        function initFilters(filters){
            let storedCategory = localStorage.getItem("category");
            let storedCategoryFilter = localStorage.getItem("categoryFilter");
            setFilters(Object.keys(filters).reverse()[0],filters[Object.keys(filters).reverse()[0]]);
            try{
                if(storedCategory && filters[storedCategory] && Object.keys(filters[storedCategory].values).indexOf(storedCategoryFilter)!== -1 ){
                    $("#filter-by").val(storedCategory);
                    $("#filter-select").val(storedCategoryFilter);
                    filterIssues();
                }
            }catch (e){

            }
        }

        if(!Object.keys(filters).length) return;

        //Select What field to filter by
        let filterBy = document.createElement('select');
        filterBy.setAttribute("id","filter-by");
        filterBy.setAttribute("style","max-width:55px;");
        let html = "";

        Object.keys(filters).reverse().forEach( filter =>{
            html += "<option value='"+ filter + "'>" + filter + "</option>";
        });

        filterBy.innerHTML = html;
        jiraBoard.appendCustomElement(filterBy);


        // Select what value to filter by

        let filterSelect = document.createElement('select');
        filterSelect.setAttribute("id","filter-select");
        filterSelect.setAttribute("style","width:30%;max-width:150px;");
        jiraBoard.appendCustomElement(filterSelect);
        jiraBoard.appendCustomElement(freetextFilterTextbox());



        initFilters(filters);

        $(filterBy).change(()=>{
            let selected = $("#filter-by").val();
            setFilters(selected,filters[selected]);
        });

        $(filterSelect).change(filterIssues);
    }



    function filterIssues(){
        filter = $("#filter-select").val()||"";
        localStorage.setItem("categoryFilter",filter);
        filter = (typeof filter !== 'undefined')? filter : "";
        $.each($(".js-issue"),filterElement);
        $.each($(".ghx-parent-stub"),filterElement);
    }

    function filterElementBy(queryString){

        function cardAssignedTo(element){
            let avatar = element.find(".ghx-avatar-img")[0];
            if(avatar){
                return $(avatar).attr("data-tooltip").toUpperCase();
            }
            return "";
        }

        return function filterElement(){
            const element = $(this);
            const content = element.text().toUpperCase() +" "+ cardAssignedTo(element);
            const freetextFilter = getTextFilterValue().toUpperCase();
            let show = true;
            let match;
            if(queryString){
                match = element.find(queryString)[0];
            }

            if((filter==="{$$}" & typeof match !== 'undefined')
                ||(((filter !== "" & filter !== "{$$}") && content.indexOf(filter.toUpperCase()) === -1))){
                show = false;
            }
            if(show && ( freetextFilter !== ""  && content.indexOf(freetextFilter) === -1)){
                show = false;
            }

            if(!show){
                element.addClass(filterClass);
            }else{
                element.removeClass(filterClass);
            }
        }
    }

    function clearFilters(){
        $("#filter-text").val("");
        $("#filter-select").val("");
        saveFreeTextFilter("");
        filterIssues();
    }

    function addFilters(){

        if($("#filter-by").length) return;
        addFilterDropdowns(findFilters());

    }



    function dropdownMenu(epics){
        if(document.getElementsByClassName("board").length){
            return;
        }
        let container=document.createElement('div');
        container.setAttribute("id","search-for-epic-issues");
        container.setAttribute("class", "dropdown board");
        container.setAttribute("style", "font-size:small;padding:3px;")


        container.innerHTML = `
          
          <span class="more"> Query </span>
          <div class="dropdown-content" >
            <a id="clear-filters">Clear custom Filter </a><br>
            <hr>
            <a id="visible-issues" >All Issues</a><br>
            <a id="visible-epics" >${issuetypeConfig.epic}s</a><br>
            <a id="linked-epics" >Linked ${issuetypeConfig.epic}s</a><br>
            <a id="mentioned-epics" >${issuetypeConfig.epic}s / linked ${issuetypeConfig.epic}s</a><br>
            <a id="epics" >Issues on ${issuetypeConfig.epic}s / linked ${issuetypeConfig.epic}s</a><br>
            <a id="epics2" >${issuetypeConfig.epic}s / linked ${issuetypeConfig.epic}s + linked issues</a>
          </div>
        `;

        jiraBoard.appendCustomElement(container);
        $("#epics").click(()=>{
           window.location = "/issues/?jql="+encodeURIComponent('"epic link" in ('+ jiraBoard.epicsMentionedOnBoard() +')');
        });
        $("#epics2").click(()=>{
            window.location = "/issues/?jql="+encodeURIComponent('"epic link" in ('+ jiraBoard.epicsMentionedOnBoard() +
                    ')or issuekey in('+jiraBoard.epicsMentionedOnBoard()+')');
        });

        $("#mentioned-epics").click(()=>{
            window.location = "/issues/?jql="+encodeURIComponent('"issuekey" in ('+ jiraBoard.epicsMentionedOnBoard() +') ORDER BY Rank');
        });

        $("#linked-epics").click(()=>{
            window.location = "/issues/?jql="+encodeURIComponent('"issuekey" in ('+ jiraBoard.linkedEpics() +') ORDER BY Rank');
        });

        $("#visible-issues").click(()=>{
            window.location = "/issues/?jql="+encodeURIComponent('"issuekey" in ('+ jiraBoard.allVisibleIssues() +')');
        });

        $("#visible-epics").click(()=>{
            window.location = "/issues/?jql="+encodeURIComponent('"issuekey" in ('+ jiraBoard.visibleEpics() +') ORDER BY Rank');
        });

        $("#clear-filters").click(clearFilters);
    }


    function enhance() {


        jiraBoard.adjustBoardWidth();
        jiraBoard.setCardLink();
        let  modifiedIssueCards = $(".enhanced").length;



        if(! modifiedIssueCards) {
            jiraBoard.insertContainerDiv();
            $(".ext-container").html("");
            jiraBoard.addCustomBoardStyles();
            jiraBoard.scrollHandling();
            addFilters();
            dropdownMenu();

            $(".ghx-issue , .ghx-issue-compact").addClass("enhanced");
            jiraBoard.highlightRelatedIssues();
            jiraBoard.highlightByExtraField();
            document.onkeypress = function (e) {
                e = e || window.event;
                if(e.code === "KeyX"){
                    clearFilters();
                }

                if(e.code === "KeyV"){
                    jiraBoard.highlight(true);
                }
            };

            document.onkeyup = function (e) {
                e = e || window.event;

                if(e.code === "KeyV"){
                    jiraBoard.highlight(false);
                }
            };

        }
    }


    return enhance;
}
export default boardEnhancer();
//board.js