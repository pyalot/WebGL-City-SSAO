var Statistic = function(){
    this.timings = [];
    this.series = [];
    for(var i=0; i<150; i++){
        this.series.push(0);
    }
    var self = this;
   
    /*
    this.data = new google.visualization.DataTable();
    this.data.addColumn('string', 'Label');
    this.data.addColumn('number', 'Value');
    this.data.addRows(1);
    this.data.setValue(0,0, 'Millisec.');
    this.data.setValue(0,1, 0);

    this.chart = new google.visualization.Gauge($('#gauge')[0]);
    this.options = {
        minorTicks: 5,
        majorTicks: 10,
        min: 0,
        max: 100,

        greenColor: '#d4ff2a',
        greenFrom: 0,
        greenTo: 16,
        yellowColor: '#ffd42a',
        yellowFrom: 16,
        yellowTo: 33,
        redColor: '#ff4c1e',
        redFrom: 33,
        redTo: 100,
    };
    this.chart.draw(this.data, this.options);
    */

    this.ctx = $('canvas.graph')[0].getContext('2d');
    this.gradient = this.ctx.createLinearGradient(0,0,0,120);
    this.gradient.addColorStop(0, '#ff4c1e');
    this.gradient.addColorStop((100-33)/100, '#ff4c1e');
    this.gradient.addColorStop((100-33)/100, '#ffd42a');
    this.gradient.addColorStop((100-16)/100, '#ffd42a');
    this.gradient.addColorStop((100-16)/100, '#d4ff2a');
    this.gradient.addColorStop(1, '#d4ff2a');

    setInterval(function(){
        self.update(); 
    }, 200);
};

Statistic.prototype = {
    tick: function(delta){
        this.timings.push(delta);
        if(this.timings.length > 10){
            this.timings.shift();
        }
    },
    update: function(){
        var result = 0.0;
        for(var i=0; i<this.timings.length; i++){
            result += this.timings[i];
        }
        result = Math.round((result*100)/this.timings.length)/100;
        this.series.shift();
        this.series.push(result);

        //this.data.setValue(0,1,result);
        //this.chart.draw(this.data, this.options);
        var ctx = this.ctx;
        ctx.fillStyle = '#333';
        ctx.fillRect(0,0,150,120);
        ctx.fillStyle = this.gradient;
        ctx.beginPath();
        ctx.moveTo(0,120);
        for(var i=0; i<this.series.length; i+=1){
            var y = 120-this.series[i]*1.2;
            if(isNaN(y)){
                y = 0.0;
            }
            ctx.lineTo(i, y);
        }
        ctx.lineTo(150, 120);
        ctx.closePath();
        ctx.fill();
    }
}
