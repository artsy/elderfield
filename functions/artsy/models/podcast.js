var Q = require('q');
var feedparser = require('feedparser-promised');
var _ = require('underscore');
_.mixin(require('underscore.string').exports());

function Podcast() {
  this.rssUrl = 'https://feeds.soundcloud.com/users/soundcloud:users:211089382/sounds.rss';
  this.parsed = feedparser.parse(this.rssUrl);
}

Podcast.instance = function() {
  return new Podcast();
}

Podcast.prototype.fetchItems = function() {
  var deferred = Q.defer();
  if (this.items) {
    deferred.resolve(this.items);
  } else {
    var deferred = Q.defer();
    this.parsed.then(function(items) {
      this.items = items;
      deferred.resolve(this.items);
    });
  }
  return deferred.promise;
}

Podcast.prototype.getEpisodeById = function(id) {
  var deferred = Q.defer();
  this.fetchItems().then(function(items) {
    var podcastTitlePrefix = `No. ${id}:`;
    var episode = _.find(items, function(item) {
      return _.startsWith(item.title, podcastTitlePrefix);
    });
    if (episode) {
      deferred.resolve(episode);
    } else {
      deferred.reject(`podcast ${id} not found`);
    }
  }).fail(function(error) {
    deferred.reject(error);
  });
  return deferred.promise;
}

Podcast.prototype.getLatestEpisode = function() {
  var deferred = Q.defer();
  this.fetchItems().then(function(items) {
    if (items.length > 0) {
      deferred.resolve(items[0]);
    } else {
      deferred.reject(`no podcast episodes found`);
    }
  }).fail(function(error) {
    deferred.reject(error);
  });
  return deferred.promise;
}

Podcast.prototype.getEpisodeStream = function(getEpisodeFunction) {
  var deferred = Q.defer();
  getEpisodeFunction.then(function(episode) {
    if (episode.enclosures) {
      var audioMpegEnclosure = _.findWhere(episode.enclosures, { type: 'audio/mpeg' });
      if (audioMpegEnclosure) {
        deferred.resolve(audioMpegEnclosure);
      } else {
        deferred.reject(`podcast ${episode.guid} audio stream not found`);
      }
    } else {
      deferred.reject(`podcast ${episode.guid} has no audio streams`);
    }
  }).fail(function(error) {
    deferred.reject(error);
  });
  return deferred.promise;
}

Podcast.prototype.getEpisodeStreamById = function(id) {
  return this.getEpisodeStream(this.getEpisodeById(id));
}

Podcast.prototype.getLatestEpisodeStream = function(id) {
  return this.getEpisodeStream(this.getLatestEpisode());
}

module.exports = Podcast;
