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
var ds = milkcocoa.dataStore('brightness');

// arduino
var board = new five.Board();
var sensor;
var isDark = false;
var isLight = false;

// message pattern
var msgWelcome = [
    'おかえりにゃー！',
    'あっ！帰ってきた！おつかれさま！',
    'おかえりなさい、あっ、夜ご飯はラーメンにする？？'
];
var msgRamen = [
    'わぁいラーメン！凛ラーメン大好き！',
    '何ラーメンにする？？凛は味噌ラーメンが食べたいなぁ・・。'
];

board.on('ready', function() {
    var led = new five.Led(13);
    //slackに起動通知
    slackNode.api('chat.postMessage', {
        text: '電源が入ったよ！',
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
        led.on();
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
        led.off();
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

slackClient.login();

slackClient.on('open', function() {
    console.log('open');
});

slackClient.on('error', function(error) {
    console.error('Error: %s', error);
});

slackClient.on('message', function(message) {
    var text = message.text;
    var user = message.user;
    if (user == botName) {
        var isBotMsg = true;
    }
    if (!isBotMsg) {
        if (/ただいま/.test(text)) {
            slackNode.api('chat.postMessage', {
                text: randMessage(msgWelcome),
                channel: '#iot-room',
                as_user: true
            }, function(err, response) {
                console.log(response);
            });
        }
        if (/ラーメン/.test(text)) {
            slackNode.api('chat.postMessage', {
                text: randMessage(msgRamen),
                channel: '#iot-room',
                as_user: true
            }, function(err, response) {
                console.log(response);
            });
        }
    }
});

function randMessage(array) {
    var rand = array[Math.floor(Math.random() * array.length)];
    return rand;
}
