
{/* <div data-pswp-uid="1" class="my-gallery"> //使用样式
    <figure><a href="./images/fbpic1_.jpg" data-size="3509x2481"><img src="./images/fbpic1.jpg"></a></figure>
    <figure><a href="./images/fbpic2_.jpg" data-size="3509x2481"><img src="./images/fbpic2.jpg"></a></figure>
</div> */}

var photoswipeLink = document.createElement('link');
photoswipeLink.setAttribute('rel','stylesheet prefetch')
photoswipeLink.setAttribute('href','//b.zz91.com/jixie/css/photoswipe.css')

var defaultskinLink = document.createElement('link');
defaultskinLink.setAttribute('rel','stylesheet prefetch')
defaultskinLink.setAttribute('href','//b.zz91.com/jixie/css/default-skin/default-skin.css')

var headFa = document.querySelector("head");
var linkFa = document.querySelector("link");
headFa.insertBefore(defaultskinLink,linkFa)//插入在link后面
headFa.insertBefore(photoswipeLink,linkFa) //插入在link后面


var photoswipeScript = document.createElement('script');
photoswipeScript.setAttribute('src','//b.zz91.com/jixie/js/photoswipe.min.js')

var photoswipeUiDefaultScript = document.createElement('script');
photoswipeUiDefaultScript.setAttribute('src','//b.zz91.com/jixie/js/photoswipe-ui-default.min.js')


headFa.appendChild(photoswipeScript); //插入在head
headFa.appendChild(photoswipeUiDefaultScript) //插入在head

var body = document.querySelector("body");
var bodyHtml = body.innerHTML;
body.innerHTML = bodyHtml+`<div class="pswp" tabindex="-1" role="dialog" aria-hidden="true">
                    <div class="pswp__bg"></div>
                    <div class="pswp__scroll-wrap">
                        <div class="pswp__container">
                            <div class="pswp__item"></div>
                            <div class="pswp__item"></div>
                            <div class="pswp__item"></div>
                        </div>
                        <div class="pswp__ui pswp__ui--hidden">
                            <div class="pswp__top-bar">
                                <div class="pswp__counter"></div>
                                <button class="pswp__button pswp__button--close" title="Close (Esc)"></button>
                                <button class="pswp__button pswp__button--share" title="Share"></button>
                                <button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button>
                                <button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button>
                                <div class="pswp__preloader">
                                    <div class="pswp__preloader__icn">
                                    <div class="pswp__preloader__cut">
                                        <div class="pswp__preloader__donut"></div>
                                    </div>
                                    </div>
                                </div>
                            </div>
                            <div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
                                <div class="pswp__share-tooltip"></div> 
                            </div>
                            <button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)">
                            </button>
                            <button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)">
                            </button>
                            <div class="pswp__caption">
                                <div class="pswp__caption__center"></div>
                            </div>
                        </div>
                    </div>
                    </div>`

