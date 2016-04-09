'use strict'

angular.module('vocalApp')
.config(function($stateProvider) {
  $stateProvider
  .state('events-list', {
    url: '/events',
    templateUrl: 'client/events/events-list.view.ng.html',
    controller: 'EventsListCtrl',
    resolve: {
      currentUser: ['$meteor', function($meteor) {
        return $meteor.requireUser();
      }]
    }
  })
  .state('event-detail', {
    url: '/events/:eventId',
    templateUrl: 'client/events/event-detail.view.ng.html',
    controller: 'EventDetailCtrl',
    resolve: {
      currentUser: ['$meteor', function($meteor) {
        return $meteor.requireUser();
      }]
    }
  });
});