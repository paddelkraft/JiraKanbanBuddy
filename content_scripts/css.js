/**
 * Created by a236869 on 2017-12-04.
 */
console.log("css.js");
import JiraBoard from './JiraBoard';

export default function () {
    let jira = new JiraBoard();

    let labelCss = `
    a[title^='#'],a[title^='"*'],a[title^=\\+],a[title^='"_']{
        color:white;
        background-color:black !important;
    }
    
    a[title^=\\$CS],a[title^=\\$FaTS],a[title^='$SuS'],a[title^='$IF']{
         color:white;
        background-color:MediumPurple !important;
    }
    a[title^=\\$PI3]{
        background-color:palegreen !important;
    }
    
    a[title=AtRisk]{
        color:white;
        background-color:red !important;
    }
    a[title=PI2Crit]{
        color:white;
        background-color:red !important;
    }
    
    
    a[title=PI2Crit],a[title=spillover],a[title=Feature]{
        color:gray;
        background-color:lightGray !important;
    }

`;
    jira.addGlobalStyle(labelCss,"labelCss");

}
