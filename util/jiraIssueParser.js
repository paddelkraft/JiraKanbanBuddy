//***************************************************************************/
import  _ from 'lodash';


/* Example issue config
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
            match:"in",
            filter:'["$PI2.1","$PI2.2","$PI2.3","$PI2.4","$PI2.5", "$PI2.6"]'
        }
    },
    portfolio:{
        field:"project",
        parser:{
            match:"category",
            filter:[
                {filter:"^#",name:"Start Cost"},
                {filter:"^[*]",name:"PMR"},
                {filter:"^[+]",name:"Internal"},
                {filter:"^_",name:"R&D"}
            ]
        }
    }
};

//*/
console.log("jiraIssueParser.js");

function JiraIssueParser(config){
    function emptyStringIfUndefined(value){
        return (_.isUndefined(value)||value===null)? "":value;
    }
    let self={
        getIssueFields:()=>{
            return _.compact(Object.keys(config).map(field=>config[field].fieldName));
        },

        getFieldValue:(issueData,path)=>{
            let keys = path.split('.');
            //console.log(keys);
            let value = issueData;
            try{
                keys.forEach(key=>{
                    value=value[key];
                });
            }catch(e){}
            return emptyStringIfUndefined(value);
        },
        parse:(issue)=>{
            let result = {};
            _.forEach(config,(field,fieldName) => {
                let fieldValue;
                if(field.path){
                    fieldValue= self.getFieldValue(issue,field.path);
                }else{
                    fieldValue = result[field.field];
                }

                if(!_.isUndefined(field.parser)){
                    console.log(field.parser.match);
                    fieldValue = self[field.parser.match](fieldValue,field.parser);
                }
                result[fieldName]= fieldValue ;
            });
            return result;
        },
        in:(value,parser)=>{
            //console.log(value);
            if (!Array.isArray(value)){
                value = [value];
            }
           let result = _.intersection(JSON.parse(parser.filter),value);
           //console.log(parser.filter);
           if(parser.type!=="array"){
               return emptyStringIfUndefined(result[0]);
           }
           return emptyStringIfUndefined(result);
        },
        regex:(value,parser)=>{
            //Local matcher function
            let isMatch= (value)=>{
                return value.match(RegExp(parser.filter));
            };

            if (!Array.isArray(value)){
                value = [value];
            }
            let match = value.find(isMatch)
            return emptyStringIfUndefined(match);
        },
        category:(value,parser)=>{

            if(_.isUndefined(value)||!value){
                return "";
            }
            console.log(value);
            let category =parser.filter.find((filter)=>{
                return value.match(RegExp(filter.filter))
            });
            if(category){
                category=category.name;
            }
            return category;

        }
    };

    return self;
}

export default  JiraIssueParser;



