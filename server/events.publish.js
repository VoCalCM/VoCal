'use strict'

Meteor.publish('events', function(options, searchString) {
  var where = {
    'subject': {
      '$regex': '.*' + (searchString || '') + '.*',
      '$options': 'i'
    }
  };
  Counts.publish(this, 'numberOfEvents', Events.find(where), {noReady: true});
  return Events.find(where, options);
});
