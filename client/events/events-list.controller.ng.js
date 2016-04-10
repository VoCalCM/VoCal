'use strict'

angular.module('vocalApp')
.controller('EventsListCtrl', function($scope, currentUser) {
  $scope.page = 1;
  $scope.perPage = 3;
  $scope.sort = {name_sort : 1};
  $scope.orderProperty = '1';

  $scope.helpers({
    events: function() {
      return Events.find({}, {
        sort: $scope.getReactively('sort')
      });
    },
    eventsCount: function() {
      return Counts.get('numberOfEvents');
    }
  });

  $scope.subscribe('events', function() {
    return [{
      sort: $scope.getReactively('sort'),
      limit: parseInt($scope.getReactively('perPage')),
      skip: ((parseInt($scope.getReactively('page'))) - 1) * (parseInt($scope.getReactively('perPage')))
    }, $scope.getReactively('search')];
  });


  $scope.save = function() {
    if ($scope.form.$valid) {
      $scope.newEvent.userId = currentUser._id;
      Events.insert($scope.newEvent);
      $scope.newEvent = undefined;
    }
  };

  $scope.remove = function(event) {
    Events.remove({_id:event._id});
  };

  $scope.pageChanged = function(newPage) {
    $scope.page = newPage;
  };

  return $scope.$watch('orderProperty', function() {
    if ($scope.orderProperty) {
      $scope.sort = {
        name_sort: parseInt($scope.orderProperty)
      };
    }
  });
});
