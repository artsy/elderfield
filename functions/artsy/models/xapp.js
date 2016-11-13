var superagent = require('superagent');
var Q = require('q');

module.exports = {
    token: function() {
        var deferred = Q.defer();
        superagent
            .post('https://api.artsy.net/api/tokens/xapp_token')
            .send({ client_id: process.env["ARTSY_CLIENT_ID"], client_secret: process.env["ARTSY_CLIENT_SECRET"] })
            .end(function(err, rc) {
                if (rc && rc.body.token) {
                    deferred.resolve(rc.body.token);
                } else {
                    deferred.reject(err || "Cannot connect to Artsy.");
                }
            });
        return deferred.promise;
    }
};
