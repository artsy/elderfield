require('../../setup');

describe('help', function() {
    it('should respond', function(done) {
        chai.request(server)
            .post('/alexa/artsy')
            .send(require('./fixtures/HelpIntentRequest.json'))
            .end(function(err, res) {
                expect(res.status).to.equal(200);
                var data = JSON.parse(res.text);
                expect(data.response.outputSpeech.type).to.equal('SSML')
                // when users ask for help within the skill, it must return a prompt which instructs users how to navigate the skill’s core functionality
                expect(data.response.outputSpeech.ssml).to.startWith("<speak>If you don't know Artsy, ask Artsy about Artsy. You can then ask Artsy about an artist. For example say ask Artsy about Norman Rockwell.");
                // the help prompt must leave the session open to receive a response
                expect(data.response.shouldEndSession).to.equal(false);
                // the help prompt must end with a question for users or prompt the user to speak
                expect(data.response.outputSpeech.ssml).to.endWith("What artist would you like to hear about?</speak>");
                done();
            });
    });
});
