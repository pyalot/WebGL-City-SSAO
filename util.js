var handlers = {
    /*
    error: function(glee, description, info){
        console.log(info);
        $('canvas.demo').replaceWith($('<div class="error"></div>').append(description));
        census.error(glee, 'ssao', info);
    },
    capabilities: function(glee, description, webgl){
        if(webgl){
            census.capabilities(glee, 'irradiance');
        }
        else{
            $('canvas.demo').replaceWith($('<div class="error"></div>').append(description));
            census.nowebgl('ssao');
        }
    },
    */
};

var slider = function(params){
    var row = $('<div class="field"></div>');
    $('<label class="desc"></label>').appendTo(row).text(params.title);
    $('<div class="hslider"></div>').slider({
        range: params.range,
        min: params.min,
        max: params.max,
        value: params.value,
        values: params.values,
        step: params.step,
        slide: function(event, ui){
            params.slide(ui.value);
            value_display.text(ui.value);
        }
    }).appendTo(row);
    var value_display = $('<span></span>').appendTo(row).text(params.value);
    params.slide(params.value);
    return row;
}
