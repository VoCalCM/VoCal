Meteor.startup(function() {
  if(Events.find().count() === 0) {
    var events = [
      {
        'name': 'event 1'
      },
      {
        'name': 'event 2'
      }
    ];
    events.forEach(function(event) {
      Events.insert(event);
    });
  }
});