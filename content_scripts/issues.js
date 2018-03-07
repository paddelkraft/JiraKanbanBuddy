
import _ from 'lodash';
import JqlQuery from './../util/jqlQuery';
import jiraFilterApi from './../util/jiraFilterApi';
import jqlApi from './../util/jqlApi';
import $ from 'jquery';
import JiraBoard from './JiraBoard'
import JiraIssueParser from './../util/jiraIssueParser';
import issueDetailConfig from './config/issueDetailConfig';
import jql2csv from './../util/jql2csv'
import downloadCsv from './../util/downloadCsv';
import IssuesPage from './issuesPage';
console.log("issues.js");



const jira = new JiraBoard(),
      issuesPage = IssuesPage();

function basicJiraFields(){
    return{
        issuekey:{
            fieldName:'key',
            path:'key'
        },
        issuetype:{
            fieldName:'issuetype',
            path:'fields.issuetype.name'
        },
        epicLink:{
            fieldName:'customfield_11200',
            path:'fields.customfield_11200'
        }

    };

}



function IssuekeyFilter(issues){
    console.log(issues);
    let self = {
        "issues":issues,
        all: function (){
            return self.issues.map(issue=> issue.key||issue.issuekey);
        },
        stories: function(){
            return self.issues.filter(issue=> (issue.issuetype||issue.type)==="story").map(issue=> issue.issuekey);
        },
        epics: function(){
            return self.issues.filter(issue=> (issue.issuetype||issue.type)==="Epic").map(issue=> issue.issuekey);
        },
        linkedEpics: function(){
            return _.uniq(self.issues.filter(issue=> issue.epicLink)
                .map(issue=>issue.epicLink));
        }
    };
    return self;
}


function getIssues(query,fields){
    return jqlApi(query,fields).then (data => new Promise((resolve,reject)=>{
        resolve(new IssuekeyFilter(data));
    }));
}


function allEpics(){
    const query = new JqlQuery("("+issuesPage.getQuery()+")").and().issuetype().in("Epic").query;
    issuesPage.runQuery(query);
}

function allStories(){
    const query = new JqlQuery("("+issuesPage.getQuery()+")").and().issuetype().in("Story").query;
    issuesPage.runQuery(query);
}

function notEpics(){
    const query = new JqlQuery(issuesPage.getQuery()).and().issuetype().not().in("Epic").query;
    issuesPage.runQuery(query);
}

function issues(){
    getIssues(issuesPage.getQuery(),basicJiraFields()).then((issues)=>{
        let query = new JqlQuery().issuekey().in(issues.all()).query;
       issuesPage.runQuery(query);
    });
}

function allEpicsAndLinkedEpics(){
    getIssues(issuesPage.getQuery(),basicJiraFields()).then((issues)=>{
        issues = _.uniq(_.concat(issues.epics(),issues.linkedEpics()));
        let query = new JqlQuery().issuekey().in(issues).query;
        issuesPage.runQuery(query);
    });
}

function linkedEpics(){
    getIssues(issuesPage.getQuery(),basicJiraFields()).then((issues)=>{
        issues = issues.linkedEpics();
        let query = new JqlQuery().issuekey().in(issues).query;
        issuesPage.runQuery(query);
    });
}

function allIssuesOnMentionedEpics(){
    getIssues(issuesPage.getQuery(),basicJiraFields()).then((issues)=>{
        let query = new JqlQuery().epicLink().in(_.uniq(_.concat(issues.epics(),issues.linkedEpics()))).query;
        issuesPage.runQuery(query);
    });

}

function plusLinkedEpics(){
    getIssues(issuesPage.getQuery(),basicJiraFields()).then((issues)=>{
        issuesPage.runQuery(new JqlQuery().issuekey().in(issues.all()).or().issuekey().in(issues.linkedEpics()).query);
    });

}

function plusLinkedStories(){
    getIssues(issuesPage.getQuery(),basicJiraFields()).then((issues)=>{
       issuesPage.runQuery(new JqlQuery().issuekey().in(issues.all()).or().epicLink().in(issues.epics()).and().issuetype().in("Story").query);
    });

}

function plusLinkedIssues(){
    getIssues(issuesPage.getQuery(),basicJiraFields()).then((issues)=>{
       issuesPage.runQuery(new JqlQuery().issuekey().in(issues.all()).or().epicLink().in(issues.epics()).query);
    });

}

