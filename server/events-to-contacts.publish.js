'use strict'

Meteor.publish('eventsToContacts', function(options, searchString) {
  var where = {
    'name': {
      '$regex': '.*' + (searchString || '') + '.*',
      '$options': 'i'
    }
  };
  Counts.publish(this, 'numberOfEventsToContacts', EventsToContacts.find(where), {noReady: true});
  return EventsToContacts.find(where, options);
});
