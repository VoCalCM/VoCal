'use strict'

angular.module('vocalApp')
.config(function($stateProvider) {
  $stateProvider
  .state('contacts-list', {
    url: '/contacts',
    templateUrl: 'client/contacts/contacts-list.view.ng.html',
    controller: 'ContactsListCtrl',
    resolve: {
      currentUser: ['$meteor', function($meteor) {
        return $meteor.requireUser();
      }]
    }
  })
  .state('contact-detail', {
    url: '/contacts/:contactId',
    templateUrl: 'client/contacts/contact-detail.view.ng.html',
    controller: 'ContactDetailCtrl',
    resolve: {
      currentUser: ['$meteor', function($meteor) {
        return $meteor.requireUser();
      }]
    }
  });
});