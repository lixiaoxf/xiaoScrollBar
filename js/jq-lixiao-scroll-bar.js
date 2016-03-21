/**
 * Created by lixiao on 2016/2/17.
 */
(function ($) {
    var XiaoScrollBar = function(element,options){
        this.options = null;
        this.$element = null;
        this.init(element,options)
    }
    XiaoScrollBar.VERSION = "1.0.0"

    //默认参数
    XiaoScrollBar.DEFAULTS = {
        "width":"10px",
        "position":"absolute",
        "top":0,
        "right":3,
        "radius":5,//圆角
        "verticalMargin":3,//竖直间距
        "background":"#A09999",
        "scrollBarBlockColor":"#5C5C5C",
        "scrollLength":30//滚轮滚动的长度
    };

    //初始化
    XiaoScrollBar.prototype.init = function(element,options){
        this.$element = $(element);
        this.options = $.extend({},XiaoScrollBar.DEFAULTS,options)
        this.addXiaoScrollBarEvent()
    }

    //创建滚动条
    XiaoScrollBar.prototype.createScrollBarView = function(){
        if(this.isShowScrollBar()){
            if(!this.$scrollDom){
                var scrollDom = this.$scrollDom || $("<div class='xiaoScrollBar' style='position:absolute;'></div>");
                var scrollBarBlock = this.$scrollDom ?this.$scrollDom.find("div") : $("<div style='position:relative;top:0;' class='xiaoScrollBlock'></div>");
                this.setScrollBarWrap();
                this.setscrollBarBlock(scrollBarBlock);
                this.setscrollBar(scrollDom)
                this.setScrollPosition(scrollDom);
                scrollDom.append(scrollBarBlock);
                if(!this.$scrollDom){
                    this.$scrollDom = scrollDom
                }
            }
            this.$element.parent().append(this.$scrollDom)
        }
    }

    //设置滚动层外层包裹
    XiaoScrollBar.prototype.setScrollBarWrap = function(){
        if(!this.$scrollBarWrap){
            this.$scrollBarWrap = $("<div style='position:relative'></div>")
            var width = this.$element.outerWidth();
            this.$scrollBarWrap.css({
                "width":width
            })
            this.$element.wrap(this.$scrollBarWrap);
        }
    }

    //销毁滚动条
    XiaoScrollBar.prototype.destoryShowScrollBar = function(){
        if(this.$scrollDom){
            this.$element.parent().find(this.$scrollDom).remove()
        }
    }

    //设置滚动块的样式
    XiaoScrollBar.prototype.setscrollBarBlock = function(scrollBarBlock){
        var contentHeight = this.$element[0].scrollHeight;
        var elementHeight = this.$element.height()
        console.log(contentHeight+"=====contentHeight")
        var height = (elementHeight/(contentHeight-elementHeight))*elementHeight;
        scrollBarBlock.css({
            "borderRadius":this.options.radius,
            "height":height,
            "background":this.options.scrollBarBlockColor
        });
    };

    //设置滚动条样式
    XiaoScrollBar.prototype.setscrollBar = function(scrollDom){
        scrollDom.css({
            "borderRadius":this.options.radius,
            "width":this.options.width,
            "margin":this.options.verticalMargin+"0",
            "height":this.getScrollHeight(),
            "background":this.options.background
        });
    };

    XiaoScrollBar.prototype.getScrollHeight = function(){
        var height = this.options.height || this.$element.innerHeight();
        return height-this.options.verticalMargin*2
    }

    //设置滚动条位置
    XiaoScrollBar.prototype.setScrollPosition = function(scrollDom){
        if(this.$element.parent().css("position") == "static"){
            this.$element.parent().css("position","relative")
        }
        var top = ($("#div1").outerHeight()-$("#div1").innerHeight())/2+this.options.verticalMargin;
        scrollDom.css({
            "position":this.options.position,
            "top":top,
            "right":this.options.right,
        });
    };

    //判断当前的元素是否需要显示滚动条
    XiaoScrollBar.prototype.isShowScrollBar = function(){
        if(!this.$element){
            return false;
        }
        if(this.$element.innerHeight() < this.$element[0].scrollHeight){
            return true;
        }else{
            return false;
        }
    }

    //追加触发事件
    XiaoScrollBar.prototype.addXiaoScrollBarEvent = function(){
        var _this = this;
        //鼠标移入移出 显示隐藏 滚动条
        this.$element.bind("mouseenter",function(){
            _this.createScrollBarView();
        })

        this.$element.bind("mouseleave",function(){
            _this.destoryShowScrollBar();
        })

        //鼠标拖动滚动块
        this.dragBlock();

        //ie chrom ,火狐 鼠标滚轮事件不同
        this.$element.bind("mousewheel DOMMouseScroll",function(e){
            var direction = _this.mousewheelDirection(e);
            _this.scrollXiaoScrollBar(direction);
            _this.moveContentByBarBlock();
            //_this.setScrollBarPosition();
            return false;
        })
    }

    //获取滚轮滚动方向
    XiaoScrollBar.prototype.mousewheelDirection = function(e){
        var event = window.event || e;
        if(event.wheelDelta){
            return event.wheelDelta  < 0 ? 1 : -1
        }else{
            return event.detail  > 0 ? 1 : -1
        }
    }

    //滚动滚动块
    XiaoScrollBar.prototype.scrollXiaoScrollBar = function(direction){
        var block = this.$scrollDom.find(".xiaoScrollBlock");
        var blockTop = block.position().top;
        var scrollLength = (this.options.scrollLength/this.$element[0].scrollHeight)*this.$scrollDom.height();
        var afterScrollTop = blockTop+(scrollLength*direction);
        if(afterScrollTop < 0){
            afterScrollTop = 0;
        }
        if(afterScrollTop > this.$scrollDom.innerHeight()-block.innerHeight()){
            afterScrollTop = this.$scrollDom.innerHeight()-block.innerHeight();
        }
        block.css("top",afterScrollTop)
    }

    //根据滚动块位置移动内容
    XiaoScrollBar.prototype.moveContentByBarBlock = function(){
        var barBlockTop =this.$scrollDom.children(".xiaoScrollBlock").position().top;
        var contentScrollTop = Math.ceil(barBlockTop/this.getRailway()*(this.$element[0].scrollHeight-this.$element.innerHeight()));
        this.$element.scrollTop(contentScrollTop);
    }

    //获取轨道长度
    XiaoScrollBar.prototype.getRailway = function(){
        var block = this.$scrollDom.find(".xiaoScrollBlock");
        return this.$scrollDom.height()-block.innerHeight()
    }

    //设置滚动条在内容滚动后的位置
    XiaoScrollBar.prototype.setScrollBarPosition = function(){
        var height = this.options.height || this.$element.innerHeight();
        var thisDivPosition = this.$element.css("position");
        if(this.$element.css("position") == "static"){
            this.$element.css("position","relative")
        }
        this.$scrollDom.css({
            //"width":this.options.width,
            //"height":height,
            "position":this.options.position,
            "top":this.$element.position().top,
            "right":this.options.right,
            "background":this.options.background
        });
    }

    //拖拽滚动块
    XiaoScrollBar.prototype.dragBlock = function(){
        var _this = this;
        var cY,isDrag = false;
        //var $block = this.$scrollDom.find(".xiaoScrollBlock");
        this.$element.on("mousedown",".xiaoScrollBlock",function(e){
            cY = e.pageY;
            isDrag = true;
        })
        this.$element.on("mousemove",function(e){
            if(isDrag){
                $(this).css("cursor","default");
                var block = $(this).find(".xiaoScrollBlock")
                var aY = e.pageY - cY;
                cY = e.pageY;
                var blockTop = block.position().top+aY;
                if(blockTop<0){
                    blockTop = 0;
                }else if(blockTop > _this.$scrollDom.innerHeight()-block.innerHeight()){
                    blockTop = _this.$scrollDom.innerHeight()-block.innerHeight()
                }
                block.css("top",blockTop);
                _this.moveContentByBarBlock();
                //_this.setScrollBarPosition();
                return false;
            }
        })

        this.$element.on("mouseup mouseleave",function(e){
            $(this).css("cursor","auto");
            isDrag = false;
        })

    }

    function Plugin(option){
        var opt = option || {};
        new XiaoScrollBar(this,opt);
    }

    $.fn.xiaoScrollBar = Plugin
    $.fn.xiaoScrollBar.Constructor = XiaoScrollBar;
})(jQuery)

