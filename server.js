var config = require('./.env.json')

for (var key in config) {
  process.env[key] = config[key]
}

var AlexaAppServer = require('alexa-app-server');

AlexaAppServer.start({
    port: 8080,
    app_dir: "functions",
    post: function(server) {
      module.exports = server.express;
    }
});
