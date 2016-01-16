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

var noticeFlg = false;

if (!noticeFlg) {
    slackNode.api('chat.postMessage', {
        text: '定時だね〜。今日もおつかれさま！',
        channel: '#iot-test',
        as_user: true
    }, function(err, response) {
        console.log(response);
    });

    slackNode.api('chat.postMessage', {
        text: 'お醤油、もうすぐ切れそうやったよ〜？帰りに買って帰ろっか！',
        channel: '#iot-test',
        as_user: true
    }, function(err, response) {
        console.log(response);
    });

    noticeFlg = true;
}

slackClient.login();

slackClient.on('open', function() {
    console.log('slackClient is activated.');
})

slackClient.on('message', function(message) {
    var text = message.text;
    var user = message.user;
    if (/わかった/.test(text)) {
        slackNode.api('chat.postMessage', {
            text: "はよ帰ってきてなぁ〜♪",
            channel: '#iot-test',
            as_user: true
        }, function(err, response) {
            console.log(response);
        });
    }
});

slackClient.on('error', function(error) {
    console.log('Error: %s', error);
});
