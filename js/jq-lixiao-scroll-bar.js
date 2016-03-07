/**
 * Created by lixiao on 2016/2/17.
 */
(function ($) {
    var thisDiv;
    var thisDivHeight;
    var thisDivChildHeight;
    var scrollBarDom;
    //默认的选项
    var defaultOption = {
        "width":"15px",
        "position":"absolute",
        "top":0,
        "right":0,
        "background":"blue",
        "scrollBarBlockColor":"#EA7E7E",
        "scrollLength":30
    };

    //合并默认与用户设置后的参数对象
    var opt;

    //判断当前的元素是否需要显示滚动条
    function isShowScrollBar(){
        if(!thisDiv){
            return false;
        }
        if(thisDivHeight < thisDivChildHeight){
            return true;
        }else{
            return false;
        }
    }

    //参数初始化
    function init(options){
        thisDiv = $(this);
        opt = $.extend({},defaultOption,options||{});
        thisDivHeight = thisDiv.height();
        thisDivChildHeight = thisDiv[0].scrollHeight;
    }

    //获取可视区外的高度
    function getContentScrollHeight(){
        return thisDiv[0].scrollHeight;
    }

    //设置滚动条位置
    function setScrollBarPosition(scrollBarBg){
        var height = opt.height || thisDiv.innerHeight();
        //var top =
        var thisDivPosition = thisDiv.css("position");
        if(thisDiv.css("position") == "static"){
            thisDiv.css("position","relative")
        }
        scrollBarBg.css({
            "width":opt.width,
            "height":height,
            "position":opt.position,
            "top":opt.top+thisDiv.scrollTop(),
            "right":opt.right,
            "background":opt.background
        });
    }
    //设置滚动块大小
    function setscrollBarBlockHeight(scrollBarBlock){
        var height = (thisDivHeight/(thisDivChildHeight-thisDivHeight))*thisDivHeight;
        scrollBarBlock.css({
            "height":height,
            "background":opt.scrollBarBlockColor
        });
    }

    //创建控件视图
    function createScrollBarView(){
        scrollBarDom = $("<div class='xiaoScrollBar' style='display: none;position:absolute;'></div>");
        var scrollBarBlock = $("<div style='position:relative;top:0;'></div>");
        setscrollBarBlockHeight(scrollBarBlock);
        setScrollBarPosition(scrollBarDom);
        scrollBarDom.append(scrollBarBlock);
        thisDiv.append(scrollBarDom)
    }

    //获取轨道长度
    function getRailway(){
        var block = scrollBarDom.find(">div");
        return scrollBarDom.height()-block.innerHeight()
    }

    //滚动滚动条
    function scrollXiaoScrollBar(direction){
        var block = scrollBarDom.find(">div");
        var blockTop = block.position().top;
        var scrollLength = (opt.scrollLength/thisDivChildHeight)*scrollBarDom.height();
        var afterScrollTop = blockTop+(scrollLength*direction);
        if(afterScrollTop < 0){
            afterScrollTop = 0;
        }
        if(afterScrollTop > scrollBarDom.height()-block.innerHeight()){
            afterScrollTop = scrollBarDom.height()-block.innerHeight();
        }
        block.css("top",afterScrollTop)
    }

    //获取滚动方向
    function mousewheelDirection(e){
        var event = window.event || e;
        if(event.wheelDelta){
            return event.wheelDelta  < 0 ? 1 : -1
        }else{
            return event.detail  > 0 ? 1 : -1
        }
    }

    //根据滚动块位置移动内容主体
    function moveContentByBarBlock(){
        var barBlockTop =$(scrollBarDom).children("div").position().top;
        var contentScrollTop = Math.ceil(barBlockTop/getRailway()*(getContentScrollHeight()-$(thisDiv).innerHeight()));
        thisDiv.scrollTop(contentScrollTop);
    }

    //拖拽滚动块
    function dragScrollBlock(){
        var block = scrollBarDom.find(">div");
        block.mousedown(function(e){
            var event = e || window.event;
            var mX = event.clientX;
            var mY = event.clientY;
        })
    }

    //声明的xiaoScrollBar控件
    $.fn.xiaoScrollBar = function(options){
        init.apply(this,options)
        createScrollBarView();
        thisDiv.bind("mouseover",function(){
            if(isShowScrollBar()){
                scrollBarDom.show();
            }else{
                scrollBarDom.hide();
            }
        })

        thisDiv.mouseleave(function(){
            scrollBarDom.hide();
        })

        dragScrollBlock();

        //ie chrom ,火狐 鼠标滚轮事件不同
        thisDiv.bind("mousewheel DOMMouseScroll",function(e){
            var direction = mousewheelDirection(e);
            scrollXiaoScrollBar(direction);
            moveContentByBarBlock();
            setScrollBarPosition(scrollBarDom);
            return false;
        })


    }
})(jQuery)
