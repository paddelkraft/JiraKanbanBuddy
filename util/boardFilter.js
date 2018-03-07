console.log("boardFilter.js");
const boardFilter =  filters=>{
    if(!Array.isArray(filters)){
        filters = [filters];
    }
    return {
        filterBoardIssue: itemContent =>{
            return filters.map(filter=>{
                if(filter==="" || filter === '{$$}' ){
                    return true;
                }
                if (itemContent.indexOf(filter)=== -1){
                    return false;
                }
                return true;
            }).reduce((show,bool)=>{
                return show && bool;
            },true)
        }
    }
};

export default boardFilter;