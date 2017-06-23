'use strict';

app.controller("LoginCtrl", ["$scope", "$location", "$firebase", "$firebaseAuth", "$firebaseObject", "$firebaseArray",
    function($scope, $location, $firebase, $firebaseAuth, $firebaseObject, $firebaseArray)  {

  $scope.authObj = $firebaseAuth();



      $scope.signIn = function() {
      $scope.firebaseUser = null;
      $scope.error = null;
      $scope.authObj.$signInAnonymously().then(function(firebaseUser){

      }).catch(function(error) {
        $scope.error = error;
      });
    };
       $scope.signInWithFb = function() {
      $scope.firebaseUser = null;
      $scope.error = null;
              $('.fb-login').addClass('loading');

         $scope.authObj.$signInWithPopup("facebook").then(function(firebaseUser) {
          console.log("Signed in as:", firebaseUser.uid);
       //  $scope.setupGame(firebaseUser);
        }).catch(function(error) {
          $scope.error = error;
          console.log("Authentication failed:", error);
        });
      };

    $scope.authObj.$onAuthStateChanged(function(firebaseUser) {
     var authData = $scope.authObj.$getAuth();

          if (authData) {

          var ref = firebase.database().ref().child("users/" + firebaseUser.uid);
          var loggedInRef = firebase.database().ref().child("loggedIn/" + firebaseUser.uid);
         

        if (firebaseUser.displayName !== null && typeof firebaseUser.displayName !== 'undefined') {
            var displayName = firebaseUser.displayName.split(" ");

            ref.child('name').set(displayName[0]+' '+displayName[1].charAt(0));
            ref.child('uid').set(firebaseUser.uid);
            ref.child('dp').set(firebaseUser.photoURL);
          } else {
           if (!$scope.displayName){
            $scope.displayName = 'Anon';
           }

          if (ref === null || typeof ref === 'undefined' || ref.child('name').$value === null || typeof ref.child('name').$value === 'undefined'){
            ref.child('name').set($scope.displayName);
            ref.child('uid').set(firebaseUser.uid);
          }
        }


    $location.path('/game');
    } else {
    // User is signed out.
    // ...
     // audio.stop();

      $scope.firebaseUser = null;

      console.log("Signed out");

  }
    
    });
    }]);