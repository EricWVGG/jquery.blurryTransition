
(function($) {
  $.fn.blurryTransition = function(arguments) {

    var properties = $.extend({
      'frame' : null, /* generated frame */
      'canvas' : null,
      'cycle' : null,
      'i' : 0,
      'interval' : 3000,
      'css_transition_speed' : '1s',
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
              $list.css({
                'width' : img.width + 'px',
                'height' : img.height + 'px'
              });
              $list.find('li').each(function(i,n) {
                $(n).css({
                  'z-index' : i
                });
                $(n).find('img').attr('id', 'blurryTransition_blur_'+i);
              });
              $canvas = $('<canvas/>');
              $canvas.attr({
                id : 'blurryTransition_blur_c1',
                width : img.width,
                height : img.height
              });
              $canvas.css({
                '-webkit-transition-property' : 'opacity',
                '-webkit-transition-duration' : properties.css_transition_speed,
                '-webkit-transition-timing-function' : 'linear'
              });
              $list.before($canvas);
              $canvas_2 = $canvas.clone();
              $canvas_2.attr({
                id : 'blurryTransition_blur_c2',
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
          a = properties.i;
          b = properties.i+1;
          methods.shiftImageTo(a,b);
        },
        shiftImageTo : function(a, b) {
    			boxBlurImage( 'blurryTransition_blur_'+a, 'blurryTransition_blur_c1', 40, false, 1 );
          if(b > $list.find('li').length) b = 0;
    			boxBlurImage( 'blurryTransition_blur_'+b, 'blurryTransition_blur_c2', 40, false, 1 );
          $('#blurryTransition_blur_c1').removeClass('fast').bind('webkitTransitionEnd oTransitionEnd transitionend MSTransitionEnd transitionend MSTransitionEnd', function() {
            $list.find('li:nth-child('+(a+1)+')').addClass('hidden');
            $list.find('li:nth-child('+(b+1)+')').removeClass('hidden');
  					$('#blurryTransition_blur_c2').addClass('slow').unbind().css('opacity', 0);
  					$('#blurryTransition_blur_c1').addClass('fast').unbind().css('opacity', 0);
            properties.i++;
            if(properties.i >= $list.find('li').length) properties.i = 0;
          }).css('opacity', 1);
          $('#blurryTransition_blur_c2').removeClass('slow').css('opacity', 1);
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
			$('#the_image, #the_blur, #the_blur_image')
				.css('margin-top', 'auto')
				.css('margin-left', 'auto')
				.css(crop.side,crop.amount)
				.attr('width', new_dimensions.x)
				.attr('height', new_dimensions.y);
			boxBlurImage( 'the_blur_image', 'the_blur', 40, false, 1 );
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
		$('#the_blur_image')
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
			boxBlurImage( 'the_blur_image', 'the_blur', 40, false, 1 );
			$('#the_blur')
				.css(crop.side,crop.amount)
				.css('width', $('#the_blur_image').css('width'))
				.css('height', $('#the_blur_image').css('height'))
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



