import  boardFilter  from '../util/boardFilter';
const issueContent = "Magnus Issue description Epic name Label1,label2"

test("should show item with empty filter",()=>{
    expect(boardFilter([""]).filterBoardIssue(issueContent)).toBe(true);
});

test("should show item with filter === {$$}",()=>{
    expect(boardFilter(["{$$}"]).filterBoardIssue(issueContent)).toBe(true);
});

test("should hide element when filter dont match issue content",()=>{
    expect(boardFilter(["Arne"]).filterBoardIssue(issueContent)).toBe(false);
});

test("should hide element when one filter dont match issue content",()=>{
    expect(boardFilter(["Magnus","Arne"]).filterBoardIssue(issueContent)).toBe(false);
});

test("should hide element when all filters match issue content",()=>{
    expect(boardFilter(["Magnus","Epic name"]).filterBoardIssue(issueContent)).toBe(true);
});

