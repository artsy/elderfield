require('../../setup');

describe('help', function() {
    it('should respond', function(done) {
        chai.request(server)
            .post('/alexa/artsy')
            .send(require('./HelpIntentRequest.json'))
            .end(function(err, res) {
                expect(res.status).to.equal(200);
                var data = JSON.parse(res.text);
                expect(data.response.outputSpeech.type).to.equal('SSML')
                expect(data.response.outputSpeech.ssml).to.equal("<speak>If you don't know Artsy, ask Artsy about Artsy. You can then ask Artsy about an artist. For example say ask Artsy about Norman Rockwell. What artist would you like to hear about?</speak>");
                done();
            });
    });
});
