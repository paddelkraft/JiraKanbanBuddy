console.log("board.js");
"use strict";

import $ from 'jquery';
import JiraBoard from './JiraBoard'
import {ColorUtil,clearSelection,OcurrenceCounter,__} from './util';
import issuetypeConfig from './config/issuetypeConfig';
import boardFilter from '../util/boardFilter';
import FreetextFilter from './freetextFilter';

function boardEnhancer(){

    let width = '';
    let jiraBoard = new JiraBoard();
    let filterClass = "hide";
    const freetextFilter = FreetextFilter(filterIssues);


    function filterIssues(){


        function filterElement(){

            function cardAssignedTo(element){
                let avatar = element.find(".ghx-avatar-img")[0];
                if(avatar){
                    return $(avatar).attr("data-tooltip").toUpperCase();
                }
                return "";
            }

            function getCurrentFilterValues(){
                return [$("#filter-select").val().toUpperCase()||"", freetextFilter.getTextFilterValue().toUpperCase() ];
            }


            const element = $(this);
            const content = element.text().toUpperCase() +" "+ cardAssignedTo(element);
            let show = boardFilter(getCurrentFilterValues()).filterBoardIssue(content);

            if(!show){
                element.addClass(filterClass);
            }else{
                element.removeClass(filterClass);
            }
        }

        $.each($(".js-issue"),filterElement);
        $.each($(".ghx-parent-stub"),filterElement);
    }



    function clearFilters(){
        freetextFilter.clearFilter();
        $("#filter-select").val("");
        filterIssues();
    }



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


     function findFilters(){
        const filters = countIssuesPerExtraFieldTooltip();
        const standardFilters = [];
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
            filterSelect.innerHTML = html;
            //filterElement = filterElementBy(filters.queryString);
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
        jiraBoard.appendCustomElement(freetextFilter.freetextFilterTextbox());



        initFilters(filters);

        $(filterBy).change(()=>{
            let selected = $("#filter-by").val();
            setFilters(selected,filters[selected]);
        });

        $(filterSelect).change(filterIssues);
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
                if(e.code === "KeyX" && document.activeElement !== freetextFilter.getFreetextFilterTextboxElement()){
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