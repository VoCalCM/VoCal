'use strict'

Meteor.publish('events', function(options, searchString) {
  var where = {
    'subject': {
      '$regex': '.*' + (searchString || '') + '.*',
      '$options': 'i'
    }
  };
  Counts.publish(this, 'numberOfEvents', Events.find(where), {noReady: true});
  return Events.find(where, options);
});


Meteor.method("get-events-date", function (startDate, endDate) {
  return moment(endDate).format("dddd, MMMM Do YYYY, h:mm:ss a");
  // return Events.find({
  //   startDate:{
  //   '$gte': startDate,
  //   '$lt': endDate
  //   }
  // });
  return startDate instanceof Date;
}, {
  url: "/api/events",
  getArgsFromRequest: function (request) {
    if(request.query.date){
      var startDate = moment(request.query.date).toDate();
      var endDate = moment(request.query.date).set({'hour': 23, 'minute': 59}).toDate();
    }else{
      //If two dates are provided
    }
    return [ startDate, endDate ];
  },
  httpMethod:"get"
})
