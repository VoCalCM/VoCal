'use strict';

angular.module('vocalApp')
.controller('ContactsListCtrl', function($scope, currentUser) {
  console.log(currentUser);
  $scope.page = 1;
  $scope.perPage = 3;
  $scope.sort = {name_sort : 1};
  $scope.orderProperty = '1';

  $scope.helpers({
    contacts: function() {
      return Contacts.find({}, {
        sort: $scope.getReactively('sort')
      });
    },
    contactsCount: function() {
      return Counts.get('numberOfContacts');
    }
  });

  $scope.subscribe('contacts', function() {
    return [{
      sort: $scope.getReactively('sort'),
      limit: parseInt($scope.getReactively('perPage')),
      skip: ((parseInt($scope.getReactively('page'))) - 1) * (parseInt($scope.getReactively('perPage')))
    }, $scope.getReactively('search')];
  });

  $scope.save = function() {
    if ($scope.form.$valid) {
      $scope.newContact.createdAt = new Date();
      $scope.newContact.updatedAt = new Date();
      $scope.newContact.userId = currentUser._id;
      Contacts.insert($scope.newContact);
      $scope.newContact = undefined;
    }
  };

  $scope.remove = function(contact) {
    Contacts.remove({_id:contact.id});
  };

  $scope.pageChanged = function(newPage) {
    $scope.page = newPage;
  };

  $scope.getImageInfo = function() {
    console.log($scope);
  };

  return $scope.$watch('orderProperty', function() {
    if ($scope.orderProperty) {
      $scope.sort = {
        name_sort: parseInt($scope.orderProperty)
      };
    }
  });
});
