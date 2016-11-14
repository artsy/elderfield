require('../../setup');

describe('artsy alexa', function() {
    artistAboutIntentRequest = function(artistName, cb) {
        var artistAboutIntentRequest = require('./ArtistAboutIntentRequest.json');
        artistAboutIntentRequest.request.intent.slots.ARTIST.value = artistName;
        chai.request(server)
            .post('/alexa/artsy')
            .send(artistAboutIntentRequest)
            .end(function(err, res) {
                expect(res.status).to.equal(200);
                var data = JSON.parse(res.text);
                expect(data.response.outputSpeech.type).to.equal('SSML')
                cb(data.response.outputSpeech.ssml);
            });
    }

    it('speaks about an artist', function(done) {
        artistAboutIntentRequest('Andy Warhol', function(ssml) {
            expect(ssml).to.startWith('<speak>Obsessed with celebrity');
            expect(ssml).to.endWith('taken up by major contemporary artists Richard Prince, Takashi Murakami, and Jeff Koons, among countless others.</speak>');
            done();
        });
    });
});
