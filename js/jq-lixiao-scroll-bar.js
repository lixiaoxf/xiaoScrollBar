/**
 * Created by lixiao on 2016/2/17.
 */

/**
 *
 * 生成的结构
 *
 *     <div class="xiaoScrollBarWrap">
 *         <div class="xiaoScrollBarContent">用户想要滚动的元素</div>
 *         <div class="xiaoScrollBar">
 *             <a class="prev"></a>
 *             <div class="xiaoScrollBarBackground">
 *                 <div class="xiaoScrollBarBlock"></div>
 *             </div>
 *             <a class="next"></a>
 *         </div>
 *     </div>
 *
 * **/
(function($){

    function XiaoScrollBar(element,options){
        this.options = null;
        this.$element = null;
        this.init(element,options)
    }

    XiaoScrollBar.VERSION = "1.0.0"

    /**
     * 默认参数
     * **/
    XiaoScrollBar.DEFAULTS = {
        "moveBlockLength":40
    };

    /**
     * 常量
     * **/
    var CONSTANT = {
        "OPPOSITE":-1,//反向
        "POSITIVE":1//正向
    }

    /**
     * 初始化
     * **/
    XiaoScrollBar.prototype.init = function(element,options){
        this.$element = $(element);
        this.options = $.extend({},XiaoScrollBar.DEFAULTS,options);
        this.xiaoScrollDOM = {};
        this.operateStatus = {
            "isisDragIng":false
        };
        this.initXiaoScrollBarView();
        this.initXiaoScrollBarEvent();
    }

    /**
     * 初始化滚动条视图
     * **/
    XiaoScrollBar.prototype.initXiaoScrollBarView = function(){
        this.__createScrollBar();
        this.__synXiaoScroll();
        this.__basicUIStyle();
        this.__calculateUI();
    }

    /**
     * 创建滚动条结构
     * **/
    XiaoScrollBar.prototype.__createScrollBar = function(){
        this.xiaoScrollDOM["wrap"] = $('<div class="xiaoScrollBarWrap"></div>');
        var xiaoScrollBarHtml =
                        '<div class="xiaoScrollBar">'+
                            '<a class="prev"></a>'+
                            '<div class="xiaoScrollBarBackground">'+
                                '<div class="xiaoScrollBarBlock"></div>'+
                            '</div>'+
                            '<a class="next"></a>'+
                        '</div>';
        this.xiaoScrollDOM["scrollBar"] = $(xiaoScrollBarHtml);
        this.xiaoScrollDOM["prev"] = this.xiaoScrollDOM["scrollBar"].find(".prev");
        this.xiaoScrollDOM["next"] = this.xiaoScrollDOM["scrollBar"].find(".next");
        this.xiaoScrollDOM["background"] = this.xiaoScrollDOM["scrollBar"].find(".xiaoScrollBarBackground");
        this.xiaoScrollDOM["block"] = this.xiaoScrollDOM["scrollBar"].find(".xiaoScrollBarBlock");
    }

    /**
     * 同步内置的滚动条对象
     * **/
    XiaoScrollBar.prototype.__synXiaoScroll = function(){
        this.$element.addClass("xiaoScrollBarContent");
        this.$element.wrap(this.xiaoScrollDOM["wrap"]);
        this.xiaoScrollDOM["wrap"] = this.$element.parent()
        this.xiaoScrollDOM["wrap"].append(this.xiaoScrollDOM["scrollBar"]);
    }

    /**
     * 设置滚动条基本样式
     * **/
    XiaoScrollBar.prototype.__basicUIStyle = function(){
        this.xiaoScrollDOM["wrap"].css({
            "width":this.$element.outerWidth(true),
            "height":this.$element.outerHeight(true),
            "display":this.$element.css("display"),
            "float":this.$element.css("float")
        });
    }

    /**
     * 计算滚动条样式
     * **/
    XiaoScrollBar.prototype.__calculateUI = function(){
        //计算滚动条背景
        this.__calculateScrollBar();
        //计算滚动块
        this.__calculateBlock();
    }

    /**
     * 计算滚动条位置
     * **/
    XiaoScrollBar.prototype.__calculateScrollBar = function(){
        var elementMarginTop = parseFloat(this.$element.css("marginTop"));
        var elementBorderTop = parseFloat(this.$element.css("borderTopWidth"));
        var left = this.$element.position().left + this.$element.outerWidth()
            -this.xiaoScrollDOM["scrollBar"].innerWidth();
        var top = this.$element.position().top+elementMarginTop+elementBorderTop;
        var height = this.$element.innerHeight();
        this.xiaoScrollDOM["scrollBar"].css({
            "top":top,
            "left":left,
            "height":height
        });
    }

    /**
     * 计算滚动块大小
     * **/
    XiaoScrollBar.prototype.__calculateBlock = function(){
       var backgroundHeight = this.xiaoScrollDOM["background"].innerHeight(),
           contentHeight = this.$element[0].scrollHeight,
           viewHeight = this.$element.innerHeight(),
           blockHeight = (viewHeight/contentHeight)*backgroundHeight;
       this.xiaoScrollDOM["block"].height(blockHeight)
    }

    /**
     * 初始化XiaoScrollBar事件
     * **/
    XiaoScrollBar.prototype.initXiaoScrollBarEvent = function(){
        this.mouseScrollMoveContent();
        this.dragBlockMoveContent();
        this.scrollBtnMoveContent();
    }

    /**
     * 滚动滚动块移动内容
     * **/
    XiaoScrollBar.prototype.mouseScrollMoveContent = function(){
        var self = this;
        //ie chrom ,火狐 鼠标滚轮事件不同
        this.$element.bind("mousewheel DOMMouseScroll",function(e){
            var direction = mousewheelDirection(e);
            self.scrollContentByBlockY(direction)
            return false;
        })
    }

    /**
     * 滚动条上的按钮移动内容
     * **/
    XiaoScrollBar.prototype.scrollBtnMoveContent = function(){
        var self = this;
        this.xiaoScrollDOM["prev"].click(function(){
            self.scrollContentByBlockY(CONSTANT["OPPOSITE"])
            return false;
        })
        this.xiaoScrollDOM["next"].click(function(){
            self.scrollContentByBlockY(CONSTANT["POSITIVE"])
            return false;
        })

        var pressTimer ;
        this.xiaoScrollDOM["prev"].on("mousedown",function(){
            pressTimer = setInterval(function(){
               self.xiaoScrollDOM["prev"].click();
           },120)
            return false;
        })
        this.xiaoScrollDOM["next"].on("mousedown",function(){
            pressTimer = setInterval(function(){
                self.xiaoScrollDOM["next"].click();
            },120)
            return false;
        })
        this.xiaoScrollDOM["prev"].on("mouseup mouseleave",function(){
            clearInterval(pressTimer)
        })
        this.xiaoScrollDOM["next"].on("mouseup mouseleave",function(){
            clearInterval(pressTimer)
        })
    }

    /**
     * 拖拽滚动块移动内容
     * **/
    XiaoScrollBar.prototype.dragBlockMoveContent = function(){
        this.operateStatus["isDragIng"] = false
        var block = this.xiaoScrollDOM["block"],
            mouseDownY,self=this;
        block.on("mousedown",function(e){
            var event = window.event || e;
            mouseDownY = e.pageY;
            self.operateStatus["isDragIng"] = true;
        })

        this.xiaoScrollDOM["wrap"].on("mousemove",function(e){
            if(self.operateStatus["isDragIng"]){
                var event = window.event || e,
                    curMoveY = e.pageY,
                    blockMoveLength = curMoveY - mouseDownY,
                    blockTop = block.position().top,
                    afterMoveBlockTop = blockTop+blockMoveLength,
                    blockBackgroundHeight = self.xiaoScrollDOM["background"].innerHeight(),
                    blockHeight = self.xiaoScrollDOM["block"].height();
                if(afterMoveBlockTop<0){
                    afterMoveBlockTop = 0;
                }else if(afterMoveBlockTop>blockBackgroundHeight-blockHeight){
                    afterMoveBlockTop = blockBackgroundHeight-blockHeight;
                }
                block.css({
                    "top":afterMoveBlockTop
                })
                mouseDownY = curMoveY;
                self.moveContentByBlockY()
            }
            return false;
        })

        this.xiaoScrollDOM["wrap"].on("mouseup mouseleave",function(e){
            self.operateStatus["isDragIng"] = false;
        })

    }
    //获取滚轮滚动方向
    function mousewheelDirection(e){
        var event = window.event || e;
        if(event.wheelDelta){
            return event.wheelDelta  < 0 ? CONSTANT["POSITIVE"] : CONSTANT["OPPOSITE"]
        }else{
            return event.detail  > 0 ? CONSTANT["POSITIVE"] : CONSTANT["OPPOSITE"]
        }
    }

    /**
     * 滚动滚动块移动内容
     * **/
    XiaoScrollBar.prototype.scrollContentByBlockY = function(direction){
        var contentTarget,blockTop = this.xiaoScrollDOM["block"].position().top,
            blockTarget = direction*this.options["moveBlockLength"]+blockTop,
            blockBackgroundHeight = this.xiaoScrollDOM["background"].innerHeight(),
            blockHeight = this.xiaoScrollDOM["block"].height();
        if(blockTarget >= blockBackgroundHeight-blockHeight){
            blockTarget = blockBackgroundHeight-blockHeight
        }else if(blockTarget <= 0){
            blockTarget = 0;
        }
        this.moveBlock(blockTarget,"top");
        this.moveContentByBlockY(blockTarget)
    }

    /**
     * 移动滚动块时移动内容
     * @param blockPostion 这个参数式滚动块的top值 如果不传就是当前滚动块的top值
     * **/
    XiaoScrollBar.prototype.moveContentByBlockY = function(blockPostion){
        var contentTarget,blockTop = !blockPostion && blockPostion!=0 ?this.xiaoScrollDOM["block"].position().top:blockPostion,
            blockBackgroundHeight = this.xiaoScrollDOM["background"].innerHeight(),
            blockHeight = this.xiaoScrollDOM["block"].height(),
            elementHeight = this.$element.innerHeight(),
            contentScrollHeight = this.$element[0].scrollHeight;
            contentTarget =Math.round((blockTop/(blockBackgroundHeight-blockHeight))*(contentScrollHeight-elementHeight));
        if(contentTarget >=  contentScrollHeight - elementHeight){
            contentTarget = contentScrollHeight - elementHeight;
        }else if(contentTarget <= 0){
            contentTarget = 0;
        }
        this.moveContent(contentTarget)
    }

    /**
     * 移动滚动块
     * **/
    XiaoScrollBar.prototype.moveBlock = function(target,attr,callback){
        var self = this,timer = this.xiaoScrollDOM["block"].data("xiaoTimer"),block =this.xiaoScrollDOM["block"];
        clearInterval(timer)
        timer = setInterval(function(){
            var curpotion =block.position()[attr],speed = getSpeed(curpotion,target)
            if(curpotion == target||self.isStopMove()){
                clearInterval(timer);
            }else{
                css = {}
                css[attr] = speed < 0 ? Math.ceil(curpotion+speed):Math.floor(curpotion+speed);
                block.css(css)
            }
            callback && callback();
        },24)
        block.data("xiaoTimer",timer);
    }

    /**
     * 滚动内容
     * **/
    XiaoScrollBar.prototype.moveContent = function(target){
        var self = this,timer = self.$element.data("xiaoTimer");
        clearInterval(timer);
        timer = setInterval(function(){
             var curScrollTop = self.$element.scrollTop();
             if(curScrollTop == target){
                 clearInterval(timer)
             }else{
                 var speed = getSpeed(curScrollTop,target);

                 var afterScroll = speed < 0 ? Math.ceil(curScrollTop+getSpeed(curScrollTop,target)):
                     Math.floor(curScrollTop+getSpeed(curScrollTop,target));

                 self.$element.scrollTop(afterScroll);
             }
        },24)

            this.$element.data("xiaoTimer",timer);
    }

    /**
     * 是否停止移动
     * **/
    XiaoScrollBar.prototype.isStopMove = function(){
        return this.operateStatus["isDragIng"]
    }


    //获取运动距离
    function getSpeed(curPostion,targetPosition){
        var speed = (targetPosition-curPostion)/12;
        speed = speed>0?Math.ceil(speed):Math.floor(speed);
        return speed;
    }

    function Plugin(option){
        var opt = option || {};
        new XiaoScrollBar(this,opt);
    }

    $.fn.xiaoScrollBar = Plugin;
    $.fn.xiaoScrollBar.Constructor = XiaoScrollBar;

})(jQuery)