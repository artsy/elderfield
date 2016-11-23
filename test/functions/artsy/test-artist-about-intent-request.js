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
            expect(ssml).to.startWith('<speak>American artist Andy Warhol was born in Pittsburgh in 1928 and died in 1987. Obsessed with celebrity, ');
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

    it('speaks about website artsy', function(done) {
        aboutIntentRequest('website artsy', function(ssml) {
            expect(ssml).to.startWith('<speak>Artsy’s mission is ');
            done();
        });
    });

    it('properly joins dates and places', function(done) {
        aboutIntentRequest('Norman Rockwell', function(ssml) {
            expect(ssml).to.startWith('<speak>American artist Norman Rockwell was born in New York in 1894 and died in  1978');
            done();
        });
    });

    it('supports artists without nationality', function(done) {
        aboutIntentRequest('Oleg Vassiliev', function(ssml) {
            expect(ssml).to.startWith('<speak>The artist Oleg Vassiliev was born in 1931 and died in 2013');
            done();
        });
    });

    it('only finds the first artist', function(done) {
        aboutIntentRequest('@#%&*#$%', function(ssml) {
            expect(ssml).to.equal("<speak>Sorry, I couldn't find an artist @#%&*#$%.</speak>");
            done();
        });

    });

    it('supports artists without dates', function(done) {
        aboutIntentRequest('John Doe', function(ssml) {
            expect(ssml).to.equal("<speak>Sorry, I don't know much about John Doe.</speak>");
            done();
        });
    });
});
