require('../../setup');

describe('artsy alexa', function() {
    it('speaks the year an artist was born', function(done) {
        chai.request(server)
            .post('/alexa/artsy')
            .send(require('./ArtistAgeIntentRequest.json'))
            .end(function(err, res) {
                expect(res.status).to.equal(200);
                var data = JSON.parse(res.text);
                expect(data.response.outputSpeech.type).to.equal('SSML')
                expect(data.response.outputSpeech.ssml).to.equal('<speak>American artist Andy Warhol was born in Pittsburgh in 1928</speak>')
                done();
            });
    });
    it('properly joins dates and places', function(done) {
        var artistAgeIntentRequest = require('./ArtistAgeIntentRequest.json');
        artistAgeIntentRequest.request.intent.slots.ARTIST.value = 'Norman Rockwell'
        chai.request(server)
            .post('/alexa/artsy')
            .send(artistAgeIntentRequest)
            .end(function(err, res) {
                expect(res.status).to.equal(200);
                var data = JSON.parse(res.text);
                expect(data.response.outputSpeech.type).to.equal('SSML')
                expect(data.response.outputSpeech.ssml).to.equal('<speak>American artist Norman Rockwell was born in New York in 1894</speak>')
                done();
            });
    });
    it('only finds the first artist', function(done) {
        var artistAgeIntentRequest = require('./ArtistAgeIntentRequest.json');
        artistAgeIntentRequest.request.intent.slots.ARTIST.value = 'Artist'
        chai.request(server)
            .post('/alexa/artsy')
            .send(artistAgeIntentRequest)
            .end(function(err, res) {
                expect(res.status).to.equal(200);
                var data = JSON.parse(res.text);
                expect(data.response.outputSpeech.type).to.equal('SSML')
                expect(data.response.outputSpeech.ssml).to.equal("<speak>Sorry, I couldn't find an artist named Artist.</speak>")
                done();
            });
    });
});
