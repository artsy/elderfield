var AlexaAppServer = require('alexa-app-server');

AlexaAppServer.start({
  port: 8080,
  app_dir: "functions",
  post: function(server) {
    module.exports = server.express;
  }
});
