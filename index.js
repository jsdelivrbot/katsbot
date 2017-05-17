// This loads the environment variables from the .env file
//require('dotenv-extended').load();


var express = require('express');
var builder = require('botbuilder');
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
// Gets the caption by checking the type of the image (stream vs URL) and calling the appropriate caption service method.

// var bot = new builder.UniversalBot(connector, function(session) {
//     session.send("You said: %s", session.message.text);
// });

// Create your bot with a function to receive messages from the user
// Create bot and default message handler
var bot = new builder.UniversalBot(connector, function(session) {
    session.send("Hi... We sell shirts. Say 'show shirts' to see our products.");
});

// Add dialog to return list of shirts available
bot.dialog('showShirts', function(session) {
    var msg = new builder.Message(session);
    msg.attachmentLayout(builder.AttachmentLayout.carousel)
    msg.attachments([
        new builder.HeroCard(session)
        .title("Classic White T-Shirt")
        .subtitle("100% Soft and Luxurious Cotton")
        .text("Price is $25 and carried in sizes (S, M, L, and XL)")
        .images([builder.CardImage.create(session, 'http://petersapparel.parseapp.com/img/whiteshirt.png')])
        .buttons([
            builder.CardAction.imBack(session, "buy classic white t-shirt", "Buy")
        ]),
        new builder.HeroCard(session)
        .title("Classic Gray T-Shirt")
        .subtitle("100% Soft and Luxurious Cotton")
        .text("Price is $25 and carried in sizes (S, M, L, and XL)")
        .images([builder.CardImage.create(session, 'http://petersapparel.parseapp.com/img/grayshirt.png')])
        .buttons([
            builder.CardAction.imBack(session, "buy classic gray t-shirt", "Buy")
        ])
    ]);
    session.send(msg).endDialog();
}).triggerAction({ matches: /^(show|list)/i });

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});