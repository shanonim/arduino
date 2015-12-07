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
// var led = new five.Led(13);
var sensor;
var isDark = false;
var isLight = false;

board.on('ready', function() {
    // LED ON
    // led.on();
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
    // 照度が一定値を上回ったらLED ON
    sensor.within([401, 1000], function() {
        // led.on();
        //slackに通知
        if (!isLight) {
            slackNode.api('chat.postMessage', {
                text: '明るいにゃ〜',
                channel: '#iot-room',
                as_user: true
            }, function(err, response) {
                console.log(response);
            });
            isLight = true;
            isDark = false;
        }
    });
    // 照度が一定値を下回ったらLED OFF
    sensor.within([0, 400], function() {
        // led.off();
        //slackに通知
        if (!isDark) {
            slackNode.api('chat.postMessage', {
                text: '暗いにゃ〜',
                channel: '#iot-room',
                as_user: true
            }, function(err, response) {
                console.log(response);
            });
            isDark = true;
            isLight = false;
        }
    });
});

slackClient.on('open', function() {
    console.log('open');
});

slackClient.on('message', function(message) {
    console.log(message);
});

slackClient.on('error', function(error) {
    console.error('Error: %s', error);
});

slackClient.login();
