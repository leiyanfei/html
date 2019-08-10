window.onresize = function(){
	getSize();
}
getSize();
function getSize(){
	var winWidth = $(window).width();
	var font_Size;
	if(winWidth<=540){
		font_Size = winWidth/10;
	}else{
		font_Size = 540/10;
	}
	document.getElementsByTagName('html')[0].style.fontSize = font_Size + "px"
}

$(document).ready(function(){
	var flexList = [];
	$(".flex_md").each(function(){
		$(this).wrap("<div style='height:"+ $(this).outerHeight(true) +"px'></div>")
		var flex_li = {};
		var topNum = parseInt($(this).attr('top'))
		flex_li.topNum = topNum;
		flex_li.scrollTop = $(this).offset().top;
		flexList.push(flex_li)
	})
	$(window).scroll(function(){
		var winScroll = $(this).scrollTop()
		$.each(flexList,function(i,item){
			if(item.topNum>=item.scrollTop-winScroll){
				$(".flex_md").eq(i).css({ position: "fixed",width:"100%",top:item.topNum+"px" });
			}else{
				$(".flex_md").eq(i).removeAttr('style');
			}
		})
	})


	$(".show_more").on("click",function(){
		$(this).toggleClass("show_more_rotate");
		$(".all_jx_type").slideToggle()
	})

	//滚动到顶部
	$(".gotop").on("click",function(){
		console.log(0)
		$("html,body").animate({scrollTop:0},200)
	})

})