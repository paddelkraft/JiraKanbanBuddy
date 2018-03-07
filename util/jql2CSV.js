import jqlApi from './jqlApi'
import JiraIssueParser from './jiraIssueParser'
console.log ('jql2csv');


function jql2csv(query,comfig){
    let parser = new JiraIssueParser(comfig);

    return jqlApi(query,comfig).then (issues => new Promise((resolve,reject)=>{
        resolve(toCSV(issues));
    }));
}


function toCSV(objects){
    let csv = (""+Object.keys(objects[0])).split(",").join(";")+"\n";
    objects.forEach(object=>{
        let row = "";
        Object.keys(object).forEach(key=> row += object[key]+';');
        csv+=row+'\n';
    })
    return csv;
}

export default jql2csv;