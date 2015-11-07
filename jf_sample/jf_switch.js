var five = require("johnny-five");
var board = new five.Board();
var button;

board.on("ready", function() {
    var piezo = new five.Piezo(3);
    button = new five.Button({
        pin: 2,
        // プルアップ回路を有効にする
        isPullup: true
    });

    board.repl.inject({
        button: button
    });

    button.on("down", function() {
        console.log("HIGH");
        (new five.Led(13)).on();

        //playSound(piezo);
    });

    button.on("up", function() {
        console.log("LOW");
        (new five.Led(13)).off();
    });
});

function playSound(piezo) {
    piezo.play({
        song: [
            ["C4", 1]
        ]
    });
}
