var alexa = require('alexa-app');
var app = new alexa.app('artsy');
var xapp = require('./models/xapp');
var api = require('./models/api');
var _ = require('underscore');
var removeMd = require('remove-markdown');

module.change_code = 1; // allow this module to be reloaded by hotswap when changed

var helpText = "Ask me about an artist. Say help if you need help or exit any time to exit."

app.launch(function(req, res) {
    res
        .say("Welcome to Artsy! Ask me about an artist.")
        .shouldEndSession(false, helpText)
    return true;
});

app.intent('AMAZON.StopIntent', {
        "slots": {},
        "utterances": [
            "stop"
        ]
    },
    function(req, res) {
        res.say("Find out more at artsy.net. Goodbye.");
        res.send();
    }
);

app.intent('AMAZON.CancelIntent', {
        "slots": {},
        "utterances": [
            "cancel"
        ]
    },
    function(req, res) {
        res.say("Find out more at artsy.net. Goodbye.");
        res.send();
    }
);

app.intent('AMAZON.HelpIntent', {
        "slots": {},
        "utterances": [
            "help"
        ]
    },
    function(req, res) {
        res.say("If you don't know Artsy, ask Artsy about Artsy. You can then ask Artsy about an artist. For example say ask Artsy about Norman Rockwell.");
        res.send();
    }
);

app.intent('AboutIntent', {
        "slots": {
            "VALUE": "NAME"
        },
        "utterances": [
            "about {-|VALUE}"
        ]
    },
    function(req, res) {
        var value = req.slot('VALUE');

        if (value == 'artsy' || value == 'website artsy') {
            return res.say("Artsy’s mission is to make all the world’s art accessible to anyone with an Internet connection. We are a resource for art collecting and education. Find more at artsy.net.");
        } else if (!value) {
            res.say("Sorry, I didn't get that artist name.");
            return res.shouldEndSession(false, helpText);
        } else {
            api.instance().then(function(api) {
                api.matchArtist(value).then(function(artist) {
                    var message = []

                    if (artist.hometown || artist.birthday) {
                        message.push(_.compact([
                            artist.nationality ? artist.nationality : 'The',
                            "artist",
                            artist.name,
                            "was born",
                            artist.hometown ? "in " + _.first(artist.hometown.split(',')) : null,
                            artist.birthday ? "in " + _.last(artist.birthday.split(',')) : null,
                            artist.deathday ? "and died in " + _.last(artist.deathday.split(',')) : null
                        ]).join(' '));
                    }

                    if (artist.blurb || artist.biography) {
                        message.push(artist.blurb || artist.biography);
                    }

                    if (message.length > 0) {
                        res.say(removeMd(message.join('. ')));
                    } else {
                        res.say("Sorry, I don't know much about " + value + ".");
                    }

                    res.send();
                }).fail(function(error) {
                    res.say("Sorry, I couldn't find an artist " + value + ".");
                    res.send();
                });
            }).fail(function(error) {
                res.say("Sorry, I couldn't connect to Artsy.");
                res.send();
            });

            return false;
        }
    }
);

if (process.env['ENV'] == 'lambda') {
    console.log("Starting Artsy Alexa on AWS lambda.")
    exports.handle = app.lambda();
} else if (process.env['ENV'] == 'development') {
    console.log("Starting Artsy Alexa in development mode.")
    module.exports = app;
} else {
    var fs = require('fs');
    fs.writeFileSync('schema.json', app.schema());
    fs.writeFileSync('utterances.txt', app.utterances());
    console.log('Schema and utterances exported.');
}
