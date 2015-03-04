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
        return $cookieStore.get('name') || '';
    },
    set : function(n) {
        $cookieStore.put('name',n);
    }
  }
})
.controller('homeCtrl', function ($scope) {
	$scope.user;
	$scope.meetingId;
})
.controller('credentialCtrl', function ($scope, $cookieStore) {
	$scope.user = {
	  name: function(newName) {
	    if (angular.isDefined(newName)) {
	      $cookieStore.put('name',n);
	    }
	    return $cookieStore.get('name') || '';
	  }
	};
})
.controller('chairCtrl', function ($scope, $firebase, $location) {

	$scope.newMeeting = function () {
		// $scope.meetingId = randomString(5);
		var sync = $firebase(new Firebase(chairFirebaseUrl));

		// Create a meeting
		$firebase(new Firebase(chairFirebaseUrls.meetings)).$push({}).then(function(ref){
			$scope.meetingId = ref.key();
			$location.path($location.path()+'/'+$scope.meetingId );
		});
	}
	
})
.controller('meetingCtrl', function ($scope, $routeParams, $firebase, $cookieStore, IdentityService) {
	$scope.meetingId = $routeParams.meetingId;
	$scope.currentUrl = encodeURIComponent(window.location);

	$scope.attendance = $firebase(new Firebase(chairFirebaseUrls.meetings).child($routeParams.meetingId))
	.$asArray();

	$scope.attendance.$add($scope.user);
	$cookieStore.put('name',$scope.user);

})
.controller('roomCtrl', function ($scope, $routeParams, $firebase, $cookieStore, IdentityService) {
	$scope.meetingId = $routeParams.meetingId;
	$scope.currentUrl = encodeURIComponent(window.location);

	$scope.attendance = $firebase(new Firebase(chairFirebaseUrls.meetings).child($routeParams.meetingId))
	.$asArray();

	$scope.attendance.$add($scope.user);
	$cookieStore.put('name',$scope.user);

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