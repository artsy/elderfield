require('../../setup');

describe('artsy alexa', function() {
    aboutIntentRequest = function(artistName, cb) {
        var aboutIntentRequest = require('./AboutIntentRequest.json');
        aboutIntentRequest.request.intent.slots.VALUE.value = artistName;
        chai.request(server)
            .post('/alexa/artsy')
            .send(aboutIntentRequest)
            .end(function(err, res) {
                expect(res.status).to.equal(200);
                var data = JSON.parse(res.text);
                expect(data.response.outputSpeech.type).to.equal('SSML')
                cb(data.response.outputSpeech.ssml);
            });
    }

    it('speaks about an artist', function(done) {
        aboutIntentRequest('Andy Warhol', function(ssml) {
            expect(ssml).to.startWith('<speak>Obsessed with celebrity');
            expect(ssml).to.endWith('taken up by major contemporary artists Richard Prince, Takashi Murakami, and Jeff Koons, among countless others.</speak>');
            done();
        });
    });

    it('speaks about artsy', function(done) {
        aboutIntentRequest('artsy', function(ssml) {
            expect(ssml).to.startWith('<speak>Artsy’s mission is ');
            done();
        });
    });
});