function allIssuesOnEpics(){
    getIssues(issuesPage.getQuery(),basicJiraFields()).then((issues)=>{
       issuesPage.runQuery(new JqlQuery().epicLink().in(issues.epics()).query);
    });
}

function orderByRank(){
    const query = new JqlQuery(issuesPage.getQuery()).orderBy("Rank").query;
   issuesPage.runQuery(query);
}

function wrap(){
    const query = new JqlQuery(issuesPage.getQuery()).wrap().query;
   issuesPage.runQuery(query);
}

function closed(){
    const query = new JqlQuery(issuesPage.getQuery()).and().resolved().not().in(["EMPTY"]).query;
   issuesPage.runQuery(query);
}

function notClosed(){
    const query = new JqlQuery(issuesPage.getQuery()).and().resolved().in(["EMPTY"]).query;
   issuesPage.runQuery(query);
}



function pushQueryToFilter(filterName){
    let query = issuesPage.getQuery();
    jiraFilterApi.getFavourites()
        .then(filters=>{
            return filters.filter(filter=>filter.name===filterName)[0];

        }).then(filter=>{
            filter.jql = query;
            return jiraFilterApi.putFilter(filter);
        }).then(response=>{
            console.log(response) ;

        });
}

function getDynamicFilters(){
    jiraFilterApi.getFavourites()
        .then(filters=>{
            filters.filter(filter=>filter.name.match(/^\$/))
                .map(filter=>{
                    return {
                        id:`filter-${filter.id}`,
                        link:`<a id="filter-${filter.id}">Save query to ${filter.name} </a><br>`,
                        listener: ()=>{
                              pushQueryToFilter(filter.name);
                        }
                    }
                }).forEach(filter=>{
                    $("#dropdown-manipulate").append(filter.link);
                    $("#"+filter.id).click(filter.listener);
                }
            );
        }
    )
}

function dropdownMenu(){
    if(document.getElementsByClassName("issues").length){
        return;
    }
    let container=document.createElement('div');
    container.setAttribute("id","search-issues");
    container.setAttribute("class", "dropdown issues");
    container.setAttribute("style", "font-size:small;padding:3px;")


    container.innerHTML = `
          
          <span class="more"> Query</span>
          <div id="dropdown-manipulate" class="dropdown-content" >
             <a id="issues">Issues </a><br>
            <a id="stories">Stories </a><br>
            <a id="epics">Epics </a><br>
            <a id="linked-epics">Linked epics </a><br>
            <a id="mentioned-epics">Epics / Linked epics </a><br>
            <a id="not-epics">- Epics </a><br>
            <hr>
            <a id="on-epics">Linked issues</a><br>
            <a id="on-mentioned-epics">Issues on Epics / Linked epics</a><br>
            <a id="plus-linked-epics">+ Linked epics</a><br>
            <a id="plus-linked-stories">+ Linked Stories</a><br>
            <a id="plus-linked-issues">+ Linked Issues</a><br>
            <hr>
            <a id="order-by-rank">Order by rank</a><br>
            <a id="wrap">Wrap</a><br>
            <a id="closed">Done</a><br>
            <a id="not-closed">!Done</a><br>
            <hr>
            <a id="csv">Export result as custom csv </a><br>
          </div>
        `;

    jira.appendCustomElement(container);

    $("#issues").click(issues);
    $("#stories").click(allStories);
    $("#epics").click(allEpics);
    $("#linked-epics").click(linkedEpics);
    $("#on-epics").click(allIssuesOnEpics);
    $("#not-epics").click(notEpics);
    $("#mentioned-epics").click(allEpicsAndLinkedEpics);
    $("#on-mentioned-epics").click(allIssuesOnMentionedEpics);
    $("#plus-linked-epics").click(plusLinkedEpics);
    $("#plus-linked-stories").click(plusLinkedStories);
    $("#plus-linked-issues").click(plusLinkedIssues);
    $("#order-by-rank").click(orderByRank);
    $("#wrap").click(wrap);
    $("#closed").click(closed);
    $("#not-closed").click(notClosed);
    $("#csv").click(()=>{
        jql2csv(issuesPage.getQuery(),issueDetailConfig).then(csv=>{
            downloadCsv(csv,"report.csv");
        });
    });

}


function enhance(){
    jira.addIssueSearchCustomStyles();
    jira.insertContainerDiv();
    dropdownMenu();
    getDynamicFilters();
    issuesPage.labelAction();


}


export default  enhance;

