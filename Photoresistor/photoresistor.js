var five = require('johnny-five');
var MilkCocoa = require('milkcocoa');
var SlackNode = require('slack-node');
var SlackClient = require('slack-client');

// slack
var apiToken = 'xoxb-15928680374-sxC1yCKlO9Em14bP9hgqPzwP';
var autoReconnect = true;
var autoMark = true;
var slackNode = new SlackNode(apiToken);
var slackClient = new SlackClient(apiToken, autoReconnect, autoMark);

// Milkcocoa
var milkcocoa = new MilkCocoa('flagihq4kyln.mlkcca.com');
var ds = milkcocoa.dataStore('brightness');

// arduino
var board = new five.Board();
var led = new five.Led(13);
var sensor;

board.on('ready', function() {
    // LED ON
    led.on();
    //slackに起動通知
    slackNode.api('chat.postMessage', {
        text: '電源が入ったよー！',
        channel: '#iot-room',
        as_user: true
    }, function(err, response) {
        console.log(response);
    });
    // アナログセンサ設定
    sensor = new five.Sensor( {
        pin: 'A0',
        freq: 5000
    });
    // Milkcocoaへのデータ送信
    sensor.on('data', function() {
        ds.push({'brightness' : this.value});
        console.log(this.value);
    });
    // 照度が一定値を下回ったらLED OFF
    sensor.within([0, 700], function() {
        led.off();
        //slackに通知
        slackNode.api('chat.postMessage', {
            text: '暗くなったにゃ！',
            channel: '#iot-room',
            as_user: true
        }, function(err, response) {
            console.log(response);
        });
    })
});

slackClient.on('message', function(message) {
    console.log(message);
});
