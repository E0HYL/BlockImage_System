/*! full-screen-slide.js v1.0.0 | tianjia | https://github.com/tianjiax/Personal-plug-in-library/tree/master/Full-screen-slide */
(function ($) { 
    $.fn.setSlide = function(option){ 
        var set = $.extend({ 
            slideElem: $(this), 
            switchingSpeed:600,
            isBlock:false,
            fullScreenw:false,
            fullScreenh:false,
            autoPlay:false,
            slideTime: 3000,
            prevEl:$('#slide-button-prev'),
            nextEl:$('#slide-button-next'),
            pagination:false,
            pagingTrigger:'click',
            slideLiw:1200,
            slideLih:600,
            fn:function(){

            }
        } ,option);

        return this.each(
        	function(){
        		// 参数赋值
				var SlideIndex 		=	0,
					slideElem 		=	set.slideElem.find('.slide-box'),
					switchingSpeed 	=	set.switchingSpeed,
					isBlock 		=	set.isBlock,
					fullScreenw		=	set.fullScreenw,
					fullScreenh		=	set.fullScreenh,
					slideLiw		= 	set.slideLiw,
					slideLih		= 	set.slideLih,
					slidePrev 		= 	set.prevEl,
					slideNext 		= 	set.nextEl,
					pagination 		=   set.pagination,
					pagingTrigger	=	set.pagingTrigger,
					fn 				=	set.fn,
					slideOut		=	slideElem.find('.slide-out'),
					slideLi 		= 	slideElem.find('.slide-li'),
					slideBullet 	= 	slideElem.find('.slide-pagination-bullet'),
					slideTime 		= 	set.slideTime,
					slideLen 		=	slideLi.length;

				// 宽度完全全屏
				if(fullScreenw){
					var slideLiw = $(window).width();
					slideOut.addClass('full-screen')
				}

				// 高度完全全屏
				if(fullScreenh){
					var slideLih = $(window).height();
					slideOut.addClass('full-screen')
				}

				// 轮播图中间主体宽高
				slideElem.css({'width':slideLiw,'height':slideLih});
				slideLi.css({'width':slideLiw,'height':slideLih});

				// 轮播图外层宽高
				slideOut.css({'width':slideLiw*slideLen,'height':slideLih});

				// 默认第一个选中
				slideLi.eq(0).addClass('slide-li-act');

				// 是否块状
				if (isBlock) {
					slideElem.css({'overflow':'hidden'});
					slideOut.addClass('isblock')
				}

				// 上一页
				slidePrev.click(function(){
					SlideIndex --;
					if(SlideIndex<0){
						SlideIndex=slideLen-1;
					}
					slide(SlideIndex)
				})

				// 下一页
				slideNext.click(function(){
					SlideIndex ++;
					if(SlideIndex>slideLen-1){
						SlideIndex=0;
					}
					slide(SlideIndex)
				})

				// 添加分页导航
				if (pagination) {
					slideElem.append("<div class='slide-pagination'></div>");
					for (var i = 0; i < slideLen; i++) {
						slideElem.find('.slide-pagination').append("<span class='slide-pagination-bullet'></span>")
					}
					slideElem.find('.slide-pagination .slide-pagination-bullet').eq(0).addClass('slide-pagination-bullet-active');
					var slideBullet 	= 	slideElem.find('.slide-pagination-bullet');
				}

				// 分页导航
				if (pagingTrigger == 'hover') {
					var pagingTrigger = "mouseover";
				}
				slideBullet.on(pagingTrigger,function(){
					SlideIndex  = $(this).index();
					slide(SlideIndex);
				})

				// 自动播放
				if (set.autoPlay) {
					function autoPlayFun(){
						SlideIndex ++;
						if(SlideIndex>slideLen-1){
							SlideIndex=0;
						}
						slide(SlideIndex)
					}

					var autoPlaySet = setInterval(autoPlayFun,slideTime);

					slideElem.hover(
						function(){
							clearInterval(autoPlaySet)
						},
						function(){
							autoPlaySet = setInterval(autoPlayFun,slideTime)
						}
					)
				}

				// 动画执行事件
				function slide(SlideIndex){
					slideOut.stop().animate({'margin-left': '-'+slideLiw*SlideIndex},switchingSpeed);
					slideLi.eq(SlideIndex).addClass('slide-li-act').siblings().stop().removeClass('slide-li-act');
					slideBullet.eq(SlideIndex).addClass('slide-pagination-bullet-active').siblings().stop().removeClass('slide-pagination-bullet-active');
					fn && fn(SlideIndex);
					return SlideIndex;
				}
			}
        )
        
    }; 
})(jQuery);

