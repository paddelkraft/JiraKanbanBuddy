//board.js

function boardEnhancer(){

    var textFilter;
    var wideBoard=false;
    var boardheight=0;
    var resize = 20;
    var manipulatedByScript = false;
    var width = '';
    var customStyles = ".dil{padding: 3px; bottom: 3px;right: 3px;position: absolute; background-color:black;color:white;}"
        + ".hide{display:none;}"
        + ".pale {opacity: 0.15}";
    //+ ".pale {background-color: transparent; color: #ddd}";
    var filterClass = "pale";


    function addGlobalStyle(css) {
        var head, style;
        head = document.getElementsByTagName('head')[0];
        if (!head) { return; }
        style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = css;
        head.appendChild(style);
    }

    function cardAssignedTo(element){
        var avatar = element.find(".ghx-avatar-img")[0];
        if(avatar){
            return $(avatar).attr("data-tooltip").toUpperCase();
        }
        return "";
    }

    function filterBoard(){
        var filter =textFilter();

        localStorage.setItem("filter", filter);

        function filterElement(){
            var element = $(this);
            var content = element.text().toUpperCase() + cardAssignedTo(element);

            if (filter !== "" && content.indexOf(filter.toUpperCase()) === -1){
                element.addClass(filterClass);
            }else{
                element.removeClass(filterClass);
            }
        }

        $.each($(".ghx-issue"),filterElement);
        $.each($(".ghx-parent-stub"),filterElement);
    }

    function watermark(inputId,watermarkText) {

        $('#'+inputId).blur(function(){
            if ($(this).val().length === 0){
                $(this).val(watermarkText).addClass('watermark');
            }

        }).focus(function(){
            if ($(this).val() === watermarkText){
                $(this).val('').removeClass('watermark');
            }
        }).blur();
    }


    function addFilterTextbox() {
        var textbox ;

        if($("#filter-text").length){
            return;
        }
        textbox = document.createElement('input');
        textbox.type = 'text';
        textbox.setAttribute("id","filter-text");
        textbox.setAttribute("style","padding-left:10px;");
        if(localStorage.getItem("filter")){
            $(textbox).val(localStorage.getItem("filter"));
        }
        //textbox = $(textbox).wrap("<div class='dil'/>");


        if($('.subnav-container').length){
            $('.subnav-container').append(textbox);
        }else {
            $('#ghx-view-selector').append(textbox);
        }

        $("#filter-text").change(filterBoard)

        watermark("filter-text","Filter cards");

        textFilter = function(){
            var filter = "";
            if(!$(textbox).hasClass("watermark")){
                filter = $(textbox).val();
            }
            return filter;
        };

        $("#filter-text").change();
    }


    function setCardLink() {
        $.each($(".js-key-link:contains('…')"), function () {
            $(this).text($(this).attr("title"));
        });
    }

    function setCardColors() {
        $($(".ghx-grabber")).each(function () {
            var element = $(this);
            var color = ColorUtil.getBackgroundColorCode(element);
            element.parent().css("background-color", color)
                .css("color",ColorUtil.getContrastingColor(color));

            element.parent().addClass("enhanced");
        });
    }

    function daysInColumn() {
        console.log("Days in lane");
        if(! $(".ghx-days").length){
            return;
        }
        $("<div class='dil' ></div>").insertAfter(".ghx-days");
        $("<div style:'height=10px;'> </div>").insertBefore(".ghx-days");
        $(".dil").each(function () {
            var element = $(this);
            var days = $(element.siblings(".ghx-days")).attr("title").split(" ")[0];
            element.addClass("hide");
            element.html(days + " Days");

        });


        $('.ghx-issue').mouseenter(function (evt) {
            $($(this).find(".dil")).removeClass("hide");
        }).mouseleave(function (evt) {
            $($(this).find(".dil")).addClass("hide");
        });
    }

    function scrollHandling(){
        $("#ghx-pool-column").scroll(function(){
            $('div#ghx-column-header-group')
                .css('top', $("#ghx-pool-column").scrollTop());
        });
    }

    function announcementBanner(){
        var banner = $($("#announcement-banner"));
        banner.css("padding","0px");
    }


    function adjustBoardWidth() {
        var colWidth = 200;
        var columns = $('ul.ghx-column-headers li').length;
        var height;
        if (columns > 3) {

            height = $('div.ghx-work').css('height');

            if(!manipulatedByScript && height!==boardheight){
                height = height.replace("px","");
                height = parseInt(height)- resize +"px";
                $('div.ghx-work').css('height',height);
                boardheight = height;
                manipulatedByScript = true;
                resize = 30;
            }else{
                manipulatedByScript = false;
                boardheight = height;
            }


            $("#ghx-pool")
                .css('min-width', '' + colWidth * columns + 'px')
                .css('overflow-y','visible');

            $("#ghx-pool-column")
                .css('overflow-x', 'scroll')
                .css('overflow-y', 'scroll');

            width = $('ul.ghx-columns').css('width');


            $('div#ghx-column-header-group')
                .css('min-width', width)
                .css('top', $("#ghx-pool-column").scrollTop())
                .css('left', '0px')
                .css('position', 'relative');

            $('div#ghx-pool').css('padding-top', '0px');
            wideBoard = true;

        }
    }

    function enhance() {
        adjustBoardWidth();
        setCardLink();
        var  modifiedIssueCards = $(".enhanced").length;

        if(! modifiedIssueCards){
            daysInColumn();
            setCardColors();
            addFilterTextbox();
            addGlobalStyle( customStyles);
            scrollHandling();
            announcementBanner();
        }

    }

    return enhance;
}

//board.js