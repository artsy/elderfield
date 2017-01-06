var alexa = require('alexa-app');
var app = new alexa.app('artsy');
var xapp = require('./models/xapp');
var api = require('./models/api');
var _ = require('underscore');
var removeMd = require('remove-markdown');
var nodeGeocoder = require('node-geocoder');
var artsyPackage = require('./package.json');

var geocodingOptions = {
  provider: 'google',
  httpAdapter: 'https', // Default
  apiKey: process.env["GOOGLE_GEOCODING_API_KEY"]
};
var geocoder = nodeGeocoder(geocodingOptions);

console.log(`Loaded artsy ${artsyPackage.version}.`);

module.change_code = 1; // allow this module to be reloaded by hotswap when changed

var helpText = "Say help if you need help or exit any time to exit. What artist would you like to hear about?"

app.launch(function(req, res) {
    console.log('app.launch');
    res
        .say("Welcome to Artsy! Ask me about an artist, or shows in your city.")
        .shouldEndSession(false, helpText)
        .send();
});

app.intent('AMAZON.StopIntent', {
        "slots": {},
        "utterances": [
            "stop"
        ]
    },
    function(req, res) {
        console.log('app.AMAZON.StopIntent');
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
        console.log('app.AMAZON.CancelIntent');
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
        console.log('app.AMAZON.HelpIntent');
        res.say("Artsy’s mission is to make all the world’s art accessible to anyone with an Internet connection. You can ask Artsy about an artist. For example say ask Artsy about Norman Rockwell. What artist would you like to hear about?");
        res.shouldEndSession(false);
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
        console.log('app.AboutIntent: ' + value);

        if (!value) {
            res.say("Sorry, I didn't get that artist name. Try again?");
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
                            artist.hometown ? `in ${_.first(artist.hometown.split(','))}` : null,
                            artist.birthday ? `in ${_.last(artist.birthday.split(','))}` : null,
                            artist.deathday ? `and died in ${_.last(artist.deathday.split(','))}` : null
                        ]).join(' '));
                    }

                    var artistBio = artist.blurb || artist.biography;
                    if (artistBio) {
                        // use the first 3 sentences
                        artistBio = artistBio.split(".").splice(0, 2).join(".") + ".";
                        message.push(artistBio);
                    }

                    if (message.length > 0) {
                        res.say(removeMd(message.join('. ')));
                        res.shouldEndSession(true);
                    } else {
                        res.say(`Sorry, I don't know much about ${value}. Try again?`);
                        res.shouldEndSession(false);
                    }

                    res.send();
                }).fail(function(error) {
                    res.say(`Sorry, I couldn't find an artist ${value}. Try again?`);
                    res.shouldEndSession(false);
                    res.send();
                });
            }).fail(function(error) {
                res.say("Sorry, I couldn't connect to Artsy. Try again?");
                res.shouldEndSession(false);
                res.send();
            });

            return false;
        }
    }
);

app.intent('ShowsIntent', {
        "slots": {
            "CITY": "AMAZON.US_CITY"
        },
        "utterances": [
            "for {|current} shows {in|around} {-|CITY}"
        ]
    },
    function(req, res) {
        var city = req.slot('CITY');
        console.log('app.ShowsIntent: ' + city);

        geocoder.geocode(city)
            .then(function(geoRes) {
                geocodeResult = _.first(geoRes);
                if (_.isEmpty(geoRes)) {
                    res.say(`Sorry, I couldn't find ${city}. Try again?`);
                    console.log(`app.ShowsIntent: could not geocode city: ${city}.`);
                    res.shouldEndSession(false);
                    res.send();
                } else {
                    console.log(`app.ShowsIntent: fetching shows for: ${city}.`);
                    api.instance().then(function(api) {
                        api.findShows(geocodeResult.latitude, geocodeResult.longitude).then(function(results) {
                            var intro = `Current exhibitions around ${city}`
                            var message = []
                            _.each(results, function(show) {
                                message.push(`${show.name} at ${show.partner.name}`)
                            })
                            if (message.length > 0) {
                                res.say(`${intro}: ${message.join('. ')}`);
                                res.shouldEndSession(true);
                            } else {
                                res.say(`Sorry, I couldn't find any shows in ${city}. Try again?`);
                                res.shouldEndSession(false);
                            }
                            res.send();
                        }).fail(function(error) {
                            res.say(`Sorry, I couldn't find any shows in ${city}. Try again?`);
                            res.shouldEndSession(false);
                            res.send();
                        });
                    }).fail(function(error) {
                        res.say("Sorry, I couldn't connect to Artsy. Try again?");
                        res.shouldEndSession(false);
                        res.send();
                    });
                }
            })
            .catch(function(err) {
                res.say(`Sorry, I couldn't find ${city}. Try again?`);
                res.shouldEndSession(false);
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
} else if (process.env['ENV'] == 'test') {
    console.log("Starting Artsy Alexa in test mode.")
    module.exports = app;
} else {
    var fs = require('fs');
    fs.writeFileSync('schema.json', app.schema());
    fs.writeFileSync('utterances.txt', app.utterances());
    console.log('Schema and utterances exported.');
}
