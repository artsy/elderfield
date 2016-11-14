var alexa = require('alexa-app');
var app = new alexa.app('artsy');
var xapp = require('./models/xapp');
var api = require('./models/api');
var _ = require('underscore');
var removeMd = require('remove-markdown');

module.change_code = 1; // allow this module to be reloaded by hotswap when changed

app.launch(function(req, res) {
    res.say("Welcome to Artsy!");
});

app.intent('AboutIntent', {
        "slots": {
            "VALUE": "LITERAL"
        },
        "utterances": [
            "what is artsy",
            "{to tell me|} about {the artist|artist|} {kasimir malevich|malevich|VALUE}"
        ]
    },
    function(req, res) {
        var value = req.slot('VALUE');

        if (value == 'artsy') {
            return res.say("Artsy’s mission is to make all the world’s art accessible to anyone with an Internet connection. We are a resource for art collecting and education. Find more at artsy.net.");
        }

        api.instance().then(function(api) {
            api.matchArtist(value).then(function(artist) {
                var message = artist.blurb || artist.biography
                if (message) {
                    res.say(removeMd(message));
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
);

app.intent('ArtistBornIntent', {
        "slots": {
            "ARTIST": "LITERAL"
        },
        "utterances": [
            "{when|where|when and where|where and when} was {the artist|artist|} {kasimir malevich|malevich|ARTIST} born",
            "{when|where|when and where|where and when} {the artist|artist|} {kasimir malevich|malevich|ARTIST} was born",
            "{when} did {the artist|artist|} {kasimir malevich|malevich|ARTIST} die",
            "{where} is {the artist|artist|} {kasimir malevich|malevich|ARTIST} from",
            "{where} {the artist|artist|} {kasimir malevich|malevich|ARTIST} is from"
        ]
    },
    function(req, res) {
        var artistName = req.slot('ARTIST');
        api.instance().then(function(api) {
            api.matchArtist(artistName).then(function(artist) {
                if (artist.hometown || artist.birthday) {
                    var message = _.compact([
                        artist.nationality ? artist.nationality : 'The',
                        "artist",
                        artist.name,
                        "was born",
                        artist.hometown ? "in " + _.first(artist.hometown.split(',')) : null,
                        artist.birthday ? "in " + _.last(artist.birthday.split(',')) : null,
                        artist.deathday ? "and died in " + _.last(artist.deathday.split(',')) : null
                    ]).join(' ');
                    res.say(message);
                } else {
                    res.say("Sorry, I don't know much about the artist " + artistName + ".");
                }
                res.send();
            }).fail(function(error) {
                res.say("Sorry, I couldn't find an artist named " + artistName + ".");
                res.send();
            });
        }).fail(function(error) {
            res.say("Sorry, I couldn't connect to Artsy.");
            res.send();
        });

        return false;
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
