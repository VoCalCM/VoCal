'use strict'

Meteor.publish('contacts', function(options, searchString) {
  var where = {
    'name': {
      '$regex': '.*' + (searchString || '') + '.*',
      '$options': 'i'
    }
  };
  Counts.publish(this, 'numberOfContacts', Contacts.find(where), {noReady: true});
  return Contacts.find(where, options);
});
