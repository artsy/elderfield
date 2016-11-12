require('../../setup');

describe('artsy alexa', function() {
    it('should say the year an artist was born', function(done) {
        chai.request(server)
            .post('/alexa/artsy')
            .send(require('./ArtistAgeIntentRequest.json'))
            .end(function(err, res) {
                expect(res.status).to.equal(200);
                var data = JSON.parse(res.text);
                expect(data.response.outputSpeech.type).to.equal('SSML')
                expect(data.response.outputSpeech.ssml).to.equal('<speak>The artist Andy Warhol was born in Pittsburgh, Pennsylvania in 1928</speak>')
                done();
            });
    });
});
