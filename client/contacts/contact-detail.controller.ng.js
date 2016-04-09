'use strict'

angular.module('vocalApp')
.controller('ContactDetailCtrl', function($scope, $stateParams) {
  
  $scope.helpers({
    contact: function() {
      return Contacts.findOne({ _id: $stateParams.contactId }); 
    }
  });
  
  $scope.subscribe('contacts');
  
  $scope.save = function() {
    if($scope.form.$valid) {
      delete $scope.contact._id;
      Contacts.update({
        _id: $stateParams.contactId
      }, {
        $set: $scope.contact
      }, function(error) {
        if(error) {
          console.log('Unable to update the contact'); 
        } else {
          console.log('Done!');
        }
      });
    }
  };
        
  $scope.reset = function() {
    $scope.contact.reset();
  };
});