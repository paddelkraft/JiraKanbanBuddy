import $ from 'jquery';

function IssuesPage(){
    return{
        runQuery : query => {
            $("#advanced-search").val(query);
            $(".search-button").click();
        },
        getQuery : () => $("#advanced-search").val(),
        labelAction : function(){
        if(!$('.jbf-modified').length ){
            $("a.lozenge").on('contextmenu',function(){
                let element = $( this);
                let href =  decodeURIComponent(element.attr('href'));
                let  parts = href.split("jql=");
                let query = parts[1].split("+=+").join(" = ");
                andAppend(query);
                return false;
            })

            $(".results-count-end").addClass('jbf-modified');
        }
        if(location.pathname.indexOf("issues")>-1){
            setTimeout(labelAction,500);
        }

    }

}
}

export default IssuesPage;