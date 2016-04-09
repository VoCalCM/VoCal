Contacts = new Mongo.Collection('contacts');

Contacts.allow({
  insert: function(userId, contact) {
    return userId;
  },
  update: function(userId, contact, fields, modifier) {
    return userId;
  },
  remove: function(userId, contact) {
    return userId;
  }
});