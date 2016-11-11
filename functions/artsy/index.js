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

if (process.env['LAMBDA_FUNCTION_NAME'] != null) {
    console.log("Starting Artsy Alexa on AWS lambda.")
    exports.handle = app.lambda();
} else if (process.env['ENV'] == 'development') {
    console.log("Starting Artsy Alexa in development mode.")
    module.exports = app;
} else {
    var fs = require('fs');
    fs.writeFileSync('schema.json', app.schema());
    fs.writeFileSync('utterances.txt', app.utterances());
    console.log('Schema and utterances exported!');
}
