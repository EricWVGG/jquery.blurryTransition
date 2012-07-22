/*
 * jQuery Blurry Transition plugin
 *   http://whiskyvangoghgo.com/projects/blurryTransition
 *
 * This script REQUIRES the stackBlurImage() script by Mario Klingemann.
 *  http://www.quasimondo.com/StackBlurForCanvas/StackBlurDemo.html
 * 
 *
 * Takes an unordered list of images and simulates and image-blurring
 * transition slideshow.
 *
 * usage example: 
 *   <ul id="slideshow">
 *     <li><img src="someimage_1.jpg"></li>
 *     <li><img src="someimage_2.jpg"></li>
 *     <li><img src="someimage_3.jpg"></li>
 *   </ul>
 *   <script type="text/javascript">
 *     $('#slideshow').blurryTransition({width:'100%', height:'100%'});
 *   </script>
 * 
 * The width and height dimensions are optional if expressed in CSS as
 * pixels; however, percentage dimensions must be declared.
 *
 * For best results, I suggest width and height values of 100% for a 
 * background "cover."
 * 
 *
 * I hope this plugin is fun and useful for you. Please email me with
 * examples of use and suggestions.
 * 
 * Copyright (c) 2012 Eric Jacobsen <eric@whiskyvangoghgo.com>
 *
 * Permission to use, copy, modify, and distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */


(function($) {
  $.fn.blurryTransition = function(arguments) {

    var properties = $.extend({
      'interval' : 12000,
      'css_transition_speed' : '0.7s',
      'width' : null,
      'height' : null
    }, arguments);

    return this.each(function() {

      var $list = '',
        $canvas = '',
        z_index = 100,
        first_img = null,
        offset = {},
        cycle_index = 0,
        cycle = null;
      
      var methods = {
        init : function(options) {
          return $(this).each(function() {
            $list = $(this);
            if (options) $.extend(properties, options);
            // if width and height not specified, attempt to get dimensions
              if( properties.width == null) properties.width = $list.width();
              if( properties.height == null) properties.height = $list.height();
              $list.css({
                width : properties.width,
                height : properties.height,
              });
            // create list wrapper
              $list.wrap('<div class="blurryTransition_wrapper"/>');
              $('.blurryTransition_wrapper').css({
                width: properties.width,
                height: properties.height,
                display: $list.css('display'),
                overflow: 'hidden',
                position: $list.css('position'),
              });
              $list.css({
                position : 'relative',
              });
            // hide all images except first one
              $list.find('li').not('li:first-child').css('opacity', 0);
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
                    offset = crop_image_to_screen(adjusted_size, $list);
                    var side = offset.side;
                    $(n).css({ 
                      'margin' : 0,
                      'padding' : 0,
                      'position' : 'absolute',
                      'top' : '0px',
                      'z-index' : z_index,
                    }).css(offset.side, offset.amount);
                    $(n).addClass('blurryTransition_frame').find('img').attr('id', 'blurryTransition_canvas_'+i);
                    z_index++;
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
                    'z-index' : z_index,
                    'position' : 'absolute',
                    'opacity' : 0,
                  }).css(offset.side, offset.amount);
                  $list.before($canvas);
                // set up second canvas
                  $canvas_2 = $canvas.clone();
                  $canvas_2.attr({
                    id : 'blurryTransition_canvas_c2',
                  }).css({
                    'z-index' : z_index + 1,
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
            // calculate image cover sizes
              var adjusted_size = size_image_to_screen(first_img.width,first_img.height,$list);
              offset = crop_image_to_screen(adjusted_size, $list);
            // adjust slides
              $list.find('li').each(function(i,n) {
                $(n).find('img').css({
                  'width':adjusted_size.x,
                  'height':'auto',
                });
                $(n).css(offset.side, offset.amount);
              });
            // adjust canvas
              $('.blurryTransition_canvas').css({
                'width' : adjusted_size.x + 'px !important',
                'height' : adjusted_size.y + 'px !important',
              }).css(offset.side, offset.amount);
        	});
        },
        startCycle : function() {
          cycle = setInterval(function() {
            methods.shiftImage();
          }, properties.interval);
        },
        stopCycle : function() {
          clearInterval(cycle);
        },
        shiftImage : function() {
          next_i = cycle_index+1;
          if(next_i >= $list.find('li').length) next_i = 0;
          methods.shiftImageTo(next_i);
        },
        shiftImageTo : function(destination_frame) {
          // note: confusing? i+1 because CSS indexes from 1, not 0
    			// prepare blurred image canvases
      			stackBlurImage( 'blurryTransition_canvas_'+cycle_index, 'blurryTransition_canvas_c1', 40, false );
            if(destination_frame > $list.find('li').length) b = 0;
      			stackBlurImage( 'blurryTransition_canvas_'+destination_frame, 'blurryTransition_canvas_c2', 40, false );
          // "blur" the current image (fade in its blurred canvas)
          $('#blurryTransition_canvas_c1').removeClass('fast').bind('webkitTransitionEnd oTransitionEnd transitionend MSTransitionEnd transitionend MSTransitionEnd', function() {
            // hide the current image
            $list.find('li:nth-child('+(cycle_index+1)+')').css('opacity', 0);
            // simultaneously fade out that blurred canvas…
            $('#blurryTransition_canvas_c1').unbind().css('opacity', 0);
            // … and fade in the new blurred image canvas
            $('#blurryTransition_canvas_c2').removeClass('slow').bind('webkitTransitionEnd oTransitionEnd transitionend MSTransitionEnd transitionend MSTransitionEnd', function() {
              $('#blurryTransition_canvas_c2').unbind();
              // unhide the new image
              $list.find('li:nth-child('+(destination_frame+1)+')').css('opacity', 1);
    					// and finally fade out the new blurred image canvas
    					$('#blurryTransition_canvas_c2').addClass('slow').css('opacity', 0);
              cycle_index = destination_frame;
            }).css('opacity', 1);
          }).css('opacity', 1);
        }
      };
  
      return methods.init.apply(this);

    });

  };
})(jQuery);










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


function crop_image_to_screen(dimensions, $parent) {
	var crop = new Object()
	crop.side = '';
	crop.amount = 0;
	if( (dimensions.x-$(window).width()) > (dimensions.y-$parent.height()) ) {
		crop.side = 'margin-left';
		crop.amount = -1 * (dimensions.x-$parent.width())/2 + 'px';
	} else {
		crop.side = 'margin-top';
		crop.amount = -1 * (dimensions.y-$parent.height())/2 + 'px';
	}
	return crop;
} /* end function crop_image_to_screen() */



