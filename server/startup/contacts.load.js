Meteor.startup(function() {
  if(Contacts.find().count() === 0) {
    var contacts = [
      {
        'name': 'contact 1'
      },
      {
        'name': 'contact 2'
      }
    ];
    contacts.forEach(function(contact) {
      Contacts.insert(contact);
    });
  }
});