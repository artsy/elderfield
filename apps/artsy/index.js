var alexa = require('alexa-app');

module.change_code = 1; // allow this module to be reloaded by hotswap when changed

var app = new alexa.app('artsy');

app.launch(function(req, res) {
    res.say("Welcome to Artsy!");
});

app.intent('ArtistAgeIntent', {
        "slots": {
            "ARTIST": "LITERAL"
        },
        "utterances": [
            "When was {Andy Warhol|Warhol|Malevich|ARTIST} born?"
        ]
    },
    function(req, res) {
        res.say('The artist ' + req.slot('ARTIST') + ' was born.');
    }
);

module.exports = app;
