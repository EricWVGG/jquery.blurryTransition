
(function($) {
  $.fn.blurryTransition = function(arguments) {

    var properties = $.extend({
      'frame' : null, /* generated frame */
      'canvas' : null,
      'cycle' : null,
      'i' : 0,
      'interval' : 12000,
      'css_transition_speed' : '0.7s',
      'blur_mode' : 'boxBlurImage',
      'z_index' : 100,
      'width' : null,
      'height' : null,
      'offset' : {}
    }, arguments);

    return this.each(function() {

      var $image_index = 0,
        $list = '',
        $canvas = '',
        first_img;
      
      var methods = {
        init : function(options) {
          return $(this).each(function() {
            $list = $(this);
            if (options) $.extend(properties, options);
            // create list wrapper
              $list.wrap('<div class="blurryTransition_wrapper"/>');
              $('.blurryTransition_wrapper').css({
                width: properties.width,
                height: properties.height,
                display: $list.css('display'),
                overflow: 'hidden',
                position: 'relative',
              });
            // hide all images except first one
              $list.find('li').not('li:first-child').addClass('hidden');
            // retrieve image dimensions to set up canvases
              var $img = $list.find('li:first-child img');
              first_img = new Image();
              first_img.onload = function() {
                // calculate image cover sizes
                  var adjusted_size = size_image_to_screen(first_img.width,first_img.height,$list);
                // set up slides
                  $list.find('li').each(function(i,n) {
                    $(n).find('img').css({
                      'width':adjusted_size.x,
                      'height':'auto',
                    });
                    properties.offset = crop_image_to_screen(adjusted_size);
                    var side = properties.offset.side;
                    $(n).css({ 
                      'margin' : 0,
                      'padding' : 0,
                      'position' : 'absolute',
                      'top' : '0px',
                      'z-index' : properties.z_index,
                    }).css(properties.offset.side, properties.offset.amount);
                    $(n).addClass('blurryTransition_frame').find('img').attr('id', 'blurryTransition_canvas_'+i);
                    properties.z_index++;
                  });
                // set up first canvas
                  $canvas = $('<canvas/>');
                  $canvas.attr({
                    id : 'blurryTransition_canvas_c1',
                    class : 'blurryTransition_canvas',
                    width : first_img.width,
                    height : first_img.height
                  }).css({
                    'width' : adjusted_size.x + 'px !important',
                    'height' : adjusted_size.y + 'px !important',
                    '-webkit-transition-property' : 'opacity',
                    '-webkit-transition-duration' : properties.css_transition_speed,
                    '-webkit-transition-timing-function' : 'ease-out',
                    'z-index' : properties.z_index,
                    'position' : 'absolute',
                    'opacity' : 0,
                  }).css(properties.offset.side, properties.offset.amount);
                  $list.before($canvas);
                // set up second canvas
                  $canvas_2 = $canvas.clone();
                  $canvas_2.attr({
                    id : 'blurryTransition_canvas_c2',
                  }).css({
                    'z-index' : properties.z_index + 1,
                  });
                  $list.before($canvas_2);
                
              }
              first_img.src = $img.attr('src');
              methods.bind_window_resize();
              methods.startCycle();
            });
          // done setting up canvases
        },
        bind_window_resize : function() {

        	$(window).resize(function(){
              var $img = $list.find('li:first-child img');
              first_img = new Image();
              first_img.onload = function() {
                // calculate image cover sizes
                  var adjusted_size = size_image_to_screen(first_img.width,first_img.height,$list);
                // set up slides
                  $list.find('li').each(function(i,n) {
                    $(n).find('img').css({
                      'width':adjusted_size.x,
                      'height':'auto',
                    });
                    properties.offset = crop_image_to_screen(adjusted_size);
                    $(n).css({ 
                      'margin' : 0,
                      'padding' : 0,
                      'position' : 'absolute',
                      'top' : '0px',
                      'z-index' : properties.z_index
                    }).css(properties.offset.side, properties.offset.amount);
                    $(n).addClass('blurryTransition_frame').find('img').attr('id', 'blurryTransition_canvas_'+i);
                    properties.z_index++;
                  });
                // set up first canvas
                  $('.blurryTransition_canvas').css({
                    'width' : adjusted_size.x + 'px !important',
                    'height' : adjusted_size.y + 'px !important',
                  }).css(properties.offset.side, properties.offset.amount);
                
              }
              first_img.src = $img.attr('src');
        	});

        },
        startCycle : function() {
          properties.cycle = setInterval(function() {
            methods.shiftImage();
          }, properties.interval);
        },
        stopCycle : function() {
          clearInterval(properties.cycle);
        },
        shiftImage : function() {
          next_i = properties.i+1;
          if(next_i >= $list.find('li').length) next_i = 0;
          methods.shiftImageTo(next_i);
        },
        shiftImageTo : function(destination_frame) {
          // note: confusing? i+1 because CSS indexes from 1, not 0
    			// prepare blurred image canvases
      			boxBlurImage( 'blurryTransition_canvas_'+properties.i, 'blurryTransition_canvas_c1', 40, false, 1 );
            if(destination_frame > $list.find('li').length) b = 0;
      			boxBlurImage( 'blurryTransition_canvas_'+destination_frame, 'blurryTransition_canvas_c2', 40, false, 1 );
          // "blur" the current image (fade in its blurred canvas)
          $('#blurryTransition_canvas_c1').removeClass('fast').bind('webkitTransitionEnd oTransitionEnd transitionend MSTransitionEnd transitionend MSTransitionEnd', function() {
            // hide the current image
            $list.find('li:nth-child('+(properties.i+1)+')').addClass('hidden');
            // simultaneously fade out that blurred canvas…
            $('#blurryTransition_canvas_c1').unbind().css('opacity', 0);
            // … and fade in the new blurred image canvas
            $('#blurryTransition_canvas_c2').removeClass('slow').bind('webkitTransitionEnd oTransitionEnd transitionend MSTransitionEnd transitionend MSTransitionEnd', function() {
              $('#blurryTransition_canvas_c2').unbind();
              // unhide the new image
              $list.find('li:nth-child('+(destination_frame+1)+')').removeClass('hidden');
    					// and finally fade out the new blurred image canvas
    					$('#blurryTransition_canvas_c2').addClass('slow').css('opacity', 0);
              properties.i = destination_frame;
            }).css('opacity', 1);
          }).css('opacity', 1);
        }
      };
  
      return methods.init.apply(this);

    });

  };
})(jQuery);

$(window).load(function() {
  $('#images').blurryTransition({
    'width' : '100%',
    'height' : '100%',
  });
});











function size_image_to_screen(x,y,parent) {
	var resized = new Object();
	resized.x = $(parent).width();
	resized.y = Math.round(resized.x * y / x);
	if( resized.y < $(parent).height() ) {
		resized.y = $(parent).height();
		resized.x = Math.round(resized.y * x / y);
	}
	return resized;
} /* end function size_image_to_screen() */


function crop_image_to_screen(dimensions) {
	var crop = new Object()
	crop.side = '';
	crop.amount = 0;
	if( (dimensions.x-$(window).width()) > (dimensions.y-$(window).height()) ) {
		crop.side = 'margin-left';
		crop.amount = -1 * (dimensions.x-$(window).width())/2 + 'px';
	} else {
		crop.side = 'margin-top';
		crop.amount = -1 * (dimensions.y-$(window).height())/2 + 'px';
	}
	return crop;
} /* end function crop_image_to_screen() */



