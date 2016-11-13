var alexa = require('alexa-app');
var app = new alexa.app('artsy');
var xapp = require('./models/xapp');
var api = require('./models/api');
var _ = require('underscore');

module.change_code = 1; // allow this module to be reloaded by hotswap when changed

app.launch(function(req, res) {
    res.say("Welcome to Artsy!");
});

app.intent('ArtistAgeIntent', {
        "slots": {
            "ARTIST": "LITERAL"
        },
        "utterances": [
            "{When|Where} was {the artist|artist|} {Andy Warhol|Warhol|Malevich|ARTIST} born"
        ]
    },
    function(req, res) {
        var artistName = req.slot('ARTIST');
        api.instance().then(function(api) {
            api.findFirst(artistName, "Artist").then(function(artist) {
                if (artist.hometown || artist.birthday) {
                    var message = _.compact([
                        artist.nationality && artist.nationality != "" ? artist.nationality : 'The',
                        "artist",
                        artist.name,
                        "was born",
                        artist.hometown && artist.hometown != "" ? "in " + _.first(artist.hometown.split(',')) : null,
                        artist.birthday && artist.birthday != "" ? "in " + _.last(artist.birthday.split(',')) : null
                    ]).join(' ');
                    res.say(message);
                } else {
                    res.say("Sorry, I don't know when or where artist " + artistName + " was born.");
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
