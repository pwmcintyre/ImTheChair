'use strict';

var chairFirebaseUrl = 'https://chair.firebaseio.com/';
var fireRef = new Firebase(chairFirebaseUrl)

angular.module('chairApp', ['ngRoute','firebase'])
.controller('homeCtrl', function ($scope) {

})
.controller('chairCtrl', function ($scope) {
	// $scope.randomMeetingId = randomString(5);
	new Firebase(chairFirebaseUrl).push({
		time: (new Date().getTime()),
		attendance: true
	}).then(function(newChildRef) {
		$scope.randomMeetingId = newChildRef.key();
	  console.log("added record with id " + newChildRef.key());
	});;

})
.controller('meetingCtrl', function ($scope, $routeParams, $firebase) {
	$scope.meetingId = $routeParams.meetingId;
	$scope.currentUrl = encodeURIComponent(window.location);

	$scope.me = {
		name: '',
		id: null
	}

	var meeetingFireRef = new Firebase(chairFirebaseUrl).child($scope.meetingId);

	// create an AngularFire reference to the data
	var sync = $firebase(meeetingFireRef);

	// download the data into a local object
	// var syncObject = sync.$asObject();
	// syncObject.$bindTo($scope, "data");

	var meeetingFireRef = sync.$asObject();
	$scope.meeting = meeetingFireRef;

	$scope.attend = function (){

		console.log(meeetingFireRef);
		console.log(meeetingFireRef.attendance);
		console.log(sync);
		console.log(sync.attendance);
		console.log(sync.child('attendance'));
		// console.log(meeetingFireRef.child('attendance'));

		sync.attendance.$push({
			name: $scope.me.name,
			time: (new Date().getTime())
		}).then(function(newChildRef) {
			$scope.me.id = newChildRef.key();
		  console.log("added record with id " + newChildRef.key());
		});
	};

})
.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'partials/home.html',
        controller: 'homeCtrl'
      }).
      when('/chair', {
        templateUrl: 'partials/chair.html',
        controller: 'chairCtrl'
      }).
      when('/meeting/:meetingId', {
        templateUrl: 'partials/meeting.html',
        controller: 'meetingCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);


function randomString(length) {
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
  // var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for(var i=0; i < length; i++)
	text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}