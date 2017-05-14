var express = require('express');
var builder = require('botbuilder'); //
var app = express();

app.set('port', (process.env.PORT || 3978));
//app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
    response.render('pages/index');
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: '1ad33be7-55ab-4080-b785-cc8551614eca', // appId: process.env.MICROSOFT_APP_ID,
    appPassword: 'BCLen0zPnNZmo3Aar9LqVzD' //appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users 
app.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, function(session) {
    session.send("You said: %s", session.message.text);
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});