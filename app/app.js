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
.factory("Auth", ["$firebaseAuth", function($firebaseAuth) {
	var ref = new Firebase(chairFirebaseUrls.auth);
	return $firebaseAuth(ref);
}])
.factory('IdentityService', function ($cookieStore, $firebase) {
	
	var id = $cookieStore.get('id') || null;
	if (!id) {
		$firebase(new Firebase(chairFirebaseUrls.people)).$push({name:''}).then(function(ref){
			$cookieStore.put('id',ref.key());
		})
	}

	var sync = $firebase(new Firebase(chairFirebaseUrls.people).child(id));
	return sync.$asObject();
})
.controller('credentialCtrl', function ($scope, IdentityService) {
	IdentityService.$bindTo($scope, "me");
})
.controller('homeCtrl', function ($scope, $firebase) {
	// $firebase(new Firebase(chairFirebaseUrls.people))
	// .$push({name: 'unknown'})
	// .then(function(ref){
	// 	// TODO: save ref into cookie
	// 	myId = ref.key();
	// 	$cookieStore.put(myId,null);
	// });
})
.controller('chairCtrl', function ($scope, $firebase, IdentityService) {
	// $scope.meetingId = randomString(5);
	var sync = $firebase(new Firebase(chairFirebaseUrl));

	// Create a meeting
	$firebase(new Firebase(chairFirebaseUrls.meetings)).$push({}).then(function(ref){
		$scope.meetingId = ref.key();

		// save some meta data
		// $firebase(new Firebase(chairFirebaseUrls.meta)).$push({
		// 	time:(new Date().getTime()),
		// 	chair: IdentityService.get() || 'unknownchair'
		// }).then(function(ref){
			
		// });
	});

	// sync.$push({
	// 	time: (new Date().getTime()),
	// 	attendance: []
	// }).then(function(newChildRef) {
	// 	$scope.meetingId = newChildRef.key();
	// 	console.log("added record with id " + newChildRef.key());
	// });;

})
.controller('meetingCtrl', function ($scope, $routeParams, $firebase, IdentityService) {
	$scope.meetingId = $routeParams.meetingId;
	$scope.currentUrl = encodeURIComponent(window.location);

	$scope.attendance = $firebase(new Firebase(chairFirebaseUrls.meetings).child($scope.meetingId))
	.$asArray();

	$scope.me = IdentityService;
	$scope.me.$loaded( function (data){
		$firebase(new Firebase(chairFirebaseUrls.meetings).child($scope.meetingId).child(data.$id)).$set({name:data.name});
		// $scope.attendance.$add(data);
		
	});


	$scope.attend = function (){

		$firebase(new Firebase(chairFirebaseUrls.meetings).child($scope.meetingId).child(myId))
		.$set({
			name: $scope.me.name,
			time: (new Date().getTime())
		})
		.then(function(ref){
			// TODO: save ref into cookie
			// myId = ref.key();
		});

		// sync.attendance.$push({
		// 	name: $scope.me.name,
		// 	time: (new Date().getTime())
		// }).then(function(newChildRef) {
		// 	$scope.me.id = newChildRef.key();
		//   console.log("added record with id " + newChildRef.key());
		// });
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