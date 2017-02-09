var alexa = require('alexa-app');
var app = new alexa.app('artsy');
var xapp = require('./models/xapp');
var api = require('./models/api');
var podcast = require('./models/podcast');
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

app.launch(function(req, res) {
  console.log('app.launch');
  res
    .say("Welcome to Artsy! Ask me about an artist, or shows in your city.")
    .shouldEndSession(false, "Say help if you need help or exit any time to exit. What artist would you like to hear about?")
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

app.intent('AMAZON.PauseIntent', {},
  function(req, res) {
    console.log('app.AMAZON.PauseIntent');
    res.audioPlayerStop();
    res.send();
  }
);

app.intent('AMAZON.ResumeIntent', {},
  function(req, res) {
    console.log('app.AMAZON.ResumeIntent');
    if (req.context.AudioPlayer.offsetInMilliseconds > 0 && req.context.AudioPlayer.playerActivity === 'STOPPED') {
      res.audioPlayerPlayStream('REPLACE_ALL', {
        token: req.context.AudioPlayer.token,
        url: req.context.AudioPlayer.token, // hack: use token to remember the URL of the stream
        offsetInMilliseconds: req.context.AudioPlayer.offsetInMilliseconds
      });
    }
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
    console.log(`app.AboutIntent: ${value}.`);

    if (!value) {
      res.say("Sorry, I didn't get that artist name. Try again?");
      return res.shouldEndSession(false, "What artist would you like to hear about?");
    } else {
      api.instance().then(function(api) {
        api.matchArtist(value).then(function(artist) {
          if (value == artist.name) {
            console.log(`app.AboutIntent: matched ${artist.name}.`);
          } else {
            console.log(`app.AboutIntent: matched '${value}' with '${artist.name}' (${artist.id}).`);
          }

          var spokenMessage = [];
          var cardMessage = [];

          if (artist.hometown || artist.birthday) {
            var artistIntro = _.compact([
              artist.nationality ? artist.nationality : 'The',
              "artist",
              artist.name,
              "was born",
              artist.hometown ? `in ${_.first(artist.hometown.split(','))}` : null,
              artist.birthday ? `in ${_.last(artist.birthday.split(','))}` : null,
              artist.deathday ? `and died in ${_.last(artist.deathday.split(','))}` : null
            ]).join(' ') + '.';
            spokenMessage.push(artistIntro);
            cardMessage.push(artistIntro);
          }

          var artistBio = artist.blurb || artist.biography;
          if (artistBio) {
            artistBio = removeMd(artistBio);
            cardMessage.push(artistBio);

            // use the first 3 sentences
            var shortArtistBio = artistBio.split('.').splice(0, 2).join('.') + '.';
            spokenMessage.push(shortArtistBio);
          }

          if (spokenMessage.length > 0) {
            var messageText = spokenMessage.join(' ');
            console.log(`app.AboutIntent: ${messageText}`);
            res.say(messageText);
            res.shouldEndSession(true);
          } else {
            console.log(`app.AboutIntent: don't know much about ${value}.`);
            res.say(`Sorry, I don't know much about ${value}. Try again?`);
            res.shouldEndSession(false);
          }

          if (cardMessage.length > 0) {
            var largeImageUrl;
            var smallImageUrl;

            if (artist.image_urls) {
              smallImageUrl = artist.image_urls.four_thirds;
              largeImageUrl = artist.image_urls.large;
            }

            res.card({
              type: "Standard",
              title: artist.name,
              text: cardMessage.join(' '),
              image: {
                smallImageUrl: smallImageUrl,
                largeImageUrl: largeImageUrl
              }
            });
          }

          res.send();
        }).fail(function(error) {
          console.error(`app.AboutIntent: couldn't find an artist ${value}.`);
          res.say(`Sorry, I couldn't find an artist ${value}. Try again?`);
          res.shouldEndSession(false);
          res.send();
        });
      }).fail(function(error) {
        console.log(`app.AboutIntent: ${error}.`);
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
      "{|for|to recommend} {|a|current} show {in|around} {-|CITY}"
    ]
  },
  function(req, res) {
    var city = req.slot('CITY');
    console.log(`app.ShowsIntent: ${city}.`);

    if (!city) {
      res.say("Sorry, I didn't get that city name. Try again?");
      return res.shouldEndSession(false, "What city would you like me to recommend a show in?");
    } else {
      geocoder.geocode(city)
        .then(function(geoRes) {
          geocodeResult = _.first(geoRes);
          if (_.isEmpty(geoRes)) {
            res.say(`Sorry, I couldn't find ${city}. Try again?`);
            console.log(`app.ShowsIntent: could not geocode '${city}'.`);
            res.shouldEndSession(false);
            res.send();
          } else {
            console.log(`app.ShowsIntent: geocoded '${city}' to ${geocodeResult.latitude}, ${geocodeResult.longitude}.`);
            api.instance().then(function(api) {
              api.findShows(geocodeResult.latitude, geocodeResult.longitude).then(function(results) {
                console.log(`app.ShowsIntent: found ${results.length} show(s) in '${city}'.`);

                var spokenMessage = [];
                var cardMessage = [];
                var show = _.first(results);

                if (show) {
                  console.log(`app.ShowsIntent: recommending '${show.name}' (${show.id}) in '${city}'.`);

                  var showTitle = `${show.name} at ${show.partner.name}`;
                  spokenMessage.push(`I recommend checking out ${showTitle}.`);
                  cardMessage.push(showTitle);

                  spokenMessage.push(show.description);
                  cardMessage.push(show.description);

                  if (show.location) {
                    var address = _.compact([
                      show.location.address,
                      show.location.address_2,
                      show.location.city,
                      show.location.state,
                      show.location.postal_code,
                      show.location.phone
                    ]).join(' ')
                    cardMessage.push(address);
                  }

                  var smallImageUrl;
                  var largeImageUrl;

                  if (show.image_urls) {
                    smallImageUrl = show.image_urls.small;
                    largeImageUrl = show.image_urls.large;
                  }

                  res.card({
                    type: "Standard",
                    title: showTitle,
                    text: cardMessage.join(' '),
                    image: {
                      smallImageUrl: smallImageUrl,
                      largeImageUrl: largeImageUrl
                    }
                  });

                  var messageText = spokenMessage.join(' ');
                  console.log(`app.ShowsIntent: ${messageText}`);
                  res.say(messageText);
                  res.shouldEndSession(true);
                } else {
                  console.error(`app.ShowsIntent: couldn't find any shows in '${city}'.`);
                  res.say(`Sorry, I couldn't find any shows in ${city}. Try again?`);
                  res.shouldEndSession(false);
                }
                res.send();
              }).fail(function(error) {
                console.error(`app.ShowsIntent: couldn't find any shows in '${city}', ${error}.`);
                res.say(`Sorry, I couldn't find any shows in ${city}. Try again?`);
                res.shouldEndSession(false);
                res.send();
              });
            }).fail(function(error) {
              console.error(`app.ShowsIntent: ${error}.`);
              res.say("Sorry, I couldn't connect to Artsy. Try again?");
              res.shouldEndSession(false);
              res.send();
            });
          }
        })
        .catch(function(error) {
          console.error(`app.ShowsIntent: ${error}.`);
          res.say(`Sorry, I couldn't find ${city}. Try again?`);
          res.shouldEndSession(false);
          res.send();
        });
    }
    return false;
  }
);

app.intent('PodcastIntent', {
    "slots": {
      "NUMBER": "AMAZON.NUMBER"
    },
    "utterances": [
      "{|to play} {|latest} podcast {|number|episode|episode number} {-|NUMBER}",
      "{|to play} {|the} latest podcast"
    ]
  },
  function(req, res) {
    var podcastNumber = req.slot('NUMBER');
    var podcastStream = podcast.instance();
    console.log(`app.PodcastIntent: ${podcastNumber || 'latest'}`);
    if (podcastNumber && podcastNumber !== "") {
      podcastStream = podcastStream.getEpisodeStreamById(podcastNumber);
    } else {
      podcastStream = podcastStream.getLatestEpisodeStream();
    }

    podcastStream.then(function(audioMpegEnclosure) {
      var streamUrl = audioMpegEnclosure.url.replace('http://', 'https://'); // SSL required by Amazon, available on SoundCloud
      var stream = {
        url: streamUrl,
        token: streamUrl,
        offsetInMilliseconds: 0
      }
      res.audioPlayerPlayStream('REPLACE_ALL', stream);
      console.log(`app.PodcastIntent: ${podcastNumber || 'latest'}, streaming ${stream.url}.`);
      res.send();
    }).catch(function(error) {
      console.error(`app.PodcastIntent: ${podcastNumber || 'latest'}, ${error}.`);
      if (podcastNumber) {
        res.say(`Sorry, I couldn't find Artsy podcast number ${podcastNumber}. Try again?`);
      } else {
        res.say(`Sorry, I couldn't find the latest Artsy podcast. Try again?`);
      }
      res.shouldEndSession(false);
      res.send();
    });

    return false;
  }
);

app.intent('PodcastSummaryIntent', {
    "slots": {
      "NUMBER": "AMAZON.NUMBER"
    },
    "utterances": [
      "for the summary of podcast {|number|episode|episode number} {-|NUMBER}",
      "for the summary of the latest podcast"
    ]
  },
  function(req, res) {
    var podcastNumber = req.slot('NUMBER');
    var podcastInfo = podcast.instance();
    console.log(`app.PodcastSummaryIntent: ${podcastNumber || 'latest'}`);
    if (podcastNumber && podcastNumber !== "") {
      podcastInfo = podcastInfo.getEpisodeById(podcastNumber);
    } else {
      podcastInfo = podcastInfo.getLatestEpisode();
    }

    podcastInfo.then(function(episode) {
      res.say(`Artsy podcast episode ${episode.title.replace('No. ', '')}. ${episode.description}`);
      console.log(`app.PodcastSummaryIntent: ${podcastNumber}, ${episode.title}.`);
      res.send();
    }).catch(function(error) {
      console.error(`app.PodcastSummaryIntent: ${podcastNumber}, ${error}.`);
      res.say(`Sorry, I couldn't find podcast number ${podcastNumber}. Try again?`);
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
