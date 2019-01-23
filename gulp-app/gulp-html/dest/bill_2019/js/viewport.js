window.onresize = function(){
  getSize();
}
getSize();
function getSize(){
  var winWidth = $(window).width();
  var winHeight = $(window).height();
  var font_Size;
  if(winWidth/winHeight>750/1206){
    winWidth = 750/1206*winHeight;
    $(".slide-main_box").addClass("slides-center");
    $(".slide-main_box").css({marginLeft:-(winWidth/2)+"px"})
    $(".slide-main_box").width(winWidth)
  }else{
    $(".slide-main_box").removeClass("slides-center");
    $(".slide-main_box").css({marginLeft:"0px"})
    $(".slide-main_box").width('100%')
  }
  font_Size = winWidth/10;
  document.getElementsByTagName('html')[0].style.fontSize = font_Size + "px";
}

$(function(){
  getSize()
})
