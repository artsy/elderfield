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
                expect(data.response.outputSpeech.ssml).to.equal('<speak>Welcome to Artsy! Ask me about an artist.</speak>')
                expect(data.response.reprompt.outputSpeech.ssml).to.equal('<speak>Say help if you need help or exit any time to exit. What artist would you like to hear about?</speak>')
                done();
            });
    });
});
