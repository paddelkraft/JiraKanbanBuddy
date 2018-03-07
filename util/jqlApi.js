import $ from 'jquery';
import JiraIssueParser from './jiraIssueParser'

function issueDetailsRestApiPostRequest (query, fields, callback){
    "use strict";
    console.log(JSON.stringify(query));
    let data = {
        "jql":query,
        fields: fields,
        "startAt":0,
        "maxResults":1000
    }

    let req =  {
        beforeSend: function(xhrObj){
            xhrObj.setRequestHeader("Content-Type","application/json");
            xhrObj.setRequestHeader("Accept","application/json");
        },
        type:"POST",
        url:"/rest/api/2/search",
        dataType:"json",
        data:JSON.stringify(data),
        success: callback
    }

    req.setData = (prop,value)=>{
        data[prop] = value;
        req.data = JSON.stringify(data)
    }

    return req;
}


function jqlApi(query,config){
    let jiraIssueParser = new JiraIssueParser(config);
    let jiraFields = jiraIssueParser.getIssueFields();
    return searchForIssues(query,jiraFields).then( issues => issues.map(jiraIssueParser.parse));
}

function plusLinkedIssues (primaryQ,linkQ, config){
    let result = []
    return jqlApi(primaryQ,config).then(
        issues => {
            result = issues;
            epics = issues.filter(issue => issue.issuetype === 'Epic')
                          .map(issue => issue.issuekey);
            let q = `epiclink in (${epics})`
            if(linkQ){
                q += `and (${linkQ})`;
            }
            return jqlApi(q,config);
        }
    ).then( issues => {
        let linkedIssues = issues.filter(issue =>{
            return result.find(resultIssue=> issue.issuekey === resultIssue.issuekey)
        }) ;
        result = result.concat(linkedIssues)
        return result
    })

}

function ajax (req){


    return new Promise((resolve, reject)=>{
        req.success = (response)=>{
            resolve(response);
        }

        $.ajax(req);
    });
}

function searchForIssues(query,fields){
    let maxResults = 1000;
    let startAt = 0;
    let total = 1000
    let req = issueDetailsRestApiPostRequest(query, fields)

    return ajax(req).then(
        res =>{
            total = res.total;
            maxResults = res.maxResults;
            if(total<=maxResults){
                return res.issues;
            }else{

                let promises = [];
                req.setData('maxResults', maxResults);
                let remaining = Math.ceil((total - maxResults)/maxResults);
                for(let i = 0;i<remaining;i++) {
                    startAt += maxResults;
                    req.setData('startAt',startAt) //Uncaught (in promise) TypeError: Cannot create property 'startAt' on string '{"jql":"labels = _Logistic","fields":["key","issuetype","customfield_11200"],"startAt":0,"maxResults":1000}'
                    promises.push(ajax(req));
                }
                return Promise.all(promises).then(responses =>{
                    let allIssues = responses.map(res => res.issues).reduce((acc,issues)=> acc.concat(issues),res.issues);
                    return allIssues
                })
            }
        }
    )

}



export default jqlApi;