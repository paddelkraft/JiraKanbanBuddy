
describe("ColorUtil", function(){
    describe("Convert to RGB",function(){
        it("should convert rgb(0,0,0) to [0,0,0]", function(){
            var colorCode = "rgb(0,0,0)";
            var rgb = ColorUtil.colorCodeToRGB(colorCode);
            expect(rgb).toEqual([0,0,0]);
        });
    });

    describe("Get color code",function(){
        beforeEach(function(){
            var div = $("<div id='sandbox'> </div>");
            div.css("background-color","#FFFFFF");
            $("body").append(div);
        });

        it("should get color from element", function(){
            expect(ColorUtil.getBackgroundColorCode($("#sandbox"))).toEqual("rgb(255, 255, 255)");
        });

        afterEach(function(){
            $("#sandbox").remove();
        });
    });

    describe("Contrasting color",function(){
        it("white should have black as contrasting color", function(){
            expect(ColorUtil.getContrastingColor("rgb(255, 255, 255)")).toEqual("black");
        });

        it("black should have white as contrasting color", function(){
            expect(ColorUtil.getContrastingColor("rgb(0,0,0)")).toEqual("white");
        });
    });
});


/*describe("TFS Board API ", function() {


    beforeEach(function(){
    })
		
  
	it("should get 2013 Api url from board Url", function() {
		var apiUrl = "https://paddelkraft.visualstudio.com/DefaultCollection/tfsDataCollection/_api/_backlog/GetBoard?__v=5&hubCategoryReferenceName=Custom";
		expect(apiUrl).toBe("https://paddelkraft.visualstudio.com/DefaultCollection/tfsDataCollection/_api/_backlog/GetBoard?__v=5&hubCategoryReferenceName=Custom");
	});


	approveIt("should createA new boardRecord", function(approvals) {
		var boardRecord = {"name": "My Board"};
        approvals.verify( boardRecord);
	});


});*/



