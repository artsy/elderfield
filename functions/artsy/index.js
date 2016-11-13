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
            api.search(artist).then(function(results) {
                var artist_result = results._embedded.results[0];
                if (artist_result && artist_result.type == 'Artist') {
                    api.from(artist_result._links.self.href).then(function(artist) {
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
                        res.say("I don't know where or when the artist " + artist + " was born.");
                        res.send();
                    });
                } else {
                    res.say("I don't know an artist called " + artist);
                    res.send();
                }
            }).fail(function(error) {
                res.say("I don't know anything about the artist " + artist);
                res.send();
            });
        }).fail(function(error) {
            res.say(error);
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
