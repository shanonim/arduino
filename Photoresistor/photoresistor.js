var five = require("johnny-five");
var board = new five.Board();
var sensor;

board.on('ready', function() {
    sensor = new five.Sensor( {
        pin: "A0",
        freq: 100
    });

    sensor.on("data", function() {
        console.log(this.value);
    });
});
