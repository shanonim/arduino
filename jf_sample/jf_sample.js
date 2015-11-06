var jf = require("johnny-five");
var board = new jf.Board();

board.on("ready", function() {
  (new jf.Led(13)).strobe();
});
