/*! yBox - v4.4 - 08/10/2022
* By Yuval Ashkenazi
* https://github.com/yuvalAshkenaz/yBox 
Updated feature for enquiry client by odama.io
*/

//yBox
jQuery('body').on('click','.yBox',function(e){
	e.preventDefault();
	e.stopPropagation();
	var self = jQuery(this);
	jQuery('.yBox.yBoxFocus').removeClass('yBoxFocus');
	self.addClass('yBoxFocus');
	yBox({self:self});
});
var yUrl = new URL(document.currentScript.src);
var yLang = yUrl.searchParams.get("lang");
var strings = {
	close	: 'Close',
	next	: 'Next',
	prev	: 'Prev'
};
if(yLang == 'he' || yLang == 'he-IL'){
	yLang = 'he';
	strings = {
		close	: 'סגירה',
		next	: 'הבא',
		prev	: 'הקודם'
	};
}

var url = new URL(window.location.href);
var msg = url.searchParams.get("msg");
var yBoxPrm = url.searchParams.get("ybox-url");
var yBoxClassPrm = url.searchParams.get("ybox-class");
if(msg || yBoxPrm){
	if(!jQuery.isEmptyObject(yBoxPrm) && (yBoxPrm.indexOf('http:') == -1 && yBoxPrm.indexOf('https:') == -1)){
		yBoxPrm = '#'+yBoxPrm;
	}
	yBox({
		code	  : yBoxPrm ? false : msg,
		yBoxClass : yBoxClassPrm ? yBoxClassPrm : 'ybox-content-frame',
		url		  : yBoxPrm ? yBoxPrm : false
	});
	//***** Remove msg from URL ***********
	setTimeout(function(){
		var params = new URLSearchParams(window.location.search);
		params.delete('msg');
		params.delete('ybox-url');
		params.delete('ybox-class');
		if(params.toString()){
			params = '?'+params.toString();
		}
		var newURL = window.location.pathname+params;
		window.history.pushState("", "", newURL);
	},500);
}
function yBox(json){
	if(!jQuery('.yBoxOverlay:not(.active)').length){
		// code
		// self
		// yBoxClass
		// url
		if(typeof beforeYboxOpen != 'undefined'){
			beforeYboxOpen(json.self);
		}
		var hasSelf = true;
		
		if(typeof json.yBoxClass == 'undefined'){
			json.yBoxClass = '';
		}
		if(typeof json.self == 'undefined' || !json.self){
			hasSelf = false;
		}
		if(hasSelf){
			json.yBoxClass = json.self.data('ybox-class') || '';
			json.url = json.self.attr('href');
			json.title = json.self.attr('data-title');
			json.caption = json.self.attr('data-caption');
		}
		var html = '<div class="yBoxOverlay no-contrast'+(yLang=='he'?' yBoxRTL':'')+'">\
						<div class="yBoxFrame '+json.yBoxClass+'">\
							<button type="button" class="closeYboxOnFocus"></button>\
							<div class="insertYboxAjaxHere" tabindex="0"></div>\
							<button type="button" class="closeYbox" title="'+strings.close+'"></button>\
							<button type="button" class="closeYboxOnFocus"></button>\
						</div>\
					</div>';
					
		if(!jQuery('.yBoxFrame').length){
			jQuery('body').append(html);
			insertPopHtml(json.self,hasSelf,json.url,json.code,json.title,json.caption);
			setTimeout(function(){
				jQuery('.yBoxOverlay').addClass('active');
			},200);
		}else{
			if(jQuery('.yBoxFrame.yBoxImgWrap').length){
				if(jQuery('.yBoxFramePlaceHolder').length){
					jQuery('.yBoxFramePlaceHolder').before(jQuery('.insertYboxAjaxHere').html());
					jQuery('.yBoxFramePlaceHolder').remove();
				}
				jQuery('.insertYboxAjaxHere').html('');
				insertPopHtml(json.self,hasSelf,json.url,json.code,json.title,json.caption);
			}else{
				jQuery('.insertYboxAjaxHere').animate({
					opacity : 0
				},function(){
					var jQuerythis = jQuery(this);
					setTimeout(function(){
						if(jQuery('.yBoxFramePlaceHolder').length){
							jQuery('.yBoxFramePlaceHolder').before(jQuery('.insertYboxAjaxHere').html());
							jQuery('.yBoxFramePlaceHolder').remove();
						}
						jQuerythis.html('');
						insertPopHtml(json.self,hasSelf,json.url,json.code,json.title,json.caption);
						jQuery('.insertYboxAjaxHere').animate({
							opacity : 1
						});
					},200);
				});
			}
		}
		setTimeout(function(){
			if(typeof afterYboxOpen != 'undefined'){
				afterYboxOpen(json.self);
			}
		},200);
	}
};
function insertPopHtml(self,hasSelf,url,code,title,caption){
    var captDiv =
        '<div class="caption-wrapper">\
            <h1 class="caption-title">'+title+'</h1>\
            <p>'+caption+'</p>\
        </div>';
	if(hasSelf){
        let prevBtn = '<button type="button" class="yBoxPrevImg" title="'+strings.prev+'"><img class="prevBtn" src="https://uploads-ssl.webflow.com/63bb8dcef1d829fc364afd32/63bfc2e80fc06266003fcaa2_prev.svg"></button>';
        let nextBtn = '<button type="button" class="yBoxNextImg" title="'+strings.next+'"><img class="nextBtn" src="https://uploads-ssl.webflow.com/63bb8dcef1d829fc364afd32/63bfc2e8b788220b593d2075_next.svg"></button>';
		if(self.hasClass('yBox_iframe')){
			//iframe
			jQuery('.yBoxFrame').addClass('yBoxIframeWrap');
			if(url.toLowerCase().indexOf('youtube') > -1 || url.toLowerCase().indexOf('youtu.be') > -1){
				var youtube_id = url.replace(/^[^v]+v.(.{11}).*/,"$1").replace('https://youtu.be/','').replace(/.*youtube.com\/embed\//,'');
				url = 'https://www.youtube.com/embed/'+youtube_id+'?wmode=transparent&rel=0&autoplay=1&hl='+yLang;
			}
			if(url.toLowerCase().indexOf('vimeo') > -1){
				var vimeoID = url.replace(/[^0-9]/g,'');
				url = 'https://player.vimeo.com/video/'+vimeoID+'?autoplay=1';
			}
            var group = self.data("ybox-group");
            let code = '<iframe src="'+url+'" frameborder="0" wmode="Opaque" allow="autoplay" allowfullscreen class="yBoxIframe"></iframe>';
            if(group && jQuery('.yBox[data-ybox-group="'+group+'"]').length > 1){
                code = prevBtn+code+nextBtn;
            }
			jQuery('.yBoxFrame .insertYboxAjaxHere').html(code);
            $(document).on("click", ".yBoxIframeWrap .nextBtn", function () {
              yBoxNext(self);
              $(".yBoxFrame").removeClass("yBoxIframeWrap");
            });
            $(document).on("click", ".yBoxIframeWrap .prevBtn", function () {
              yBoxPrev(self);
              $(".yBoxFrame").removeClass("yBoxIframeWrap");
            });
		}else if(self.hasClass('yBox_video')){
			//video
			jQuery('.yBoxFrame').addClass('yBoxIframeWrap');
            let code = '<video class="yBoxVideo" autoplay controls preload plays-inline playsinline><source src="'+url+'" type="video/mp4" /></video>';
            if(group && jQuery('.yBox[data-ybox-group="'+group+'"]').length > 1){
                code = prevBtn+code+nextBtn;
            }
            jQuery('.yBoxFrame .insertYboxAjaxHere').html(code);
		}else if(self.hasClass('yBox_ajax')){
			//ajax
			jQuery.get(url,function(data){
				jQuery('.insertYboxAjaxHere').addClass('isAjax').html(data);
			});
		}else if(url.indexOf('#') == -1){
			//image
			jQuery('.yBoxFrame').addClass('yBoxImgWrap');
			jQuery('.insertYboxAjaxHere').append('<div style="text-align:center;position:absolute;right:0;left:0;top:0;bottom:0;"><div class="yBoxLoader"></div></div>');
			var img = new Image();
			img.src = url;
			img.className = 'yBoxImg';
			img.onload = function(){
                console.log('img load');
                if (jQuery(".yBoxFrame").find('.caption-wrapper').length < 1) {
                    if (title != null) {
                      jQuery(".yBoxFrame").append(captDiv);
                    } else {
                      jQuery(".caption-wrapper").remove();
                    }
                }
				var group = self.data('ybox-group');
				var alt = self.data('ybox-alt') || '';
				var code = '<div class="yBoxImgZoom"><img src="'+url+'" alt="'+alt+'" class="yBoxImg" /></div>';
				if(group && jQuery('.yBox[data-ybox-group="'+group+'"]').length > 1){
					code = prevBtn + code + nextBtn;
				}
				jQuery('.insertYboxAjaxHere').html(code);
				if(window.screen.width <= 767)
					zoom({zoom:'yBoxImgZoom'});
                    jQuery(".nextBtn").click(function (e) {
                      yBoxNext(self);
                      jQuery(".caption-wrapper").remove();
                    });
                    jQuery(".prevBtn").click(function (e) {
                      yBoxPrev(self);
                      jQuery(".caption-wrapper").remove();
                    });
			};
		}else{
			jQuery(url).after('<div class="yBoxFramePlaceHolder"></div>');
			if(jQuery('.insertYboxAjaxHere.isAjax').length){
				jQuery('.insertYboxAjaxHere.isAjax').removeClass('isAjax');
			}
			jQuery(url).appendTo('.insertYboxAjaxHere');
		}
		if(window.screen.width > 991){
			setTimeout(function(){
				if(self.data('focus')){
					jQuery('.insertYboxAjaxHere .'+self.data('focus')).focus();
				}else{
					jQuery('.insertYboxAjaxHere iframe, .insertYboxAjaxHere a, .insertYboxAjaxHere input, .insertYboxAjaxHere select:not(.select2), .insertYboxAjaxHere .select2-selection, .insertYboxAjaxHere button').first().focus();
				}
			},500);
		}
	}else{
		if(!code && url){
			jQuery(url).after('<div class="yBoxFramePlaceHolder"></div>');
			jQuery(url).appendTo('.insertYboxAjaxHere');
		}else{
			jQuery('.insertYboxAjaxHere').html(code);
		}
	}
};
function yBoxNext(self){
	var group = self.data('ybox-group');
	var next;
	var x = false;
	jQuery('.yBox[data-ybox-group="'+group+'"]:not(.swiper-slide-duplicate)').each(function(i){
		if(!x){
			if(jQuery(this).attr('href') == self.attr('href')){
				x = true;
				if(jQuery('.yBox[data-ybox-group="'+group+'"]:not(.swiper-slide-duplicate)').eq(i+1).length){
					next = jQuery('.yBox[data-ybox-group="'+group+'"]:not(.swiper-slide-duplicate)').eq(i+1);
				}else{
					next = jQuery('.yBox[data-ybox-group="'+group+'"]:not(.swiper-slide-duplicate)').eq(0);
				}
			}
		}
	});
	if(next){
		jQuery('.yBox').data('focus','');
		next.data('focus','yBoxNextImg');
		next.trigger('click');
	}
};
function yBoxPrev(self){
	var group = self.data('ybox-group');
	var prev;
	jQuery('.yBox[data-ybox-group="'+group+'"]:not(.swiper-slide-duplicate)').each(function(i){
		if(jQuery(this).attr('href') == self.attr('href')){
			if(jQuery('.yBox[data-ybox-group="'+group+'"]:not(.swiper-slide-duplicate)').eq(i-1).length){
				prev = jQuery('.yBox[data-ybox-group="'+group+'"]:not(.swiper-slide-duplicate)').eq(i-1);
			}else{
				var count = jQuery('.yBox[data-ybox-group="'+group+'"]:not(.swiper-slide-duplicate)').length;
				prev = jQuery('.yBox[data-ybox-group="'+group+'"]:not(.swiper-slide-duplicate)').eq(count-1);
			}
		}
	});
	if(prev){
		jQuery('.yBox').data('focus','');
		prev.data('focus','yBoxPrevImg');
		prev.trigger('click');
	}
};
//Close
jQuery('body').on('click','.yBoxOverlay',function(e){
	var classes = '';
	for(var i = 0;i < e.target.classList.length;i++){
		if(e.target.classList[i].indexOf('yBoxOverlay') > -1 || e.target.classList[i].indexOf('active') > -1){
			classes += e.target.classList[i]+' ';
		}
	};
	if(classes.indexOf('yBoxOverlay active') > -1 || e.target.className.indexOf('closeYbox') > -1){
		if(typeof beforeYboxClose != 'undefined'){
			var beforeClose = beforeYboxClose($('.yBox.yBoxFocus'));
			if(beforeClose == false)
				return false;
		}
		jQuery('.yBoxOverlay').removeClass('active');
		jQuery('.yBoxFocus').focus();
		setTimeout(function(){
			if(jQuery('.yBoxFramePlaceHolder').length){
				jQuery('.yBoxFramePlaceHolder').before(jQuery('.insertYboxAjaxHere').html());
				jQuery('.yBoxFramePlaceHolder').remove();
			}
			jQuery('.yBoxOverlay').remove();
			if(typeof afterYboxClose != 'undefined'){
				afterYboxClose($('.yBox.yBoxFocus'));
			}
		},600);
	}
});
jQuery('body').on('focus','.closeYboxOnFocus',function(){
	jQuery('.closeYbox').trigger('click');
});
// jQuery(document).keyup(function(e){
// 	if(e.keyCode === 37){ //Prev
// 		$(".yBoxPrevImg").trigger("click");
// 	}
// 	if(e.keyCode === 39){ //Next
// 		$(".yBoxNextImg").trigger("click");
// 	}
// 	if(e.keyCode === 27){ //Esc
// 		jQuery('.closeYbox').trigger('click');
// 	}
// });