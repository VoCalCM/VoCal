'use strict'

angular.module('vocalApp')
.controller('EventDetailCtrl', function($scope, $stateParams, $filter, currentUser) {
  $scope.currentUser = currentUser;
  $scope.helpers({
    event: function() {
      return Events.findOne({ _id: $stateParams.eventId });
    }
  });


  $scope.subscribe('events', () => [], {
    onReady: function () {
      //Collection ready
    }
  });

  $scope.$watch('event', function() {
    if($scope.event){
      !$scope.event.startDate ? $scope.event.startDate = new Date() : null;
      $scope.startHour = moment($scope.event.startDate).get('hour');
      $scope.startMinute = moment($scope.event.startDate).get('minute');
      !$scope.event.endDate ? $scope.event.endDate = new Date() : null;
      $scope.endHour = moment($scope.event.endDate).get('hour');
      $scope.endMinute = moment($scope.event.endDate).get('minute');
    }
  });



  $scope.save = function() {
    if($scope.form.$valid) {
      var startDate = moment($scope.event.startDate);
      startDate.set('hour', $scope.startHour);
      startDate.set('minute', $scope.startMinute);
      $scope.event.startDate = startDate.toDate();

      var endDate = moment($scope.event.endDate);
      endDate.set('hour', $scope.endHour);
      endDate.set('minute', $scope.endMinute);
      $scope.event.endDate = endDate.toDate();

      delete $scope.event._id;
      Events.update({
        _id: $stateParams.eventId
      }, {
        $set: $scope.event
      }, function(error) {
        if(error) {
          console.log('Unable to update the event');
        } else {
          console.log('Done!');
        }
      });
    }
  };

  $scope.reset = function() {
    $scope.event.reset();
  };
});
