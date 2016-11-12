var chai = require('chai');
var expect = chai.expect;
var chaiHttp = require('chai-http');
var server = require('../server');

chai.use(chaiHttp);

describe('alexa-app-server', function() {
  it('should respond as Artsy Alexa', function(done) {
    chai.request(server)
      .get('/')
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.equal("Artsy Alexa\n");
        done();
      });
  });
});
