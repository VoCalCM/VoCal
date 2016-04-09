EventsToContacts = new Mongo.Collection('eventsToContacts');

EventsToContacts.allow({
  insert: function(userId, eventsToContact) {
    return userId;
  },
  update: function(userId, eventsToContact, fields, modifier) {
    return userId;
  },
  remove: function(userId, eventsToContact) {
    return userId;
  }
});