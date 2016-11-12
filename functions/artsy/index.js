var alexa = require('alexa-app');
var app = new alexa.app('artsy');
var superagent = require('superagent');
var traverson = require('traverson');
var JsonHalAdapter = require('traverson-hal');
traverson.registerMediaType(JsonHalAdapter.mediaType, JsonHalAdapter);
var api = traverson.from('https://api.artsy.net/api').jsonHal();

module.change_code = 1; // allow this module to be reloaded by hotswap when changed

app.launch(function(req, res) {
    res.say("Welcome to Artsy!");
});

app.intent('ArtistAgeIntent', {
        "slots": {
            "ARTIST": "LITERAL"
        },
        "utterances": [
            "When was {Andy Warhol|Warhol|Malevich|ARTIST} born"
        ]
    },
    function(req, res) {

        superagent
            .post('https://api.artsy.net/api/tokens/xapp_token')
            .send({ client_id: process.env["ARTSY_CLIENT_ID"], client_secret: process.env["ARTSY_CLIENT_SECRET"] })
            .end(function(err, rc) {
                if (rc && rc.body.token) {
                    xappToken = rc.body.token;

                    api.newRequest()
                        .follow('search')
                        .withRequestOptions({
                            headers: {
                                'X-Xapp-Token': xappToken,
                                'Accept': 'application/vnd.artsy-v2+json'
                            }
                        })
                        .withTemplateParameters({ q: req.slot('ARTIST') })
                        .getResource(function(error, results) {
                                var result = null;
                                if (results && results._embedded) { result = results._embedded.results[0]; }
                                if (result && result.type == 'Artist') {
                                    api.newRequest()
                                        .from(result._links.self.href)
                                        .withRequestOptions({
                                            headers: {
                                                'X-Xapp-Token': xappToken,
                                                'Accept': 'application/vnd.artsy-v2+json'
                                            }
                                        })
                                        .getResource(function(error, artist) {
                                            if (artist && artist.birthday) {
                                                res.say('The artist ' + artist.name + ' was born in ' + artist.birthday);
                                                res.send();
                                            } else {
                                                res.say("I don't know when the artist " + req.slot('ARTIST') + " was born.");
                                                res.send();
                                            }
                                        });
                                } else {
                                    res.say("I don't know anything about the artist " + req.slot('ARTIST'));
                                    res.send();
                                }
                        });
                } else {
                    res.say("I can't connect to Artsy.");
                    res.send();
                }
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
