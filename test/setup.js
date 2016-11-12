chai = require('chai');
expect = chai.expect;
chaiHttp = require('chai-http');
server = require('../server');

chai.use(chaiHttp);
