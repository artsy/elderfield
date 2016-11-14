require('../../setup');

describe('artsy alexa', function() {
    whatIsArtsyIntentRequest = function(cb) {
        var whatIsArtsyIntentRequest = require('./WhatIsArtsyIntentRequest.json');
        chai.request(server)
            .post('/alexa/artsy')
            .send(whatIsArtsyIntentRequest)
            .end(function(err, res) {
                expect(res.status).to.equal(200);
                var data = JSON.parse(res.text);
                expect(data.response.outputSpeech.type).to.equal('SSML')
                cb(data.response.outputSpeech.ssml);
            });
    }

    it('tells us about Artsy', function(done) {
        whatIsArtsyIntentRequest(function(ssml) {
            expect(ssml).to.equal('<speak>Artsy’s mission is to make all the world’s art accessible to anyone with an Internet connection. We are a resource for art collecting and education. Find more at artsy.net.</speak>');
            done();
        });
    });
});
