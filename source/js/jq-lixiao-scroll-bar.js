/**
 * Created by lixiao on 2016/2/17.
 */

/**
 *
 * 生成的结构:
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
 *
 *  参数说明:
 *
 *  @param moveBlockLength       int类型 每次滚动块滚动的距离
 *  @param hasButton             boolean类型 是否显示上下两端的按钮
 *  @param buttonPercentum       int类型 按钮所占比例
 *  @param marginTop             int类型 代表滚动条整体距离顶部的百分比
 *  @param contentMoveCallBack   function 内容滚动时的回调函数
 *  @param blockCss              object 滚动块样式
 *  @param backgroundCss         object 滚动条样式
 *  @param scrollBarCss          object 滚动条整体样式
 *  @param nextButtonCss         object 下方滚动按钮样式
 *  @param prevButtonCss         object 上方滚动按钮样式
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
        "moveBlockLength":40,
        "hasButton":true,
        "buttonPercentum":5,
        "marginTop":2,
        "contentMoveCallBack":function(){},
        "blockCss":{},
        "backgroundCss":{},
        "scrollBarCss":{},
        "nextButtonCss":{},
        "prevButtonCss":{}
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
            "isDragIng":false
        };
        this.initXiaoScrollBarView();
        this.initXiaoScrollBarEvent();
    }

    /**
     * 初始化滚动条视图
     * **/
    XiaoScrollBar.prototype.initXiaoScrollBarView = function(){
        this.__createScrollBar();
        this.__basicUIStyle();
        this.__configUI();
        this.__calculateUI();
        this.__synXiaoScroll();

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

    XiaoScrollBar.prototype.__configUI = function(){
        var buttonHeight,backgroundCss,scrollBarCss;
        scrollBarCss = {
            "height":100-this.options["marginTop"]*2+"%",
            "top":this.options["marginTop"]+"%"
        }
        if(!this.options["hasButton"]){
            buttonHeight = 0;
            backgroundCss = {
                height:100-this.options["marginTop"]*2+"%",
                //top:this.options["marginTop"]+"%"
            }
        }else{
            buttonHeight = this.options["buttonPercentum"]+"%";
            backgroundCss = {
                height:100-this.options["buttonPercentum"]*2-this.options["marginTop"]*2+"%",
            }
        }
        $.extend(this.options["scrollBarCss"],scrollBarCss);
        $.extend(this.options["backgroundCss"],backgroundCss);
        this.options["nextButtonCss"]["height"]=
            this.options["prevButtonCss"]["height"]=buttonHeight;
        this.xiaoScrollDOM["prev"].css(this.options["prevButtonCss"])
        this.xiaoScrollDOM["next"].css(this.options["nextButtonCss"])
        this.xiaoScrollDOM["block"].css(this.options["blockCss"])
        this.xiaoScrollDOM["scrollBar"].css(this.options["scrollBarCss"])
        this.xiaoScrollDOM["background"].css(this.options["backgroundCss"])
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
     * 计算滚动条
     * **/
    XiaoScrollBar.prototype.__calculateScrollBar = function(){
        var height = this.$element.innerHeight();
        this.xiaoScrollDOM["scrollBar"].css({
            "height":height
        });
    }

    /**
     * 计算滚动块
     * **/
    XiaoScrollBar.prototype.__calculateBlock = function(){
       var backgroundHeight = this.xiaoScrollDOM["scrollBar"].find(".xiaoScrollBarBackground").innerHeight(),
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
        this.clickScrollBcakcgroundMoveContent();
        this.scrollBarHideAndShow();
    }

    /**
     * 滚动条显示隐藏
     * **/
    XiaoScrollBar.prototype.scrollBarHideAndShow = function(){
        var self = this;
        this.xiaoScrollDOM["wrap"].on("mouseenter",function(){
            self.show()
        })
        this.xiaoScrollDOM["wrap"].on("mouseleave",function(){
            self.hide()
        })
    }

    /**
     * 点击滚动条滚动内容
     * **/
    XiaoScrollBar.prototype.clickScrollBcakcgroundMoveContent = function(){
        var self = this;
        this.xiaoScrollDOM["background"].click(function(e){
            var event = e || window.event,clickY = event.pageY,
                blockHeight=self.xiaoScrollDOM["block"].innerHeight(),
                afterClick,
                backgroundOffsetTop = self.xiaoScrollDOM["background"].offset().top;
                afterClick = clickY-backgroundOffsetTop-blockHeight/2;
            afterClick = self.getActualRange(afterClick);
            self.xiaoScrollDOM["block"].css({
                "top":afterClick
            })
            self.moveContentByBlockY()
        })
    }

    /**
     * 内容滚动的回调函数
     * **/
    XiaoScrollBar.prototype.contentMoveCallBack = function(){
        this.options["contentMoveCallBack"] && this.options["contentMoveCallBack"]();
    }

    /**
     * 滚动滚动块移动内容
     * **/
    XiaoScrollBar.prototype.mouseScrollMoveContent = function(){
        var self = this;
        //ie chrom ,火狐 鼠标滚轮事件不同
        this.$element.bind("mousewheel DOMMouseScroll",function(e){
            var direction = mousewheelDirection(e);
            self.scrollContentByBlockY(direction);
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
            mouseDownY = event.pageY;
            self.operateStatus["isDragIng"] = true;
        })
        block.on("click",function(e){
            var event = window.event || e;
            if(event.stopPropagation){
                event.stopPropagation();
            }else{
                event.cancelBubble = true;
            }
        })
        this.xiaoScrollDOM["wrap"].on("mousemove",function(e){
            if(self.operateStatus["isDragIng"]){
                var event = window.event || e,
                    curMoveY = event.pageY,
                    blockMoveLength = curMoveY - mouseDownY,
                    blockTop = block.position().top,
                    afterMoveBlockTop = blockTop+blockMoveLength;

                afterMoveBlockTop = self.getActualRange(afterMoveBlockTop)
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
        var blockTop = this.xiaoScrollDOM["block"].position().top,
            blockTarget = Math.round(direction*this.options["moveBlockLength"]+blockTop),
            blockTarget = this.getActualRange(blockTarget);
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
        this.moveContent(contentTarget);
        this.contentMoveCallBack();
    }

    /**
     * 移动滚动块
     * **/
    XiaoScrollBar.prototype.moveBlock = function(target,attr,callback){
        var self = this,timer = this.xiaoScrollDOM["block"].data("xiaoTimer"),block =this.xiaoScrollDOM["block"];
        clearInterval(timer)
        timer = setInterval(function(){
            var curpotion =Math.round(block.position()[attr]),speed = getSpeed(curpotion,target)
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

    /**
     * 获取块位置的实际值
     * **/
    XiaoScrollBar.prototype.getActualRange= function(blockTarget){
        var blockBackgroundHeight = this.xiaoScrollDOM["background"].innerHeight(),
            blockHeight = this.xiaoScrollDOM["block"].height();
        if(blockTarget >= blockBackgroundHeight-blockHeight){
            blockTarget = blockBackgroundHeight-blockHeight
        }else if(blockTarget <= 0){
            blockTarget = 0;
        }
        return blockTarget
    }

    /**
     * 获取运动距离
     * **/
    function getSpeed(curPostion,targetPosition){
        var speed = (targetPosition-curPostion)/12;
        speed = speed>0?Math.ceil(speed):Math.floor(speed);
        return speed;
    }

    XiaoScrollBar.prototype.show = function(){
        this.xiaoScrollDOM["scrollBar"].stop()
        this.xiaoScrollDOM["scrollBar"].fadeIn();
    }

    XiaoScrollBar.prototype.hide = function(){
        this.xiaoScrollDOM["scrollBar"].stop()
        this.xiaoScrollDOM["scrollBar"].fadeOut();
    }

    function Plugin(option){
        var opt = option || {};
        new XiaoScrollBar(this,opt);
    }

    $.fn.xiaoScrollBar = Plugin;
    $.fn.xiaoScrollBar.Constructor = XiaoScrollBar;

})(jQuery)