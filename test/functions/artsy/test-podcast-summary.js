require('../../setup');

describe('artsy alexa', function() {
  podcastSummaryIntentRequest = function(podcastSummaryNumber, cb) {
    var podcastSummaryIntentRequest = require('./fixtures/PodcastSummaryIntentRequest.json');
    podcastSummaryIntentRequest.request.intent.slots.NUMBER.value = podcastSummaryNumber;
    chai.request(server)
      .post('/alexa/artsy')
      .send(podcastSummaryIntentRequest)
      .end(function(err, res) {
        expect(res.status).to.equal(200);
        var data = JSON.parse(res.text);
        cb(data.response);
      });
  }

  it('describes podcastSummary by number', function(done) {
    podcastSummaryIntentRequest(13, function(response) {
      expect(response.outputSpeech.ssml).to.startWith('<speak>Artsy podcast episode number 13: We Still Need All-Female Group Shows. With the number of all-female group');
      expect(response.shouldEndSession).to.equal(true);
      done();
    });
  });

  it('describes the latest podcast', function(done) {
    podcastSummaryIntentRequest("", function(response) {
      expect(response.outputSpeech.ssml).to.not.startWith('<speak>Artsy podcast episode number 13');
      expect(response.outputSpeech.ssml).to.startWith('<speak>Artsy podcast ');
      expect(response.shouldEndSession).to.equal(true);
      done();
    });
  });

  it('shows error when the podcastSummary cannot be found', function(done) {
    podcastSummaryIntentRequest(6666, function(response) {
      expect(response.outputSpeech.type).to.equal('SSML');
      expect(response.outputSpeech.ssml).to.equal("<speak>Sorry, I couldn't find podcast number 6666. Try again?</speak>");
      expect(response.shouldEndSession).to.equal(false);
      done();
    });
  });
});
