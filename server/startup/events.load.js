Meteor.startup(function() {
  if(Events.find().count() === 0) {
    var events = [
      {
        'subject': 'event 1'
      },
      {
        'subject': 'event 2'
      }
    ];
    events.forEach(function(event) {
      Events.insert(event);
    });
  }
});
