require('../../setup');

describe('artsy alexa', function() {
    artistBornIntentRequest = function(artistName, cb) {
        var artistBornIntentRequest = require('./ArtistBornIntentRequest.json');
        artistBornIntentRequest.request.intent.slots.ARTIST.value = artistName;
        chai.request(server)
            .post('/alexa/artsy')
            .send(artistBornIntentRequest)
            .end(function(err, res) {
                expect(res.status).to.equal(200);
                var data = JSON.parse(res.text);
                expect(data.response.outputSpeech.type).to.equal('SSML')
                cb(data.response.outputSpeech.ssml);
            });
    }

    it('speaks the year an artist was born', function(done) {
        artistBornIntentRequest('Andy Warhol', function(ssml) {
            expect(ssml).to.equal('<speak>American artist Andy Warhol was born in Pittsburgh in 1928 and died in 1987</speak>');
            done();
        });
    });

    it('properly joins dates and places', function(done) {
        artistBornIntentRequest('Norman Rockwell', function(ssml) {
            expect(ssml).to.equal('<speak>American artist Norman Rockwell was born in New York in 1894 and died in  1978</speak>');
            done();
        });
    });

    it('supports artists without nationality', function(done) {
        artistBornIntentRequest('Oleg Vassiliev', function(ssml) {
            expect(ssml).to.equal('<speak>The artist Oleg Vassiliev was born in 1931 and died in 2013</speak>');
            done();
        });
    });

    it('only finds the first artist', function(done) {
        artistBornIntentRequest('@#%&*#$%', function(ssml) {
            expect(ssml).to.equal("<speak>Sorry, I couldn't find an artist named @#%&*#$%.</speak>");
            done();
        });

    });

    it('supports artists without dates', function(done) {
        artistBornIntentRequest('John Doe', function(ssml) {
            expect(ssml).to.equal("<speak>Sorry, I don't know much about the artist John Doe.</speak>");
            done();
        });
    });
});
