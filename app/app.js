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
	var me = {
		name : $cookieStore.get('name') || '',
		time : $cookieStore.get('time') || null
	}

	var sync = function () {
		if (id) {
			var sync = $firebase(new Firebase(chairFirebaseUrls.people).child(id));
			var temp = sync.$asObject();

			if (!temp.time || me.time > temp.time) {
				temp.name = me.name;
				temp.time = me.time;
				temp.$save();
				me = temp;
			} else {
				me = temp;
			}
		} else {
			$firebase(new Firebase(chairFirebaseUrls.people))
			.$push(me).then( function (ref) {
				id = ref.key();
				$cookieStore.put('id',id);
			})
		}
		$cookieStore.put('name',me.name);
		$cookieStore.put('time',me.time);
	}
	sync();

	var functions = {
		get: function () {
			return me;
		},
		set: function (n) {
			console.log('persisting name');

			me.name = n;
			me.time = new Date().getTime();

			sync();
		},
		getId: function () { return id }
	}
	return functions;
})
.controller('credentialCtrl', function ($scope, IdentityService) {
	$scope.me = IdentityService.get();
	$scope.update = function(){
		IdentityService.set($scope.me.name);
	}
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
	// $scope.randomMeetingId = randomString(5);
	var sync = $firebase(new Firebase(chairFirebaseUrl));

	// Create a meeting
	$firebase(new Firebase(chairFirebaseUrls.meetings)).$push().then(function(ref){
		$scope.randomMeetingId = ref.key();

		// save some meta data
		$firebase(new Firebase(chairFirebaseUrls.meta)).$push({
			time:(new Date().getTime()),
			chair: IdentityService.get() || 'unknownchair'
		}).then(function(ref){
			
		});
	});

	// sync.$push({
	// 	time: (new Date().getTime()),
	// 	attendance: []
	// }).then(function(newChildRef) {
	// 	$scope.randomMeetingId = newChildRef.key();
	// 	console.log("added record with id " + newChildRef.key());
	// });;

})
.controller('meetingCtrl', function ($scope, $routeParams, $firebase, IdentityService) {
	$scope.meetingId = $routeParams.meetingId;
	$scope.currentUrl = encodeURIComponent(window.location);

	$firebase(new Firebase(chairFirebaseUrls.meetings).child($scope.meetingId))
	.$asObject()
	.$bindTo($scope, "attendance");

	$scope.push(IdentityService.getId());

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