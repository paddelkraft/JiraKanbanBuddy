import $ from 'jquery';
let jiraFilterApi ={
    getFavourites:function(){
        return new Promise((resolve, reject)=>{
            $.get("/rest/api/2/filter/favourite",(response)=>{
                resolve(response)
            });
        });
    },
    putFilter:function(filter){
        return jiraApiCall(jiraApiRequest("PUT",filter.self,filter));
    }
};


export default jiraFilterApi;