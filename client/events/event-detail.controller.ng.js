'use strict'

angular.module('vocalApp')
.controller('EventDetailCtrl', function($scope, $stateParams) {
  
  $scope.helpers({
    event: function() {
      return Events.findOne({ _id: $stateParams.eventId }); 
    }
  });
  
  $scope.subscribe('events');
  
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