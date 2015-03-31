'use strict';

var chairFirebaseUrl = 'https://chair.firebaseio.com/';
var chairFirebaseUrls = {
	base: chairFirebaseUrl,
	auth: chairFirebaseUrl+'/auth',
	people: chairFirebaseUrl+'/people',
	meetings: chairFirebaseUrl+'/meetings',
	meta: chairFirebaseUrl+'/meta'
}
var fireRef = new Firebase(chairFirebaseUrl);

var myId = null;

angular.module('chairApp', ['ngRoute','firebase','ngCookies'])

.factory('meService', function ($cookieStore){
	var name = $cookieStore.get('name') || 'noname';
	return {
		name : function(n) {
			if (n) {
				name = n;
				$cookieStore.put('name',n);
			}
			return name;
		}
	}
})
.factory('meetingService', function ($firebaseObject, $firebaseArray){

	var meetingId = null;
	var meetingRef = null;
	var meetingArray = null;

	return {
		get : function(m) {
			meetingId = m || randomString(10);
			var meetingUrl = chairFirebaseUrls.meetings + '/' + meetingId;
			meetingRef = new Firebase(meetingUrl);
			meetingArray = $firebaseArray(meetingRef);
			return meetingArray;
		},
		attend : function(name, then) {
			meetingArray.$add({
				name: name,
				status: 'ontime'
			}).then(then);
		},
		setStatus : function(id, status, then) {

			meetingArray.$save(id).then(then);
		},
		save : function(person, then) {
			meetingArray.$save(person).then(then);
		}
	}
})
.controller('meCtrl', function ($scope, meService) {
	$scope.me = meService;
})
.directive('me', function() {
  return {
    templateUrl: 'partials/me.html'
  };
})
.controller('homeCtrl', function ($scope, meetingService) {
	$scope.meetingId = randomString(10);
})
.controller('meetingCtrl', function ($scope, $routeParams, meetingService, meService) {
	$scope.meetingId = $routeParams.meetingId;
	$scope.qrUrl = encodeURIComponent(window.location);
	$scope.hasAttended = false;
	$scope.pending = false;
	
	console.log($routeParams.meetingId);

	// bind to firebase meeting array
	$scope.attendance = meetingService.get($scope.meetingId);

	$scope.attend = function () {

		$scope.pending = true;
		// $scope.$apply();

		meetingService.attend(meService.name(), function(){
			$scope.hasAttended = true;
		});
	};

	$scope.statusToggle = function (person) {
		person.status = person.status == 'ontime' ? 'late' : 'ontime';
		meetingService.save(person);
	};
})
.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.
			when('/', {
				templateUrl: 'partials/home.html',
				controller: 'homeCtrl'
			}).
			when('/:meetingId', {
				templateUrl: 'partials/meeting.html',
				controller: 'meetingCtrl'
			}).
			otherwise({
				redirectTo: '/'
			});
	}]);


function randomString(length) {
	length = length || 10;

	var text = "";
	var possible = "abcdefghijklmnopqrstuvwxyz";
	// var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
	// var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for(var i=0; i < length; i++)
	text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}