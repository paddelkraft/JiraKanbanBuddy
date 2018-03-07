/**
 * Created by a236869 on 2017-12-05.
 */

console.log("jqlQuery.js")
function JqlQuery(query){


    self = {
        query:query||"",
        issuekey:function(){
            return self.appendChriteria(`issuekey`);
        },
        issuetype:function(){
            return self.appendChriteria(`issuetype`);
        },
        epicLink:function(){
            return self.appendChriteria(`"Epic link"`);
        },
        labels:function(){
            return self.appendChriteria(`labels`);
        },
        status:function(){
            return self.appendChriteria("status");
        },
        resolved:function(){
            return self.appendChriteria("resolved");
        },
        and:function () {
            return self.appendChriteria("and");
        },
        or:function () {
            return self.appendChriteria("or");
        },
        not:function () {
            return self.appendChriteria("not");
        },
        in:function (values) {
            if(!Array.isArray(values)){
                values = [values];
            }

            values = "" + values.map(value=>(value==='EMPTY')?value:"'"+value+"'");
            return self.appendChriteria(`in (${values})`)
        },
        status:function(){
            return self.appendChriteria("status");
        },
        wrap: function(){
            self.query = '(' +jql() + ")" + sorting();//(parts.length >1)?parts.join(splitter):_.first(parts);
            return self;
        },
        orderBy : function(field){
            return self.appendChriteria( " ORDER BY " +field);
        },
        appendChriteria: function(chriteria){
            //const splitter = " ORDER BY";
            //const parts = self.query.split(splitter);
            //parts[0] += " "+ chriteria;
            self.query = jql() + " " + chriteria + sorting();//(parts.length >1)?parts.join(splitter):_.first(parts);
            return self;
        }
    }

    let jql = ()=>{
        const splitter = " ORDER BY";
        const parts = self.query.split(splitter);
        return parts[0];
    };

    let sorting = ()=>{
        const splitter = " ORDER BY";
        const parts = self.query.split(splitter);
        return (parts.length >1)? splitter + parts[1]:"";
    }

    return self;
}

export default  JqlQuery;