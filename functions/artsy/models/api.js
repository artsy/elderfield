var xapp = require('./xapp')
var traverson = require('traverson');
var JsonHalAdapter = require('traverson-hal');
traverson.registerMediaType(JsonHalAdapter.mediaType, JsonHalAdapter);
var Q = require('q');

function Api(xappToken) {
  this.xappToken = xappToken;
  this.api = traverson.from('https://api.artsy.net/api').jsonHal();
}

Api.instance = function() {
  var deferred = Q.defer();
  xapp.token().then(function(token) {
    deferred.resolve(new Api(token));
  }).fail(function(error) {
    deferred.reject(error);
  });
  return deferred.promise;
}

Api.prototype.newRequest = function() {
  return this.api.newRequest()
    .withRequestOptions({
        headers: {
            'X-Xapp-Token': this.xappToken,
            'Accept': 'application/vnd.artsy-v2+json'
        }
    });
}

Api.prototype.follow = function(url, params) {
  var deferred = Q.defer();
  var request = this.newRequest().follow(url)
  if (params) request = request.withTemplateParameters(params);
  request.getResource(function(error, results) {
    if (error) {
      deferred.reject(error);
    } else {
      deferred.resolve(results);
    }
  });
  return deferred.promise;
}

Api.prototype.from = function(url, params) {
  var deferred = Q.defer();
  var request = this.newRequest().from(url)
  if (params) request = request.withTemplateParameters(params);
  request.getResource(function(error, results) {
    if (error) {
      deferred.reject(error);
    } else {
      deferred.resolve(results);
    }
  });
  return deferred.promise;
}

Api.prototype.search = function(q) {
  return this.follow("search", { q: q });
}

module.exports = Api;
