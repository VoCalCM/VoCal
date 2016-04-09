'use strict'

angular.module('vocalApp')
.controller('EventDetailCtrl', function($scope, $stateParams, $filter, currentUser) {
  console.log(moment);
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
      $scope.startHour = Number($filter('date')($scope.event.startDate, "hh"));
      $scope.startMinute = Number($filter('date')($scope.event.startDate, "mm"));
    }
  });



  $scope.save = function() {
    if($scope.form.$valid) {
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
