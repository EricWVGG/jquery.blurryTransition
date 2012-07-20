
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
      'z_index' : 100
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
            $list.find('li').not('li:first-child').addClass('hidden');
            var $img = $list.find('li:first-child img');
            img = new Image();
            img.onload = function() {
              // set up slides
                $list.css({
                  'width' : img.width + 'px',
                  'height' : img.height + 'px'
                });
                $list.find('li').each(function(i,n) {
                  $(n).css({ 'z-index' : properties.z_index });
                  $(n).find('img').attr('id', 'blurryTransition_canvas_'+i);
                  properties.z_index++;
                });
              // set up first canvas
                $canvas = $('<canvas/>');
                $canvas.attr({
                  id : 'blurryTransition_canvas_c1',
                  width : img.width,
                  height : img.height
                }).css({
                  '-webkit-transition-property' : 'opacity',
                  '-webkit-transition-duration' : properties.css_transition_speed,
                  '-webkit-transition-timing-function' : 'linear',
                  'z-index' : properties.z_index,
                  'position' : 'absolute',
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
    			boxBlurImage( 'blurryTransition_canvas_'+properties.i, 'blurryTransition_canvas_c1', 40, false, 1 );
          if(destination_frame > $list.find('li').length) b = 0;
    			boxBlurImage( 'blurryTransition_canvas_'+destination_frame, 'blurryTransition_canvas_c2', 40, false, 1 );
          $('#blurryTransition_canvas_c1').removeClass('fast').bind('webkitTransitionEnd oTransitionEnd transitionend MSTransitionEnd transitionend MSTransitionEnd', function() {
            $('#blurryTransition_canvas_c1').unbind().css('opacity', 0);
            $list.find('li:nth-child('+(properties.i+1)+')').addClass('hidden');
            $('#blurryTransition_canvas_c2').removeClass('slow').bind('webkitTransitionEnd oTransitionEnd transitionend MSTransitionEnd transitionend MSTransitionEnd', function() {
              $('#blurryTransition_canvas_c2').unbind();
              // note: confusing? i+1 because CSS indexes from 1, not 0
              $list.find('li:nth-child('+(destination_frame+1)+')').removeClass('hidden');
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

$(function() {
  $('#images').blurryTransition();
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


function switch_backgrounds() {
  var image = new Image();
  image.onload = function() {

		// size and crop the loaded image resource
		var new_dimensions = size_image_to_screen(image.width, image.height);
		var original_x = image.width;
		var original_y = image.height;
		image.width = new_dimensions.x;
		image.height = new_dimensions.y;
		var crop = crop_image_to_screen(new_dimensions);
		
		// set transition image to image
		$('#the_canvas_image')
			.css(crop.side,crop.amount)
			.attr('width', new_dimensions.x)
			.attr('height', new_dimensions.y)
			.attr('src', image.src);
		
			// firefox has a fit if we do this with the other #the_image adjustments
		
		$(window).oneTime('0.1s', 'blurring', function() {
			// firefox doesn't blur if it happens too soon after #transition_image src flip
			$('#the_blur')
				.attr('width', original_x)
				.attr('height', original_y)
				.data('original_x', original_x)
				.data('original_y', original_y);
			
			// blur the image, make visible
			boxBlurImage( 'the_canvas_image', 'the_blur', 40, false, 1 );
			$('#the_blur')
				.css(crop.side,crop.amount)
				.css('width', $('#the_canvas_image').css('width'))
				.css('height', $('#the_canvas_image').css('height'))
				.bind('webkitTransitionEnd oTransitionEnd transitionend MSTransitionEnd transitionend MSTransitionEnd', function() {
					$('#the_blur').unbind();
					$('#the_image')
						.css(crop.side,crop.amount)
      			.attr('width', new_dimensions.x)
      			.attr('height', new_dimensions.y)
						.attr('src', image.src)
						.addClass('visible');
					// make blur invisible
					$('#the_blur').removeClass('visible');
				}).addClass('visible');
    });


  	$(window).oneTime('10s', 'switch_backgrounds', function() {
      switch_backgrounds();
  	});
  }
  while( rand == last_rand ) {
    rand = Math.floor(Math.random() * 8) + 1;
  }
  last_rand = rand;
  image.src = 'img/siege_' + rand + '.jpg';
}







function size_image_to_screen(x,y) {
	var resized = new Object();
	resized.x = $(window).width();
	resized.y = Math.round(resized.x * y / x);
	if( resized.y < $(window).height() ) {
		resized.y = $(window).height();
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



