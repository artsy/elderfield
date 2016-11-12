require('../../setup');

describe('artsy alexa', function() {
    it('should respond as Artsy Alexa', function(done) {
        chai.request(server)
            .post('/alexa/artsy')
            .send(require('./LaunchRequest.json'))
            .end(function(err, res) {
                expect(res.status).to.equal(200);
                var data = JSON.parse(res.text);
                expect(data.response.outputSpeech.type).to.equal('SSML')
                expect(data.response.outputSpeech.ssml).to.equal('<speak>Welcome to Artsy!</speak>')
                done();
            });
    });
});
