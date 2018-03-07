import $ from 'jquery';
import JqlQuery from '../util/jqlQuery';


function IssuesPage(){
    const self = {
        runQuery : query => {
            $("#advanced-search").val(query);
            $(".search-button").click();
        },
        getQuery : () => $("#advanced-search").val(),
        andAppend: function (jql){
            const query = new JqlQuery(self.getQuery()).wrap().and().appendChriteria(jql).query;
            this.runQuery(query);
        },

        labelAction : function(){
            if(!$('.jbf-modified').length ){
                $("a.lozenge").on('contextmenu',function(){
                    let element = $( this);
                    let href =  decodeURIComponent(element.attr('href'));
                    let  parts = href.split("jql=");
                    let query = parts[1].split("+=+").join(" = ");
                    self.andAppend(query);
                    setTimeout(self.labelAction,500);
                    return false;
                })
                $(".results-count-end").addClass('jbf-modified');
            }

            if(location.pathname.indexOf("issues")>-1){
                setTimeout(self.labelAction,500);
            }
        }
    };
    return self;
}

export default IssuesPage;