require('../../setup');

describe('artsy alexa', function() {
    artistAgeIntentRequest = function(artistName, cb) {
        var artistAgeIntentRequest = require('./ArtistAgeIntentRequest.json');
        artistAgeIntentRequest.request.intent.slots.ARTIST.value = artistName;
        chai.request(server)
            .post('/alexa/artsy')
            .send(artistAgeIntentRequest)
            .end(function(err, res) {
                expect(res.status).to.equal(200);
                var data = JSON.parse(res.text);
                expect(data.response.outputSpeech.type).to.equal('SSML')
                cb(data.response.outputSpeech.ssml);
            });
    }

    it('speaks the year an artist was born', function(done) {
        artistAgeIntentRequest('Andy Warhol', function(ssml) {
            expect(ssml).to.equal('<speak>American artist Andy Warhol was born in Pittsburgh in 1928</speak>');
            done();
        });
    });

    it('properly joins dates and places', function(done) {
        artistAgeIntentRequest('Norman Rockwell', function(ssml) {
            expect(ssml).to.equal('<speak>American artist Norman Rockwell was born in New York in 1894</speak>');
            done();
        });
    });

    it('only finds the first artist', function(done) {
        artistAgeIntentRequest('Artist', function(ssml) {
            expect(ssml).to.equal("<speak>Sorry, I couldn't find an artist named Artist.</speak>");
            done();
        });

    });

    it('supports artists without dates', function(done) {
        artistAgeIntentRequest('John Doe', function(ssml) {
            expect(ssml).to.equal("<speak>Sorry, I don't know when or where artist John Doe was born.</speak>");
            done();
        });
    });
});
