var alexa = require('alexa-app');
var app = new alexa.app('artsy');
var xapp = require('./models/xapp');
var api = require('./models/api');

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
        var artist = req.slot('ARTIST');
        api.instance().then(function(api) {
            api.findFirst(artist, "Artist").then(function(artist) {
                var message = "";
                if (artist.nationality && artist.nationality != "") {
                    message = artist.nationality;
                } else {
                    message = "The"
                }
                message += " artist " + artist.name + " was born in ";
                if (artist.hometown && artist.hometown != "") {
                    message += artist.hometown + ' in ';
                }
                message += artist.birthday;
                res.say(message);
                res.send();
            }).fail(function(error) {
                res.say("I couldn't find an artist named " + artist + ".");
                res.send();
            });
        }).fail(function(error) {
            res.say("I couldn't connect to Artsy.");
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
