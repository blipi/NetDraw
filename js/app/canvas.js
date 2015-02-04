define(['jquery', 'app/layer', 'app/controller'], function($, layer, controller){

    var wrapper = controller.getWrapper();
    var canvas = controller.getCanvas();

    function _window_onresize(e) {
        w_width = wrapper.css('width');
        w_height = wrapper.css('height');

        c_width = canvas.css('width');
        c_height = canvas.css('height');

        console.log("Wrapper [" + w_width + "," + w_height + "]");
        console.log("Canvas  [" + c_width + "," + c_height + "]");

        var ratio_w = w_width / c_width;
        var ratio_h = w_height / c_height;

        canvas.attr('width', w_width);
        canvas.attr('height', w_height);

        canvas.setLayer('scaling', {
            scaleX: ratio_w, scaleY: ratio_h
        })
        .drawLayers();
    }
   
    return {

        fitToScreen: function() {
            $(window).resize(_window_onresize);
            
            canvas.scaleCanvas({
                layer: true,
                name: 'scaling',
                x: 0, y: 0,
                scale: 1
            });
            _window_onresize();

            canvas.restoreCanvas({
                layer: true
            });
        }

    };
});
