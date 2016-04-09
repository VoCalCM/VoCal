Meteor.startup(function() {
  if(EventsToContacts.find().count() === 0) {
    var eventsToContacts = [
      {
        'eventId': Events.findOne({})._id,
        'contactId': Contacts.findOne({})._id
      }
    ];
    eventsToContacts.forEach(function(eventsToContact) {
      EventsToContacts.insert(eventsToContact);
    });
  }
});
