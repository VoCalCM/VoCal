'use strict';

angular.module('vocalApp')
.controller('ContactsListCtrl', function($scope, currentUser, fileUpload, $http) {
  console.log(currentUser);
  $scope.newContact = {};
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
    Contacts.remove({_id:contact._id});
  };

  $scope.pageChanged = function(newPage) {
    $scope.page = newPage;
  };

  $scope.getImageInfo = function() {
    console.log($scope);
  };

  $scope.imageOCR = function() {

  };

  $scope.uploadFile = function(){
    var file = $scope.myFile;
    console.log('file is ' );
    console.dir(file);
    var uploadUrl = "https://api.havenondemand.com/1/api/sync/ocrdocument/v1";
    var entityUrl = "https://api.havenondemand.com/1/api/sync/extractentities/v2";
    fileUpload.uploadFileToUrl(file, uploadUrl).then(function(response) {
      console.log(response.data.text_block[0].text);
      $scope.data = response.data.text_block[0].text;

      var fd = new FormData();
      fd.append('apikey', 'c4845053-cb15-4210-9b6f-6debd3c8f748');
      fd.append('text', $scope.data);
      fd.append('show_alternatives', false);
      fd.append('entity_type', 'person_fullname_eng');
      fd.append('entity_type', 'address_us');
      fd.append('entity_type', 'internet_email');
      fd.append('entity_type', 'number_phone_us');
      var promise = $http.post(entityUrl, fd, {
        transformRequest: angular.identity,
        headers: {'Content-Type': undefined}
      })
        .success(function(response){
          console.log('entity response', response);
          var entities = response.entities;
          entities.forEach(function(entity) {
            if (entity.type === 'person_fullname_eng') {
              $scope.newContact.name = entity.normalized_text;
            } else if (entity.type === 'address_us') {
              $scope.newContact.address = entity.normalized_text;
            } else if (entity.type === 'internet_email') {
              $scope.newContact.email = entity.normalized_text;
            } else if (entity.type === 'number_phone_us') {
              $scope.newContact.phone = entity.normalized_text;
            }
          });

        })
        .error(function(error){
        });
      return promise;
    });
  };

  return $scope.$watch('orderProperty', function() {
    if ($scope.orderProperty) {
      $scope.sort = {
        name_sort: parseInt($scope.orderProperty)
      };
    }
  });
});
