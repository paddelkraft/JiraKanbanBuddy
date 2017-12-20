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
    
    a[title^='$CnSS'],a[title^='$FaTS']{
         color:white;
        background-color:MediumPurple !important;
    }
    a[title^=\\$PI2]{
        background-color:palegreen !important;
    }
    
    a[title=AtRisk]{
        color:white;
        background-color:red !important;
    }
    
    a[title=CS]{
        color:gray;
        background-color:lightGray !important;
    }

`;
    jira.addGlobalStyle(labelCss,"labelCss");

}
