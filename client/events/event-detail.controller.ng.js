'use strict'

angular.module('vocalApp')
.controller('EventDetailCtrl', function($scope, $stateParams, $filter, currentUser) {
  $scope.currentUser = currentUser;
  $scope.selectedContacts = [];
  $scope.helpers({
    event () {
      return Events.findOne({ _id: $stateParams.eventId });
    }
  });

  $scope.helpers({
    eventsToContacts: () => EventsToContacts.find({ eventId: $stateParams.eventId })
  });

  $scope.subscribe('events', () => [], {
    onReady: function () {
      //Collection ready
    }
  });

  $scope.subscribe('eventsToContacts', () => [], {
    onReady: function () {
      //Collection ready
    }
  });

  $scope.eventsToContactsReady = false;
  $scope.$watchCollection('eventsToContacts', function(newVal, oldVal) {
    if($scope.eventsToContacts){
      $scope.eventsToContactsReady = true;
      $scope.eventsToContactsReady && $scope.contactsReady ? $scope.fillContacts() : null;
    }
  });

  $scope.contactsReady = false;
  $scope.$watchCollection('contacts', function(newVal, oldVal) {
    if($scope.contacts){
      $scope.contactsReady = true;
      $scope.eventsToContactsReady && $scope.contactsReady ? $scope.fillContacts() : null;
    }
  });

  $scope.fillContacts = function(){
    $scope.selectedContacts = [];
    $scope.eventsToContacts.forEach(function(eventToContact) {
      $scope.contacts.forEach(function(contact) {
        if (eventToContact.contactId === contact._id) {
          $scope.selectedContacts.push(contact);
        }
      })
    });
  };

  $scope.$watch('event', function() {
    if($scope.event){
      !$scope.event.contacts ? $scope.event.contacts = [] : null;
      !$scope.event.startDate ? $scope.event.startDate = new Date() : null;
      $scope.startHour = moment($scope.event.startDate).get('hour');
      $scope.startMinute = moment($scope.event.startDate).get('minute');
      !$scope.event.endDate ? $scope.event.endDate = new Date() : null;
      $scope.endHour = moment($scope.event.endDate).get('hour');
      $scope.endMinute = moment($scope.event.endDate).get('minute');
    }
  });

  $scope.querySearch = function(query) {
    var contactData = $scope.contacts;
    return contactData.filter(function(el) {
      return el.name.toLowerCase().indexOf(query.toLowerCase()) != -1;
    });
  };

  $scope.helpers({
    contacts: function() {
      return Contacts.find({});
    },
    contactsCount: function() {
      return Counts.get('numberOfContacts');
    }
  });

  $scope.subscribe('contacts');



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
          console.log(error);
        } else {
          console.log('Done!');
        }
      });

      $scope.selectedContacts.forEach(function(contact) {
        EventsToContacts.insert({
          contactId: contact._id,
          eventId: $stateParams.eventId
        });
      });
    }
  };

  $scope.reset = function() {
    $scope.event.reset();
  };
});
