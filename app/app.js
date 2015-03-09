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

.factory('IdentityService', function ($cookieStore){
	return {
    get : function() {
        return $cookieStore.get('user') || '';
    },
    set : function(u) {
        $cookieStore.put('user',u);
    }
  }
})
.controller('homeCtrl', function ($scope, $routeParams) {
	$scope.user = {
		id: '',
		name: '',
		ref: {
			$value: ''
		}
	};
	$scope.meeting = {
		id: $routeParams.meetingId,
		attendance: []
	};
})
.controller('credentialCtrl', function ($scope, $cookieStore) {
	// $scope.user.id = $cookieStore.get('user').id;
	// $scope.user.name = $cookieStore.get('user').name;
	// $scope.user.ref = $cookieStore.get('user').ref;

	var cookie = angular.fromJson($cookieStore.get('user'))
	$scope.user.name = cookie.name;

	$scope.setUser = function () {
		$cookieStore.put('user', angular.toJson($scope.user) );
	}
})
.controller('chairCtrl', function ($scope, $location) {

	$scope.newMeeting = function () {
		$scope.meeting.id = randomString(5);
		// var sync = $firebase(new Firebase(chairFirebaseUrl));

		// Create a meeting
		// var ref = new Firebase(chairFirebaseUrls.meetings);
		// $firebase(new Firebase(chairFirebaseUrls.meetings)).$push({}).then(function(ref){
		// 	$scope.meeting.id = ref.key();
		// 	// $location.path($location.path()+'/'+$scope.meetingId );
		// });
	}
	$scope.newMeeting();

})
.controller('meetingCtrl', function ($scope, $routeParams, $firebaseObject, $firebaseArray, $cookieStore, IdentityService) {
	$scope.meeting.id = $routeParams.meetingId;
	$scope.currentUrl = encodeURIComponent(window.location);
	
	console.log($routeParams.meetingId);

	var meetingUrl = chairFirebaseUrls.meetings + '/' + $routeParams.meetingId;
	var meetingRef = new Firebase(meetingUrl);
	$scope.attendance = $firebaseArray(meetingRef);
	
	// $scope.attendance = $firebase(new Firebase(chairFirebaseUrls.meetings)
	// 	.child($routeParams.meetingId))
	// 	.$asArray();

	$scope.me;
	$scope.attend = function() {

		// console.log($scope.me);

		// if (!$scope.me) {

			// Add me to the meeting
			$scope.attendance.$add($scope.user).then(function(ref) {

				console.log(ref);

				// Save the reference
				$scope.me = ref;
				// $scope.user.id = ref.key();

				var userUrl = meetingUrl + '/' + ref.key();
				var userRef = new Firebase(userUrl);
				var obj = $firebaseObject(userRef);
				obj.$bindTo($scope, "user").then(function(ref) {
					console.log(ref);
				  // console.log($scope.data); // { foo: "bar" }
				  // $scope.data.foo = "baz";  // will be saved to Firebase
				  // ref.set({ foo: "baz" });  // this would update Firebase and $scope.data
				});
			});
		// }
	};
	// $scope.attend = function() {
	// 	if (!$scope.me)
	// 		$scope.attendance.$add($scope.user.name).then(function(ref) {
	// 			$scope.me = ref;
	// 			$scope.user.id = ref.key();
	// 			// $scope.setUser();
	// 		});
	// }
})
.controller('roomCtrl', function ($scope, $routeParams, $firebase, $cookieStore, IdentityService) {
	$scope.meeting.id = $routeParams.meetingId;
	$scope.currentUrl = encodeURIComponent(window.location);

	$scope.attendance = $firebase(new Firebase(chairFirebaseUrls.meetings).child($routeParams.meetingId))
	.$asArray();
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
      when('/:meetingId', {
        templateUrl: 'partials/meeting.html',
        controller: 'meetingCtrl'
      }).
      when('/meeting/:meetingId', {
        templateUrl: 'partials/meeting.html',
        controller: 'meetingCtrl'
      }).
      when('/meeting/:meetingId/room', {
        templateUrl: 'partials/room.html',
        controller: 'roomCtrl'
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