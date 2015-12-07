var SlackNode = require('slack-node');
var SlackClient = require('slack-client');

// slack
var apiToken = 'xoxb-15928680374-sxC1yCKlO9Em14bP9hgqPzwP';
var autoReconnect = true;
var autoMark = true;
var slackNode = new SlackNode(apiToken);
var slackClient = new SlackClient(apiToken, autoReconnect, autoMark);

// slackNode.api('users.list', function(err, response) {
//     console.log(response);
// });

// slackNode.api('chat.postMessage', {
//     text: '凛だよ！今ね、node.jsからメッセージしてるの！',
//     channel: '#iot-room',
//     as_user: true
// }, function(err, response) {
//     console.log(response);
// });

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

/*
webhookUri = 'https://hooks.slack.com/services/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';
slack = new Slack();
slack.setWebhook(webhookUri);

slack.webhook( {
    channel: '#iot-room',
    username: 'webhookBot',
    text: 'Hello, from arduino.'
}, function(err, response) {
    console.log(response);
});
*/