var initPhotoSwipeFromDOM = function(gallerySelector) {

    // 解析来自DOM元素幻灯片数据（URL，标题，大小...）
    // (children of gallerySelector)
    var parseThumbnailElements = function(el) {
        var thumbElements = el.childNodes,
            numNodes = thumbElements.length,
            items = [],
            figureEl,
            linkEl,
            size,
            item;
    
        for(var i = 0; i < numNodes; i++) {
    
            figureEl = thumbElements[i]; // <figure> element
    
            // 仅包括元素节点
            if(figureEl.nodeType !== 1) {
                continue;
            }
            linkEl = figureEl.children[0]; // <a> element
            
            size = linkEl.getAttribute('data-size').split('x');
    
            // 创建幻灯片对象
            item = {
                src: linkEl.getAttribute('href'),
                w: parseInt(size[0], 10),
                h: parseInt(size[1], 10)
            };
    
    
    
            if(figureEl.children.length > 1) {
                // <figcaption> content
                item.title = figureEl.children[1].innerHTML; 
            }
    
            if(linkEl.children.length > 0) {
                // <img> 缩略图节点, 检索缩略图网址
                item.msrc = linkEl.children[0].getAttribute('src');
            } 
    
            item.el = figureEl; // 保存链接元素 for getThumbBoundsFn
            items.push(item);
        }
    
        return items;
    };
    
    // 查找最近的父节点
    var closest = function closest(el, fn) {
        return el && ( fn(el) ? el : closest(el.parentNode, fn) );
    };
    
    // 当用户点击缩略图触发
    var onThumbnailsClick = function(e) {
        e = e || window.event;
        e.preventDefault ? e.preventDefault() : e.returnValue = false;
    
        var eTarget = e.target || e.srcElement;
    
        // find root element of slide
        var clickedListItem = closest(eTarget, function(el) {
            return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
        });
    
        if(!clickedListItem) {
            return;
        }
    
        // find index of clicked item by looping through all child nodes
        // alternatively, you may define index via data- attribute
        var clickedGallery = clickedListItem.parentNode,
            childNodes = clickedListItem.parentNode.childNodes,
            numChildNodes = childNodes.length,
            nodeIndex = 0,
            index;
    
        for (var i = 0; i < numChildNodes; i++) {
            if(childNodes[i].nodeType !== 1) { 
                continue; 
            }
    
            if(childNodes[i] === clickedListItem) {
                index = nodeIndex;
                break;
            }
            nodeIndex++;
        }
    
    
    
        if(index >= 0) {
            // open PhotoSwipe if valid index found
            openPhotoSwipe( index, clickedGallery );
        }
        return false;
    };
    
    // parse picture index and gallery index from URL (#&pid=1&gid=2)
    var photoswipeParseHash = function() {
        var hash = window.location.hash.substring(1),
        params = {};
    
        if(hash.length < 5) {
            return params;
        }
    
        var vars = hash.split('&');
        for (var i = 0; i < vars.length; i++) {
            if(!vars[i]) {
                continue;
            }
            var pair = vars[i].split('=');  
            if(pair.length < 2) {
                continue;
            }           
            params[pair[0]] = pair[1];
        }
    
        if(params.gid) {
            params.gid = parseInt(params.gid, 10);
        }
    
        return params;
    };
    
    var openPhotoSwipe = function(index, galleryElement, disableAnimation, fromURL) {
        var pswpElement = document.querySelectorAll('.pswp')[0],
            gallery,
            options,
            items;
    
        items = parseThumbnailElements(galleryElement);
    
        // 这里可以定义参数
        options = {
            barsSize: { 
            top: 100,
            bottom: 100
            }, 
            fullscreenEl : false, // 是否支持全屏按钮
            shareButtons: [
            //- {id:'wechat', label:'分享微信', url:'#'},
            //- {id:'weibo', label:'新浪微博', url:'#'},
            {id:'download', label:'保存图片', url:'{{raw_image_url}}', download:true}
            ], // 分享按钮
    
            // define gallery index (for URL)
            galleryUID: galleryElement.getAttribute('data-pswp-uid'),
    
            getThumbBoundsFn: function(index) {
                // See Options -> getThumbBoundsFn section of documentation for more info
                var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
                    pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                    rect = thumbnail.getBoundingClientRect(); 
    
                return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
            }
    
        };
    
        // PhotoSwipe opened from URL
        if(fromURL) {
            if(options.galleryPIDs) {
                // parse real index when custom PIDs are used 
                for(var j = 0; j < items.length; j++) {
                    if(items[j].pid == index) {
                        options.index = j;
                        break;
                    }
                }
            } else {
                // in URL indexes start from 1
                options.index = parseInt(index, 10) - 1;
            }
        } else {
            options.index = parseInt(index, 10);
        }
    
        // exit if index not found
        if( isNaN(options.index) ) {
            return;
        }
    
        if(disableAnimation) {
            options.showAnimationDuration = 0;
        }
    
        // Pass data to PhotoSwipe and initialize it
        gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
        gallery.init();
    };
    
    // loop through all gallery elements and bind events
    var galleryElements = document.querySelectorAll( gallerySelector );
    
    for(var i = 0, l = galleryElements.length; i < l; i++) {
        galleryElements[i].setAttribute('data-pswp-uid', i+1);
        galleryElements[i].onclick = onThumbnailsClick;
    }
    
    // Parse URL and open gallery if it contains #&pid=3&gid=1
    var hashData = photoswipeParseHash();
    if(hashData.pid && hashData.gid) {
        openPhotoSwipe( hashData.pid ,  galleryElements[ hashData.gid - 1 ], true, true );
    }
    };
    
// execute above function
initPhotoSwipeFromDOM('.my-gallery');