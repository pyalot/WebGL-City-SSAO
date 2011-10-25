mix = {
    root: 'mix',
    shaders: {
        avg: 'avg.shader',
        min: 'min.shader',
        max: 'max.shader',
        top: 'top.shader',
        bot: 'bot.shader',
        mul: 'mul.shader',
    },
    init: function(glee, params){
        var self = this;
        
        this.result = new glee.Texture({
            width: glee.width,
            height: glee.height,
        });

        this.processor = new glee.Processor({
            fbo: params.fbo,
            result: this.result,
            shader: this.shaders[$('input[name=combine]:checked').val()],
            samplers: {}
        });
        $('input[name=combine]').change(function(){
            self.processor.shader = self.shaders[$(this).val()];
        });
    },
    set_ops: function(op1, op2){
        this.processor.samplers.op1 = op1;
        this.processor.samplers.op2 = op2;
    },
    render: function(){
        this.processor.render();
    }
}
