// This loads the environment variables from the .env file
require('dotenv-extended').load();


var express = require('express');
var builder = require('botbuilder'); //
var needle = require('needle');
var restify = require('restify');
var url = require('url');
var validUrl = require('valid-url');
var captionService = require('./caption-service');
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

// Gets the caption by checking the type of the image (stream vs URL) and calling the appropriate caption service method.
var bot = new builder.UniversalBot(connector, function(session) {
    if (hasImageAttachment(session)) {
        var stream = getImageStreamFromMessage(session.message);
        captionService
            .getCaptionFromStream(stream)
            .then(function(caption) { handleSuccessResponse(session, caption); })
            .catch(function(error) { handleErrorResponse(session, error); });
    } else {
        var imageUrl = parseAnchorTag(session.message.text) || (validUrl.isUri(session.message.text) ? session.message.text : null);
        if (imageUrl) {
            captionService
                .getCaptionFromUrl(imageUrl)
                .then(function(caption) { handleSuccessResponse(session, caption); })
                .catch(function(error) { handleErrorResponse(session, error); });
        } else {
            session.send('Kindly Upload an image or a url');
        }
    }
});

//=========================================================
// Bots Events
//=========================================================

//Sends greeting message when the bot is first added to a conversation
bot.on('conversationUpdate', function(message) {
    if (message.membersAdded) {
        message.membersAdded.forEach(function(identity) {
            if (identity.id === message.address.bot.id) {
                var reply = new builder.Message()
                    .address(message.address)
                    .text('Hey There!! Add an image or image url and I\'ll tell you what it is');
                bot.send(reply);
            }
        });
    }
});


//=========================================================
// Utilities
//=========================================================
function hasImageAttachment(session) {
    return session.message.attachments.length > 0 &&
        session.message.attachments[0].contentType.indexOf('image') !== -1;
}

function getImageStreamFromMessage(message) {
    var headers = {};
    var attachment = message.attachments[0];
    if (checkRequiresToken(message)) {
        // The Skype attachment URLs are secured by JwtToken,
        // you should set the JwtToken of your bot as the authorization header for the GET request your bot initiates to fetch the image.
        // https://github.com/Microsoft/BotBuilder/issues/662
        connector.getAccessToken(function(error, token) {
            var tok = token;
            headers['Authorization'] = 'Bearer ' + token;
            headers['Content-Type'] = 'application/octet-stream';

            return needle.get(attachment.contentUrl, { headers: headers });
        });
    }

    headers['Content-Type'] = attachment.contentType;
    return needle.get(attachment.contentUrl, { headers: headers });
}

function checkRequiresToken(message) {
    return message.source === 'skype' || message.source === 'msteams';
}

/**
 * Gets the href value in an anchor element.
 * Skype transforms raw urls to html. Here we extract the href value from the url
 * @param {string} input Anchor Tag
 * @return {string} Url matched or null
 */
function parseAnchorTag(input) {
    var match = input.match('^<a href=\"([^\"]*)\">[^<]*</a>$');
    if (match && match[1]) {
        return match[1];
    }

    return null;
}

//=========================================================
// Response Handling
//=========================================================
function handleSuccessResponse(session, caption) {
    if (caption) {
        session.send('That looks like a : ' + caption);
    } else {
        session.send('Don\'t know what that is...Hmmm...');
    }

}

function handleErrorResponse(session, error) {
    session.send('Oops! Something went wrong. Try again later.');
    console.error(error);
}

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});