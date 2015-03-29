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

	return {
		get : function(m) {
			meetingId = m || randomString(10);
			var meetingUrl = chairFirebaseUrls.meetings + '/' + meetingId;
			meetingRef = new Firebase(meetingUrl);

			return $firebaseArray(meetingRef);
		},
		attend : function(name, then) {
			meetingRef.$add({
				name: name,
				status: 'ontime'
			}).then(then);
		},
		setStatus : function(id, status) {

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
.controller('meetingCtrl', function ($scope, $routeParams, meetingService) {
	$scope.meetingId = $routeParams.meetingId;
	$scope.currentUrl = encodeURIComponent(window.location);
	
	console.log($routeParams.meetingId);

	$scope.attendance = meetingService.get($scope.meetingId);
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