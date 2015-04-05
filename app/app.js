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
	var chair = $cookieStore.get('meetingid') || '';;
	var name = $cookieStore.get('name') || '';
	return {
		name : function(n) {
			if (typeof n !== "undefined" && typeof n.length !== "undefined") {
				name = n;
				$cookieStore.put('name',n);
			}
			return name;
		},
		chair : function(meetingid) {
			if (typeof meetingid !== "undefined") {
				chair = meetingid;
				$cookieStore.put('meetingid',meetingid);
			}
			return chair;
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
.controller('homeCtrl', function ($scope, $location, $routeParams, meetingService, meService) {
	// $scope.meetingId = randomString(10);

	if ($location.path().length < 2) {
		var id = randomString(10);
		meService.chair(id);
		$location.path('/'+id);
	}
})
.controller('meetingCtrl', function ($scope, $routeParams, meetingService, meService) {
	$scope.meetingId = $routeParams.meetingId;
	$scope.qrUrl = encodeURIComponent(window.location);
	$scope.hasAttended = false;
	$scope.pending = false;
	
	console.log($routeParams.meetingId);

	// bind to firebase meeting array
	$scope.attendance = meetingService.get($scope.meetingId);

	$scope.chair = meService.chair() == $scope.meetingId;

	$scope.attend = function () {

		$scope.pending = true;
		// $scope.$apply();

		meetingService.attend(meService.name(), function(){
			$scope.hasAttended = true;
		});
	};

	$scope.statusToggle = function (person) {
		if (!$scope.chair) {
			return;
		}
		person.status = person.status == 'ontime' ? 'late' : 'ontime';
		meetingService.save(person);
	};

	var tickets = {
		chair : 0,
		ontime: 1,
		late  : 4
	}
	$scope.nextChair = function () {
		if (!$scope.chair) {
			return;
		}

		var people = [];

		angular.forEach($scope.attendance, function(person, key) {
			console.log(tickets[person.status] + ' tickets for ' + person.name)
			for (var i = 0; i < tickets[person.status]||0; i++) {
				people.push(person);
			}
		});

		var person = people[getRandomInt(0,people.length)];

		person.status = 'chair';
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

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}