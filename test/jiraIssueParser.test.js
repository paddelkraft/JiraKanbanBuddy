import JiraIssueParser from '../util/jiraIssueParser';

const issue = {
    expand: "operations,versionedRepresentations,editmeta,changelog,renderedFields",
    id: "132847",
    self: "https://jira1.srv.volvo.com:8443/rest/api/2/issue/132847",
    key: "TECH-42881",
    fields: {
        summary: "Vehicle Status - Vehicle Page - See More Tell Tale details",
        issuetype: {
            self: "https://jira1.srv.volvo.com:8443/rest/api/2/issuetype/6",
            id: "6",
            description: "gh.issue.epic.desc",
            iconUrl: "https://jira1.srv.volvo.com:8443/secure/viewavatar?size=xsmall&avatarId=14407&avatarType=issuetype",
            name: "Epic",
            subtask: false,
            avatarId: 14407
        },
        customfield_11306: [
            {
                self: "https://jira1.srv.volvo.com:8443/rest/api/2/customFieldOption/13610",
                value: "NextGen - Team Fjontend",
                id: "13610"
            }
        ],
        customfield_11200: null,
        labels: [
            "#P2583-WP4",
            ".SRP1",
            ".SRP1.4",
            "CS",
            "Top10"
        ],
        status: {
            self: "https://jira1.srv.volvo.com:8443/rest/api/2/status/10014",
            description: "Implementation and test in progress",
            iconUrl: "https://jira1.srv.volvo.com:8443/images/icons/statuses/inprogress.png",
            name: "DEVELOP",
            id: "10014",
            statusCategory: {
                self: "https://jira1.srv.volvo.com:8443/rest/api/2/statuscategory/4",
                id: 4,
                key: "indeterminate",
                colorName: "yellow",
                name: "In Progress"
            }
        }
    }
};



const issueConfig ={
    issuekey:{
        fieldName:'key',
        path:'key'
    },
    summary:{
        fieldName:'summary',
        path:'fields.summary'
    },
    issuetype:{
        fieldName:'issuetype',
        path:'fields.issuetype.name'
    },
    status: {
        fieldName:'status',
        path:'fields.status.name'
    },
    serviceArea:{
        fieldName:'customfield_11306',
        path:'fields.customfield_11306.0.value',

    },
    labels:{
        fieldName:'labels',
        path:'fields.labels',
    },
    epicLink:{
        fieldName:'customfield_11200',
        path:'fields.customfield_11200'
    },
    project:{
        path:'fields.labels',
        parser:{
            type:"string",
            match:"regex",
            filter:'^[#*+_]'
        }
    },
    iteration:{
        path:'fields.labels',
        parser:{
            type:"string",
            match:"in",
            filter:'[".SRP1.1",".SRP1.2",".SRP1.3",".SRP1.4",".SRP1.5"]'
        }
    },
    portfolio:{
        field:"project",
        parser:{
            type:"string",
            match:"category",
            filter:[
                {filter:"^#",name:"Start Cost"},
                {filter:"^*",name:"PMR"},
                {filter:"^+",name:"Internal"},
                {filter:"^_",name:"R&D"}
            ]
        }
    }
};

let issueParser =  JiraIssueParser(issueConfig);

test("get list of jira fields",()=>{
    expect(issueParser.getIssueFields()).toMatchSnapshot();
});

test("parse issue detail api response",()=>{
    expect(issueParser.parse(issue)).toMatchSnapshot();
})

test("Handle empty labels field")