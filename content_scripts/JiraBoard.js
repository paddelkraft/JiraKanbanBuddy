import $ from 'jquery';
import _ from 'lodash';
console.log("JiraBoard.js");

let wideBoard=false;
let boardHeight=0;
let resize = 20;
let manipulatedByScript = false;


function goToIssuesQueryPage(jqlQuery){
    window.location = "/issues/?jql="+encodeURIComponent(jqlQuery);
}


function superBoard(){


    let customStyles = `
     .hide{display:none;}
     .pale {opacity: 0.25}
     
     .more {box-sizing: border-box;
        background: #f5f5f5;
        border: 1px solid #ccc;
        border-radius: 3.01px;
        color: #333;
        cursor: pointer;
        display: inline-block;
        font-family: inherit;
        font-size: 14px;
        font-variant: normal;
        font-weight: normal;
        height: 2.14285714em;
        line-height: 1.42857143;
        margin: 0;
        padding: 4px 10px;
        text-decoration: none;
        vertical-align: baseline;
        white-space: nowrap;
     } 
     
     `;

    let dropdownStyles = `    
      .dropdown {
                position: relative;
                display: inline-block;
                pos-
            }
        
        .dropdown-content {
            display: none;
            position: absolute;
            background-color: #f9f9f9;
            min-width: 160px;
            box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
            padding: 12px 16px;
            z-index: 100;
        }
            
        .dropdown:hover .dropdown-content {
            display: block;
        }`;
     function extContainerStyles(right){

       right = right||300;
       return `.ext-container{
            position: absolute;
            top:2px;
            left:${right}px;
            overflow:visible;
            z-index: 100;
       }`;
     }

    let issuesSearchStyles =`
            .aui-lozenge.aui-lozenge-subtle.jira-issue-status-lozenge-green {
                background-color: #14892c;
                border-color: #b2d8b9;
                color: #fff;
            }
            
            .aui-lozenge.aui-lozenge-subtle.jira-issue-status-lozenge-yellow {
                background-color: #ffe28c;
                border-color: #ffe28c;
                color: #594300;
            }
            
            .aui-lozenge.aui-lozenge-subtle.jira-issue-status-lozenge-blue-gray {
                background-color: #4a6785;
                border-color: #e4e8ed;
                color: #fff;
            }
            
            .saved-search-selector {
                background-color: #f5f5f5;
                border-bottom: 1px solid;
                padding: 5px;
            }
            
            body {
                font-size: 12px;
                line-height: 1;
            }
    `;
//+ ".pale {background-color: transparent; color: #ddd}" ;
    let highlight = false;

    return {

        addCustomBoardStyles: function () {
            let box = document.getElementById("create_link").getBoundingClientRect()
            this.addGlobalStyle(customStyles+dropdownStyles+extContainerStyles(box.x+box.width + 4),"custom");

        },
        addIssueSearchCustomStyles: function (right) {
            let box = document.getElementById("create_link").getBoundingClientRect()
            this.addGlobalStyle(customStyles+dropdownStyles +extContainerStyles(right||box.x+box.width)+ issuesSearchStyles,"custom");

        },

        addGlobalStyle: function (css,id) {
            let head, style;
            if (document.getElementById(id)){
                return;
            }
            head = document.getElementsByTagName('head')[0];
            if (!head) { return; }
            style = document.createElement('style');
            style.type = 'text/css';
            style.id = id;
            style.innerHTML = css;
            head.appendChild(style);
        },
        insertContainerDiv:function(){
            if($(".ext-container").length > 0){
                $(".ext-container").html("");
                return;
            }
            let container = document.createElement("div");
            container.setAttribute("class","ext-container");
            container.setAttribute("style","white-space: nowrap;")
            $("body").append(container);

        },
        setCardLink:function () {
            $.each($(".js-key-link:contains('…')"), function () {
                $(this).text($(this).attr("title"));
            });
        },

        scrollHandling:function (){
            $("#ghx-pool-column").scroll(function(){
                //$('div#ghx-column-header-group')
                //    .css('top', $("#ghx-pool-column").scrollTop());
            });
        },

        adjustBoardWidth:function () {
            const colWidth = 200;
            let columns = $('ul.ghx-column-headers li').length;
            let height;
            let width;
            if (columns > 3) {

                height = $('div.ghx-work').css('height');

                if (!manipulatedByScript && height !== boardHeight) {
                    height = height.replace("px", "");
                    height = parseInt(height) - resize + "px";
                    $('div.ghx-work').css('height', height);
                    boardHeight = height;
                    manipulatedByScript = true;
                    resize = 30;
                } else {
                    manipulatedByScript = false;
                    boardHeight = height;
                }


                $("#ghx-pool")
                    .css('min-width', '' + colWidth * columns + 'px')
                    .css('overflow-y', 'visible');

                $("#ghx-pool-column")
                    .css('overflow-x', 'scroll')
                    .css('overflow-y', 'scroll');

                width = $('ul.ghx-columns').css('width');


                $('div#ghx-column-header-group')
                    .css('min-width', width)
                    .css('top', $("#ghx-pool-column").scrollTop())
                    .css('left',0)
                    .css('position', 'relative');

                $('div#ghx-pool').css('padding-top', '0px');
                wideBoard = true;

            }
        },
        appendCustomElement:function (element) {

            if ($('.ext-container').length) {
                $('.ext-container').append(element);
                return;
            }
            if ($('.subnav-container').length) {
                $('.subnav-container').append(element);
            } else {
                $('#ghx-view-selector').append(element);
            }
        },

        showAllIssues: function ( filterClass ){
            $("."+filterClass).removeClass(filterClass);
        },

        trimTooltip:function(tooltip) {
            return (tooltip.indexOf("</span>") >= 0) ?
                $(tooltip).text().split("\t").join("").split("\n").join("").trim() :
                tooltip;
        },

        highlight : function (bool){
            highlight = bool;
        },

        highlightRelatedIssues:function (){
            function fadeUnrelatedIssues(epicKey) {
                $(`.ghx-issue:not(:has([data-epickey=${epicKey}]))`).addClass("pale");
                $(`.ghx-issue:has(a[title=${epicKey}])`).removeClass("pale");
            }
            $(".ghx-type[title=Epic]").mouseenter(function(e){
                let element = $(e.target);
                let issueFields = element.closest(".ghx-issue-fields")
                let keyLink = issueFields.find(".js-key-link")[0];
                let epicKey = $(keyLink).attr("title");
                fadeUnrelatedIssues(epicKey);
            });

            $("[data-epickey]").mouseenter(function(e){
                let element = $(e.target);
                let epicKey = element.attr("data-epickey");
                fadeUnrelatedIssues(epicKey);

            });
            $("[data-epickey], .ghx-type[title=Epic]").mouseleave(function(e){
                $(`.ghx-issue`).removeClass("pale");

            });
        },

        highlightByExtraField:function (){
            let self = this;

            function fadeIssuesNotMatching(tooltip) {
                $(`.ghx-issue:not(:has([data-tooltip*='${tooltip}']))`).addClass("pale");
            }


            $("span.ghx-extra-field[data-tooltip]").mouseenter(function(e){
                if(highlight){
                    let element = $(e.target);
                    let tooltip = self.trimTooltip(element.attr("data-tooltip").split(":")[1]);

                    fadeIssuesNotMatching(tooltip);
                }


            });
            $("span.ghx-extra-field[data-tooltip]").mouseleave(function(e){
                $(`.ghx-issue`).removeClass("pale");

            });
        },

        epicsMentionedOnBoard: function (){
            let epics = this.visibleEpics();
            let linkedEpics = this.linkedEpics();
            return _.uniq(_.concat(epics,linkedEpics));
        },
        visibleEpics:function(){
            let epics = {};
            let issues = $(".ghx-issue:has(.ghx-type[title=Epic]):visible , .ghx-issue-compact:has(.ghx-type[title=Epic]):visible");
            issues.each(function (){
                let issue = $(this);
                let issueKey = issue.attr("data-issue-key");
                epics[issueKey]=0;
            });
            return Object.keys(epics);
        },

        linkedEpics: function (){
            let epics = {};
            let issues = $("[data-epickey]:visible");
            issues.each(function (){
                let issue = $(this);
                let issueKey = issue.attr("data-epickey");
                epics[issueKey]=0;
            });
            console.log("Epics : " + Object.keys(epics));
            return Object.keys(epics);
        },

        allVisibleIssues:function () {
            let visibleIssues= {};
            let issues = $(".ghx-issue:visible , .ghx-issue-compact:visible");
            issues.each(function (){
                let issue = $(this);
                let issueKey = issue.attr("data-issue-key");
                visibleIssues[issueKey]=0;
            });

            return Object.keys(visibleIssues);
        }
    }
}

export default superBoard;





