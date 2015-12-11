var five = require('johnny-five');
var MilkCocoa = require('milkcocoa');
var SlackNode = require('slack-node');
var SlackClient = require('slack-client');
var info = require('./info.js');

// slack
var slackToken = info.slackToken();
var autoReconnect = true;
var autoMark = true;
var slackNode = new SlackNode(slackToken);
var slackClient = new SlackClient(slackToken, autoReconnect, autoMark);
var botName = info.botName();

// Milkcocoa
var milkcocoa = new MilkCocoa(info.milkcocoaToken());
var ds = milkcocoa.dataStore('heartbeat');

// arduino
var board = new five.Board();
var sensor;

// sensor
var bpm;
var signal;
var rate = new Array(10);
var ibi = 600;
var sampleCounter = 0;
var lastBeatTime = 0;
var peak = 512;
var trough = 512;
var thresh = 525;
var amp = 100;
var pulse = false;

board.on('ready', function() {
    var led = new five.Led(13);
    sensor = new five.Sensor( {
        pin: 'A0',
        freq: 2
    });
    sensor.on('data', function() {
        signal = this.value;
        sampleCounter += 2;
        var n = sampleCounter - lastBeatTime;

        if (signal < thresh && n > (ibi / 5) * 3) {
            if (signal < trough) {
                trough = signal;
            }
        }
        if (signal > thresh && signal > peak) {
            peak = signal;
        }

        if (n > 250) {
            if ((signal > thresh) && (pulse == false) && (n > (ibi / 5) * 3)) {
                pulse = true;
                ibi = sampleCounter - lastBeatTime;
                console.log('ibi:', ibi);
                lastBeatTime = sampleCounter;

                var runnningTotal = 0;
                for (var i = 0; i <= 8; i++) {
                    rate[i] = rate[i + 1];
                    runnningTotal += rate[i];
                }

                rate[9] = ibi;
                runnningTotal += rate[9];
                runnningTotal /= 10;
                bpm = 60000 / runnningTotal;
                ds.push({'heartbeat' : bpm});
                console.log('BPM:', bpm);

                led.on();
            } else {
                led.off();
            }
        }

        if (signal < thresh && pulse == true) {
            pulse = false;
            amp = peak - trough;
            thresh = amp / 2 + trough;
            peak = thresh;
            trough = thresh;
        }

        if (n > 2500) {
            thresh = 512;
            peak = 512;
            trough = 512;
            lastBeatTime = sampleCounter;
        }
    });
    // // 一定値を上回ったらLED ON
    // sensor.within([401, 1000], function() {
    //     led.on();
    //     //slackに通知
    //     if (!isLight) {
    //         slackNode.api('chat.postMessage', {
    //             text: '明るいにゃ〜',
    //             channel: '#iot-room',
    //             as_user: true
    //         }, function(err, response) {
    //             console.log(response);
    //         });
    //         isLight = true;
    //         isDark = false;
    //     }
    // });
    // // 一定値を下回ったらLED OFF
    // sensor.within([0, 400], function() {
    //     led.off();
    //     //slackに通知
    //     if (!isDark) {
    //         slackNode.api('chat.postMessage', {
    //             text: '暗いにゃ〜',
    //             channel: '#iot-room',
    //             as_user: true
    //         }, function(err, response) {
    //             console.log(response);
    //         });
    //         isDark = true;
    //         isLight = false;
    //     }
    // });
});

slackClient.login();

slackClient.on('open', function() {
    console.log('open');
});

slackClient.on('error', function(error) {
    console.error('Error: %s', error);
});

slackClient.on('message', function(message) {
});

function randMessage(array) {
    var rand = array[Math.floor(Math.random() * array.length)];
    return rand;
}
