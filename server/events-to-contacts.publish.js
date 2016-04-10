'use strict'

Meteor.publish('eventsToContacts', function(options, searchString) {
  Counts.publish(this, 'numberOfEventsToContacts', EventsToContacts.find({}), {noReady: true});
  return EventsToContacts.find({});
});
