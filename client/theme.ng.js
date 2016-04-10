'use strict'

angular.module('vocalApp')
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
  .primaryPalette('teal')
  .accentPalette('deep-purple');
});
