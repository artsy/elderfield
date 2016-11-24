require('../../setup');

describe('stop', function() {
    it('should respond', function(done) {
        chai.request(server)
            .post('/alexa/artsy')
            .send(require('./StopIntentRequest.json'))
            .end(function(err, res) {
                expect(res.status).to.equal(200);
                var data = JSON.parse(res.text);
                expect(data.response.outputSpeech.type).to.equal('SSML')
                expect(data.response.outputSpeech.ssml).to.equal("<speak>Find out more at artsy.net. Goodbye.</speak>");
                done();
            });
    });
});
