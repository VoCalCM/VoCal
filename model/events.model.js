Events = new Mongo.Collection('events');

Events.allow({
  insert: function(userId, event) {
    return userId;
  },
  update: function(userId, event, fields, modifier) {
    return userId;
  },
  remove: function(userId, event) {
    return userId;
  }
});
