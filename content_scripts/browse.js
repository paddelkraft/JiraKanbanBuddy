import _ from 'lodash';
import $ from 'jquery';
import JiraBoard from './JiraBoard'

console.log("Browse.js");


let jira = new JiraBoard();





function dropdownMenu(){
    if(document.getElementsByClassName("browse").length){
        return;
    }
    let container=document.createElement('div');
    container.setAttribute("id","custom-menu");
    container.setAttribute("class", "dropdown browse");
    container.setAttribute("style", "font-size:small;padding:3px;")


    container.innerHTML = `
          
          <span class="more">Query</span>
          <div class="dropdown-content" >
            <a id="issues-on-epic">All issues on epic  </a>
          </div>
        `;

    jira.appendCustomElement(container);
    //$($(".toolbar-split toolbar-split-right")[0]).append(container);
    $("#issues-on-epic").click(()=>{
        let elements = $("img[title^='Epic']")
        if (elements.length >= 1){
            let issueKey = $($(".issue-link")[0]).attr("data-issue-key");
            window.location = "/issues/?jql="+encodeURIComponent('"epic link" in ('+ issueKey +') or issuekey in ('+ issueKey +')');
        }

        elements = $("#customfield_11200-val").find("a");
        if (elements.length >= 1){
            let issueKey = _.last($(elements[0]).attr("href").split("/"));
            window.location = "/issues/?jql="+encodeURIComponent('"epic link" in ('+ issueKey +') or issuekey in ('+ issueKey +')');
        }

    });

}

function enhance() {
    jira.addIssueSearchCustomStyles();
    jira.insertContainerDiv();
    dropdownMenu();


}

export default enhance;

