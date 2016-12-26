require('../../setup');

describe('artsy alexa', function() {
    showsIntentRequest = function(cityName, cb) {
        var showsIntentRequest = require('./fixtures/ShowsIntentRequest.json');
        showsIntentRequest.request.intent.slots.CITY.value = cityName;
        chai.request(server)
            .post('/alexa/artsy')
            .send(showsIntentRequest)
            .end(function(err, res) {
                expect(res.status).to.equal(200);
                var data = JSON.parse(res.text);
                expect(data.response.outputSpeech.type).to.equal('SSML')
                cb(data.response);
            });
    }

    it('speaks about shows in brooklyn', function(done) {
        showsIntentRequest('brooklyn', function(response) {
            expect(response.outputSpeech.ssml).to.startWith('<speak>Current exhibitions around brooklyn: ');
            expect(response.outputSpeech.ssml).to.endWith('</speak>');
            expect(response.shouldEndSession).to.equal(true);
            done();
        });
    });

    it('properly handles unknown cities', function(done) {
        showsIntentRequest('gibberish', function(response) {
            expect(response.outputSpeech.ssml).to.equal("<speak>Sorry, I couldn't find gibberish. Try again?</speak>");
            expect(response.shouldEndSession).to.equal(false);
            done();
        });
    });

    it('properly handles cities without shows', function(done) {
        showsIntentRequest('kerman', function(response) {
            expect(response.outputSpeech.ssml).to.equal("<speak>Sorry, I couldn't find any shows in kerman. Try again?</speak>");
            expect(response.shouldEndSession).to.equal(false);
            done();
        });
    });
});
