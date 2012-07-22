
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
      'height' : null
    }, arguments);

    return this.each(function() {

      var $image_index = 0,
        $list = '',
        $canvas = '';
      
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
              img = new Image();
              img.onload = function() {
                // calculate image cover sizes
                  var adjusted_size = size_image_to_screen(img.width,img.height,$list),
                    offsetLeft = 0,
                    offsetTop = 0;
                // set up slides
                  $list.find('li').each(function(i,n) {
                    $(n).find('img').css({
                      'width':adjusted_size.x,
                      'height':'auto',
                    });
                    if(adjusted_size.x > $list.width()) {
                      offsetLeft = (adjusted_size.x-$list.width()) / 2;
                      offsetTop = 0;
                    }
                    else if(adjusted_size.y > $list.height()) {
                      offsetTop = (adjusted_size.y-$list.height()) / 2;
                      offsetLeft = 0;
                    }
                    $(n).css({ 
                      'margin' : 0,
                      'padding' : 0,
                      'position' : 'absolute',
                      'top' : '0px',
                      'z-index' : properties.z_index,
                      'margin-left' : - offsetLeft,
                      'margin-top' : - offsetTop,
                    });
                    $(n).addClass('blurryTransition_frame').find('img').attr('id', 'blurryTransition_canvas_'+i);
                    properties.z_index++;
                  });
                // set up first canvas
                  $canvas = $('<canvas/>');
                  $canvas.attr({
                    id : 'blurryTransition_canvas_c1',
                    width : img.width,
                    height : img.height
                  }).css({
                    'width' : adjusted_size.x + 'px !important',
                    'height' : adjusted_size.y + 'px !important',
                    '-webkit-transition-property' : 'opacity',
                    '-webkit-transition-duration' : properties.css_transition_speed,
                    '-webkit-transition-timing-function' : 'ease-out',
                    'z-index' : properties.z_index,
                    'position' : 'absolute',
                    'margin-left' : - offsetLeft,
                    'margin-top' : - offsetTop,
                    'opacity' : 0,
                  });
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
              img.src = $img.attr('src');
              methods.startCycle();
            });
          // done setting up canvases
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






$(function() {
/*   switch_backgrounds();   */

/*
	$(window).resize(function(){
		$(window).stopTime('resize').oneTime('0.1s', 'resize', function() {
			var $image = $('#the_image');
			var new_dimensions = size_image_to_screen($image.data('original_x'), $image.data('original_y'));
			var crop = crop_image_to_screen(new_dimensions);
			// set transition image to image
			$('#the_image, #the_blur, #the_canvas_image')
				.css('margin-top', 'auto')
				.css('margin-left', 'auto')
				.css(crop.side,crop.amount)
				.attr('width', new_dimensions.x)
				.attr('height', new_dimensions.y);
			boxBlurImage( 'the_canvas_image', 'the_blur', 40, false, 1 );
		});
	});
*/

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



