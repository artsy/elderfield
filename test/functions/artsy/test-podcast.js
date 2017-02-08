require('../../setup');

describe('artsy alexa', function() {
  podcastIntentRequest = function(podcastNumber, cb) {
    var podcastIntentRequest = require('./fixtures/PodcastIntentRequest.json');
    podcastIntentRequest.request.intent.slots.NUMBER.value = podcastNumber;
    chai.request(server)
      .post('/alexa/artsy')
      .send(podcastIntentRequest)
      .end(function(err, res) {
        expect(res.status).to.equal(200);
        var data = JSON.parse(res.text);
        cb(data.response);
      });
  }

  it('plays podcast by number', function(done) {
    podcastIntentRequest(23, function(response) {
      expect(response).to.eql({
        directives: [{
          type: 'AudioPlayer.Play',
          playBehavior: 'REPLACE_ALL',
          audioItem: {
            stream: {
              offsetInMilliseconds: 0,
              token: "https://feeds.soundcloud.com/stream/304688136-artsypodcast-no-23-what-does-it-mean-to-curate-gifs.mp3",
              url: "https://feeds.soundcloud.com/stream/304688136-artsypodcast-no-23-what-does-it-mean-to-curate-gifs.mp3"
            }
          }
        }],
        shouldEndSession: true
      })
      expect(response.shouldEndSession).to.equal(true);
      done();
    });
  });

  it('plays latest podcast', function(done) {
    podcastIntentRequest("", function(response) {
      var directive = response.directives[0];
      expect(directive.type).to.equal('AudioPlayer.Play');
      expect(directive.playBehavior).to.equal('REPLACE_ALL');
      expect(directive.audioItem.stream.token).to.not.include('-23-');
      expect(response.shouldEndSession).to.equal(true);
      done();
    });
  });

  it('shows error when the podcast cannot be found', function(done) {
    podcastIntentRequest(6666, function(response) {
      expect(response.outputSpeech.type).to.equal('SSML');
      expect(response.outputSpeech.ssml).to.equal("<speak>Sorry, I couldn't find Artsy podcast number 6666. Try again?</speak>");
      expect(response.shouldEndSession).to.equal(false);
      done();
    });
  });

  it('pauses podcast', function(done) {
    var pauseIntentRequest = require('./fixtures/PauseIntentRequest.json');
    chai.request(server)
      .post('/alexa/artsy')
      .send(pauseIntentRequest)
      .end(function(err, res) {
        expect(res.status).to.equal(200);
        var data = JSON.parse(res.text);
        var response = data.response;
        expect(response.directives[0].type).to.equal('AudioPlayer.Stop');
        expect(response.shouldEndSession).to.equal(true);
        done();
      });
  });
});
