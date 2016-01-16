require('date-utils');
var five = require('johnny-five');
var SlackNode = require('slack-node');
var SlackClient = require('slack-client');
var info = require('./info.js');

// Slack
var slackToken = info.slackToken();
var autoReconnect = true;
var autoMark = true;
var slackNode = new SlackNode(slackToken);
var slackClient = new SlackClient(slackToken, autoReconnect, autoMark);
var botName = info.botName();
var noticeFlg;

// arduino
var board = new five.Board();

board.on('ready', function() {
    var led = new five.Led(13);
    var sensor = new five.Sensor( {
        pin: 'A0',
        freq: 1000
    });

    sensor.on('data', function() {
        console.log(this.value);

        var dt = new Date();
        var currentTime = dt.toFormat("HH24MISS");
        var numberedTime = Number(currentTime);
        console.log(numberedTime);

        // if (numberedTime > 183000 && numberedTime < 183100 && !noticeFlg) {
        if (numberedTime > 183000 && !noticeFlg) {
            led.on();
            slackNode.api('chat.postMessage', {
                text: '定時だね〜。今日もおつかれさま！',
                channel: '#iot-room',
                as_user: true
            }, function(err, response) {
                console.log(response);
            });

            // 調味料の量測定
            if (this.value < 200) {
                slackNode.api('chat.postMessage', {
                    text: 'お醤油、もうすぐ切れそうやったよ〜？帰りに買って帰ろっか！',
                    channel: '#iot-room',
                    as_user: true
                }, function(err, response) {
                    console.log(response);
                });
            }

            noticeFlg = true;
        }
        // if (numberedTime > 183100) {
        //     noticeFlg = false;
        // }
    });
});

slackClient.login();

slackClient.on('open', function() {
    console.log('slackClient is activated.');
})

slackClient.on('message', function(message) {
    var text = message.text;
    var user = message.user;
    if (/わかった/.test(text)) {
        presetTemp -= 1;
        slackNode.api('chat.postMessage', {
            text: "はよ帰ってきてなぁ〜♪",
            channel: '#iot-room',
            as_user: true
        }, function(err, response) {
            console.log(response);
        });
    }
});

slackClient.on('error', function(error) {
    console.log('Error: %s', error);
});
