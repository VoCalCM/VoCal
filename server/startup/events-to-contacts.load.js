Meteor.startup(function() {
  if(EventsToContacts.find().count() === 0) {
    var eventsToContacts = [
      {
        'event': Events.findOne({})._id,
        'contacts': Contacts.findOne({})._id
      }
    ];
    eventsToContacts.forEach(function(eventsToContact) {
      EventsToContacts.insert(eventsToContact);
    });
  }
});
