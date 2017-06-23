'use strict';

app.controller("GameCtrl", ["$scope","$location", "$firebase", "$firebaseAuth", "$firebaseObject", "$firebaseArray",'soundcloud',
  function($scope,$location, $firebase, $firebaseAuth, $firebaseObject, $firebaseArray, soundcloud)  {

  //set up auth state
  $scope.authObj = $firebaseAuth();
  var connectedRef = firebase.database().ref().child(".info/connected");

  $scope.authObj.$onAuthStateChanged(function(firebaseUser) {
    var authData = $scope.authObj.$getAuth();
    // User is signed in.
    // ... 
    if (authData) {
      //set up refs for user and logged in
      var ref = firebase.database().ref().child("users/" + firebaseUser.uid);
      var loggedInRef = firebase.database().ref().child("loggedIn/" + firebaseUser.uid);
      var connectedRef = firebase.database().ref().child(".info/connected");
      //clear on disconnect
      loggedInRef.onDisconnect().remove();

      // synchronize the user object with three-way data binding
      var syncObject = $firebaseObject(ref);
      syncObject.$bindTo($scope, "data");

      $scope.firebaseUser = firebaseUser;

      $scope.userData = $firebaseObject(ref);

      var loggedInListRef = firebase.database().ref().child("loggedIn");
      var loggedInObject = $firebaseObject(loggedInListRef);
      loggedInObject.$bindTo($scope, "loggedIns");
      console.log(loggedInObject)

      connectedRef.on("value", function(snap) {

      if (snap.val() === true) {
        syncObject.$loaded().then(function () {
          console.log($scope.userData.name);
          loggedInRef.child('name').set(syncObject.name);
          loggedInRef.child('uid').set(syncObject.uid);
          loggedInRef.child('score').set(score);
        });

        console.log("connected");
        pointerLock();
        console.log("Signed in as:", firebaseUser.uid);

        } else {
        console.log("not connected");

        }
      });


      $scope.signOut = function() {
        //remove the loggedin object
        var obj = $firebaseObject(loggedInRef);
        console.log(obj)
        obj.$remove().then(function(loggedInRef) {

        //stop audio
        context.close();

        //reset the game state
        gem = [];
        blocks = [];
        bouncy = [];
        supergem = [];
        movingSupergem = [];

        //remove the user data & deauthenticate
        $scope.authData = null;
        $scope.firebaseUser = null;
        $scope.authObj.$signOut();
       
        // Turn off any Firebase event listeners
        connectedRef.off();
         });
      };

      //set up all the threejs things
      init();
      //start the render
      animate();
      //play the songs
      playTrack();
 
  } else {
    // User is signed out.
    // ...
    //remove user and redirect to login
    $scope.firebaseUser = null;
    $location.path('/login');
    console.log("Signed out");

  }

    
});


/* Sets up the current game (making a new one if needed) */
  $scope.data = [];  

  var usersRef = firebase.database().ref().child("users");

  var query = usersRef.orderByChild("score").limitToLast(10);

  $scope.users = $firebaseArray(query);

$scope.setScore = function(score){
  //stop from being able to move
  cancelAnimationFrame( id );

  if ( $scope.firebaseUser ){
    var ref = firebase.database().ref().child("users/" + $scope.firebaseUser.uid);
    console.log('Final score:'+$scope.data.score);
    //update user's high score if it's higher than their current score or they haven't recorded a score yet
    if(score > $scope.data.score || typeof $scope.data.score === 'undefined'){
      ref.child('score').set(score);
    }

  }
  return;
};

$scope.updateScore = function(score){

  if ( $scope.firebaseUser ){
    var ref = firebase.database().ref().child("loggedIn/" + $scope.firebaseUser.uid);
    ref.child('score').set(score); 

  }
  return;
};




  //set up game sounds
  var sounds = new WebAudiox.GameSounds();
  sounds.lineOut.volume = 0.4;

  //sound fx
  var url  = '/sounds/coin.wav';
  var coinSound = sounds.createClip()
    .register('coin')
    .load(url, function(coinSound){

  });
  url  = '/sounds/durr.wav';
  var durrSound  = sounds.createClip()
      .register('durr')
      .load(url, function(durrSound){
  });
  url   = '/sounds/bounce.wav';
  var bounceSound  = sounds.createClip()
      .register('bounce')
      .load(url, function(bounceSound){
  });

  url   = '/sounds/super.wav';
  var superSound  = sounds.createClip()
      .register('super')
      .load(url, function(superSound){
  });
  url   = '/sounds/success.wav';
  var successSound  = sounds.createClip()
      .register('success')
      .load(url, function(successSound){
  });


  //helpers coz I suck at maths
  Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
  };
  function randStep(min, max, step) {
    return min + (step * Math.floor(Math.random()*(max-min)/step) );
  }

  var windowHalfX = window.innerWidth / 2;
  var windowHalfY = window.innerHeight / 2;

  function pointerLock (){ var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
      if ( havePointerLock ) {
        var element = document.body;
        var pointerlockchange = function ( event ) {
          if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
            controlsEnabled = true;
            controls.enabled = true;
            blocker.style.display = 'none';
          } else {
            controls.enabled = false;
            blocker.style.display = 'flex';
            instructions.style.display = '';
          }
        }
         function pointerlockerror( event ) {
          instructions.style.display = '';
        }
        // Hook pointer lock state change events
        document.addEventListener( 'pointerlockchange', pointerlockchange, false );
        document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
        document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
        document.addEventListener( 'pointerlockerror', pointerlockerror, false );
        document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
        document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

         function instructionsListener( event ) {
          instructions.style.display = 'none';
          // Ask the browser to lock the pointer
          element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
          if ( /Firefox/i.test( navigator.userAgent ) ) {
            var fullscreenchange = function ( event ) {
              if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {
                document.removeEventListener( 'fullscreenchange', fullscreenchange );
                document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
                element.requestPointerLock();
              }
            };
            document.addEventListener( 'fullscreenchange', fullscreenchange, false );
            document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );
            element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
            element.requestFullscreen();
          } else {
            element.requestPointerLock();
          }
        }

        pointerLock.instructionsListener = instructionsListener;
        instructions.addEventListener( 'click', instructionsListener, false );
        playButtonDiv.innerHTML = 'Click to play';
      } else {
        instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
      }
  }

   
  // game config
   var settings = {
     points:{
      "gem": 5,
      "supergem": 10,
      "movingSupergem": 50
     },
     amount:{
      "gems": 30,
      "supergem": 10,
      "movingSupergem": 3
     },
     fog:{
      color: 0xffffff,
      near: 0,
      far: 800
     },
     lives: 5,
     boxSize: 50,
  };

  //init game state variables
  var clock = new THREE.Clock(),
      container = document.getElementById( 'visualisation' ),
      camera, scene, renderer,
      geometry, material, mesh,
      controls,
      start,
      score = 0,
      life = settings.lives,
      raycaster,
      lightCube, lightMesh,
      gem = [],
      supergem = [],
      movingSupergem = [],
      blocks = [],
      bouncy = [],
      floor = [],
      directionalLight, pointLight,

      first = true,
      id,

      prevTime = performance.now(),

      boxWidth = settings.boxSize,
      boxheight = settings.boxSize,
      boxLength = settings.boxSize,

      playButtonDiv = document.getElementById("playButton"),
      scoreDiv = document.getElementById( "score" ),
      finalScoreDiv = document.getElementById( "finalScore" ),
      lifeDiv = document.getElementById( "life" ),
      instructions = document.getElementById( "instructions" ),

      win = false,
      controlsEnabled = false,
      moveForward = false,
      moveBackward = false,
      moveLeft = false,
      moveRight = false,
      canJump = false,
      pressed,
      velocity = new THREE.Vector3(),
      blockGroup;

  $scope.supergemsCollected = 0;
  $scope.movingSupergemsCollected = 0;
  $scope.gemsCollected = 0;

  $scope.inverted = localStorage.getItem('inverted') ? true : false;

  $scope.invert = function(){
    if (localStorage.getItem('inverted')){
      $scope.inverted = false;
      localStorage.removeItem('inverted');

    } else {
      $scope.inverted = true;
      localStorage.setItem('inverted', true);

    }
    controls.inverted = $scope.inverted;

  }

    function init() {
     
    //camera
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.y = 10;
    camera.up.set( 0, 0, 1 );
    //scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( settings.fog.color, settings.fog.near, settings.fog.far );
  
        //player
        // var playerGeom = new THREE.BoxGeometry( 2,2,2);
        // material = new THREE.MeshPhongMaterial({ shininess: 5,specular: 0xFFFEE4, color: 0x3A0F46});
        // player = new THREE.Mesh(playerGeom, material)

        // scene.add(player)
        // camera.add(player);

        //controls
        controls = new THREE.PointerLockControls( camera );

        controls.inverted = $scope.inverted;

        scene.add(controls.getObject());
    
        geometry = new THREE.BoxGeometry(boxWidth,boxheight,boxLength );  
        blockGroup = new THREE.Object3D();//create an empty container
        //create the regular blocks
        for ( var i = 0; i < 250; i ++ ) {
            material = new THREE.MeshPhongMaterial( {  shininess: 10,specular: 0xFFFEE4});
            mesh = new THREE.Mesh( geometry, material );
            mesh.position.x = randStep(25,1000,50);
            mesh.position.y = randStep(100,1000,50);
            mesh.position.z = randStep(25,1000,50);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.matrixAutoUpdate = true;
            mesh.updateMatrix();
            material.color.setHSL( Math.random() * 2 + 0.5,  Math.random() * 100, Math.random() * 0.25 + 0.75 );
            blocks.push( mesh );
            blockGroup.add( mesh );
            scene.add(blockGroup);
        }
       
        material = new THREE.MeshPhongMaterial( {  shininess: 30, vertexColors: THREE.VertexColors});
        material.transparent = true;

        geometry = new THREE.BoxGeometry(boxWidth,boxheight,boxLength ); 
        for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {
            var face = geometry.faces[ i ];
            face.vertexColors[ 0 ] = new THREE.Color().setHSL(150, 50, Math.random() * 0.25 + 0.75 );
            face.vertexColors[ 1 ] = new THREE.Color().setHSL( 170, 50, Math.random() * 0.25 + 0.75 );
            face.vertexColors[ 2 ] = new THREE.Color().setHSL( 190, 50, Math.random() * 0.25 + 0.75 );
        } 
        //here's a starting platform with more restricted positioning
        start = new THREE.Mesh( geometry, material );

        start.position.x = Math.floor(Math.random() * (300 - 50 + 1)) + 50;
        start.position.y = 150;
        start.position.z = Math.floor(Math.random() * (300 - 50 + 1)) + 50;
        start.castShadow = true;
        start.receiveShadow = true;
        start.matrixAutoUpdate = true;
        start.updateMatrix();
        blocks.push(start);
        scene.add( start );
      
        //bouncy blocks
        geometry = new THREE.BoxGeometry(50,5,50 );  
        material = new THREE.MeshPhongMaterial( { color: 0xF6FF63, specular: 0xFF3253, shininess: 30});

        for ( var i = 0; i < 150; i ++ ) {
          mesh = new THREE.Mesh( geometry, material );
          mesh.position.x = randStep(25,1000,50);
          mesh.position.y = randStep(50,1000,25);
          mesh.position.z = randStep(25,1000,50);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.matrixAutoUpdate = true;
          mesh.updateMatrix();
          bouncy.push( mesh );
          scene.add(mesh);
        }

        //gems (actually more like big coins)
        var coin = new THREE.CylinderGeometry( 15, 15, 5, 48 );
        var material2 = new THREE.MeshPhongMaterial( { color: 0x75FF86, specular: 0x00F2FF, shininess: 20 });


        for ( var i = 0; i < settings.amount.gems; i ++ ) {
            mesh = new THREE.Mesh( coin, material2 );
          mesh.position.x = randStep(0,1000,50);
            mesh.position.y = randStep(200,1000,50);
            mesh.position.z = randStep(0,1000,50);
            mesh.rotation.x = Math.random() * Math.PI;
            mesh.rotation.y = Math.random() * Math.PI;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            mesh.matrixAutoUpdate = true;
            mesh.updateMatrix();
            gem.push( mesh );

            scene.add( mesh );

        }

        //tetrahedron supergem
        var prism = new THREE.TetrahedronGeometry( 20, 0 ); 
        material2 = new THREE.MeshPhongMaterial( { color: 0xDA0FFF,specular: 0xffffff, shading: THREE.FlatShading, shininess: 20, });

        for (  i = 0; i < settings.amount.supergem; i ++ ) {
            mesh = new THREE.Mesh( prism, material2 );
            mesh.position.x = randStep(0,1000,50);
            mesh.position.y = randStep(600,1000,50);
            mesh.position.z = randStep(0,1000,50);
            mesh.rotation.x = Math.random() * Math.PI;
            mesh.rotation.y = Math.random() * Math.PI;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.matrixAutoUpdate = true;
            mesh.updateMatrix();
            supergem.push( mesh );
            scene.add( mesh );
        }

        //moving tetrahedron supergem
        var prism = new THREE.IcosahedronGeometry( 10, 0 ); 
   
        material2 = new THREE.MeshPhongMaterial( { color: 0x272822, shininess: 10,specular: 0xffffff, shading: THREE.FlatShading});

        for (  i = 0; i < settings.amount.movingSupergem; i ++ ) {

            mesh = new THREE.Mesh( prism, material2 );
            mesh.position.x = randStep(0,1000,50);
            mesh.position.y = randStep(150,300,50);
            mesh.position.z = randStep(0,1000,50);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.matrixAutoUpdate = true;
            mesh.updateMatrix();
            scene.add( mesh );
            movingSupergem.push( mesh );
        }


        // floor
        var geometry = new THREE.PlaneGeometry( 3000, 3000, 50, 50 );
        geometry.rotateX( - Math.PI / 2 );
        for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {
          var vertex = geometry.vertices[ i ];
          vertex.x += 15;
          vertex.y += Math.random() * 40 - 5;
          vertex.z += 30;
        }
        for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {
          var face = geometry.faces[ i ];
          face.vertexColors[ 0 ] = new THREE.Color().setRGB( 0.01,0.01,0.01);
          face.vertexColors[ 1 ] = new THREE.Color().setRGB( 0,0,0);
          face.vertexColors[ 2 ] = new THREE.Color().setRGB( 0,0,0);
        }
        material = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );
        mesh = new THREE.Mesh( geometry, material );
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.x = 500;
        mesh.position.z = 500;

        scene.add( mesh );
        floor.push( mesh );

        //light
        directionalLight = new THREE.DirectionalLight( 0xFFFEE4, 0.2 );
        scene.add( directionalLight );
        pointLight = new THREE.PointLight( 0xFFFEE4, 0.2, 1200 );
        pointLight.castShadow = true;
        scene.add( pointLight );

        // light representation
        lightCube = new THREE.BoxGeometry( 50, 50, 50 );
        lightMesh = new THREE.Mesh( lightCube, new THREE.MeshPhongMaterial( { } ) );
        lightMesh.transparent = true;
        scene.add( lightMesh );
        raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 20 );

        //spawn
        controls.getObject().position.x = start.position.x;
        controls.getObject().position.z = start.position.z;


        controls.getObject().position.y = 350;

  var onKeyDown = function ( event ) {
          switch ( event.keyCode ) {
            case 38: // up
            case 87: // w
              moveForward = true;
              break;
            case 37: // left
            case 65: // a
              moveLeft = true; break;
            case 40: // down
            case 83: // s
              moveBackward = true;
              break;
            case 39: // right
            case 68: // d
              moveRight = true;
              break;
            case 32: // space (jump)
              if (pressed) return;
              pressed=true;
              if ( canJump === true ) {
              velocity.y += 450;
              canJump = false;
              //soundClip2.play();
              }
            break;
          }
        };

  var onKeyUp = function ( event ) {
    switch( event.keyCode ) {
      case 38: // up
      case 87: // w
        moveForward = false;
        break;
      case 37: // left
      case 65: // a
        moveLeft = false;
        break;
      case 40: // down
      case 83: // s
        moveBackward = false;
        break;
      case 39: // right
      case 68: // d
        moveRight = false;
        break;
      case 32: // space
        pressed=false;
        break;
    }
  };
     

document.addEventListener( 'keydown', onKeyDown, false );
document.addEventListener( 'keyup', onKeyUp, false );

function webglAvailable() {
    try {
      var canvas = document.createElement( 'canvas' );
      return !!( window.WebGLRenderingContext && (
        canvas.getContext( 'webgl' ) ||
        canvas.getContext( 'experimental-webgl' ) )
      );
    } catch ( e ) {
      return false;
    }
  }

  if ( webglAvailable() ) {
    renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    } else {
    renderer = new THREE.CanvasRenderer({antialias: true, alpha: true});
    }

    renderer.setClearColor( 0xffffff );
    if ( webglAvailable() ) {
        renderer.shadowMap.enabled = true;
    }

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );
    }

    function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }
    function onDocumentMouseMove(event) {
        mouseX = ( event.clientX - windowHalfX ) * 2;
        mouseY = ( event.clientY - windowHalfY ) * 2;
    }
    function removeMesh(){
       scene.remove(mesh);

    }
    function animate() {
        id = requestAnimationFrame( animate );
        render();
    }
    function render() {

      analyser.getByteFrequencyData(frequencyData);
   
      
      var currentSeconds = Date.now();
      camera.updateProjectionMatrix();


        blockGroup.position.y = frequencyData[1] * 0.04;

        for(var i = 0; i < supergem.length; i++){

          supergem[i].translateY(frequencyData[18] * 0.008);
        };
   
      if ( controlsEnabled ) {

        pointLight.position.copy( controls.getObject().position );
        lightMesh.position.copy(controls.getObject().position );
        
     
        raycaster.ray.origin.copy( controls.getObject().position );

        var time = Date.now() * 0.001;

        var intersections = raycaster.intersectObjects( blocks );
        var intersections2 = raycaster.intersectObjects( gem );
        var intersections3 = raycaster.intersectObjects( bouncy );
        var intersections4 = raycaster.intersectObjects( floor );

        var isOnObject = intersections.length > 0;
        var isOnBouncy = intersections3.length > 0;
        var isOnFloor = intersections4.length > 0;

      
        // loop through gems and increase score when close enough to gem[i]. Remove gem[i] from array and scene.
        var distance;
        distance = 50;

        for(var i = 0; i < gem.length; i++){
                gem[i].rotation.z = time * 1;
          if ( gem[i].position.distanceTo( controls.getObject().position ) <= distance) {
              scene.remove(gem[i]);
              gem.splice(i, 1);
              coinSound.play();
              score += settings.points.gem;
              scoreDiv.innerHTML = (score).toString();
              $scope.gemsCollected = $scope.gemsCollected + 1;
              $scope.updateScore(score);
            }
        }

        //same as above but for diamond 'supergems'
        for(var i = 0; i < supergem.length; i++){
                supergem[i].rotation.x = time * 1;

        if ( supergem[i].position.distanceTo( controls.getObject().position ) <= distance) {
            scene.remove(supergem[i]);
            supergem.splice(i, 1);
            coinSound.play();
            score += settings.points.supergem;
            scoreDiv.innerHTML = (score).toString();
            $scope.supergemsCollected = $scope.supergemsCollected + 1;

            $scope.updateScore(score);
          }
        }
        //same as above but for moving 'supergems'
        for(var i = 0; i < movingSupergem.length; i++){

            movingSupergem[i].rotation.x = time * 1;
            movingSupergem[i].rotation.y = time * 2.5;
            //keep rising until it hits 1500 height
            if (movingSupergem[i].position.y < 1500){
              movingSupergem[i].position.y += 0.75;
            }
            if ( movingSupergem[i].position.distanceTo( controls.getObject().position ) <= distance) {
                scene.remove(movingSupergem[i]);
                movingSupergem.splice(i, 1);
                superSound.play();
                score += settings.points.movingSupergem;
                scoreDiv.innerHTML = (score).toString();
                $scope.movingSupergemsCollected = $scope.movingSupergemsCollected + 1;
                $scope.updateScore(score);
          }
        }
      //when there are none of the gems left the game is over ('won') and the final score with life bonus is calculated.
      if (gem.length === 0 && supergem.length === 0){

        var multiplier = (life * 50);
        var hs = (score + multiplier);
        //hide the play button
        $('span.play').hide();

        $('#riperoo').fadeIn(250);
        finalScoreDiv.innerHTML = 'You won!<br/><strong>Score: </strong>'+ score.toString() +'<br/><strong>Lives multiplier: </strong>' + multiplier.toString() +'<br/>'+'<span>Final Score: '+ hs.toString()+'</span>';
        $scope.setScore(hs);

        bounceSound.play();

        controls.enabled = false;
       
        blocker.style.display = 'flex';
        instructions.style.display = '';
        instructions.removeEventListener( 'click', pointerLock.instructionsListener, false );
        document.exitPointerLock = document.exitPointerLock    ||
                                   document.mozExitPointerLock;

        // Attempt to unlock
        document.exitPointerLock();

      }

      //when you touch the floor you lose a life and go bouncy
      if ( isOnFloor === true ) {
        //trying to not make you lose a life immediately
        if (first === true){
          first = false;
        } else {
          durrSound.play();
          $('#hurt').fadeIn(75);
          $('#hurt').fadeOut(200);
          life -= 1;
          lifeDiv.innerHTML = (life).toString();
        }
      }
   
      //end game because no lives left
      if (life === 0){

        $scope.setScore(score);

        $('span.play').hide();
        $('#riperoo').fadeIn(250);
        finalScoreDiv.innerHTML = '<span>Final Score: '+ score.toString()+'</span>';
        controls.enabled = false;
        instructions.removeEventListener( 'click', pointerLock.instructionsListener, false );
        blocker.style.display = 'flex';
        instructions.style.display = '';

        document.exitPointerLock = document.exitPointerLock    ||
                                   document.mozExitPointerLock;

        // Attempt to unlock
        document.exitPointerLock();

      }

     //spring sound
        if (isOnBouncy === true){
            bounceSound.play();
      }
      // spring hitting action (bounce)
      for ( var i = 0; i < bouncy.length; i++ ){

        if ( bouncy[i].position.distanceTo( controls.getObject().position ) <= distance && isOnBouncy === true) {
          bouncy[i].position.y -= 25; // move it down
        }
          //  blocks[i].position.y += 0.2; // translate enemy downwards
        //  }
      }
      var time = performance.now();
      var delta = ( time - prevTime ) / 1000;
      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;
      velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
      // if ( moveForward ) velocity.z -= 1500.0 * delta;
      // if ( moveBackward ) velocity.z += 1500.0 * delta;
      // if ( moveLeft ) velocity.x -= 1100.0 * delta;
      // if ( moveRight ) velocity.x += 1100.0 * delta;

    //set up movement velocity

    if (moveForward) velocity.z  -= 1500.0 * delta;
   // if (moveForward && isOnObject === true) velocity.z  += 500.0 * delta;
    if (moveForward && canJump === false && controls.getObject().position.y > 10) velocity.z -= 15;

                
    if (moveBackward) velocity.z  += 1500.0 * delta;
    if (moveBackward && canJump === false && controls.getObject().position.y > 10) velocity.z += 15;

    if (moveLeft) velocity.x -= 1000.0 * delta;
    if (moveLeft && canJump === false && controls.getObject().position.y > 10) velocity.x -= 15;

    if (moveRight) velocity.x += 1000.0 * delta;
    if (moveRight && canJump === false && controls.getObject().position.y > 10) velocity.x += 15;

    // controls.getObject().translateX(velocity.x);
    // controls.getObject().translateY(velocity.y);
    // controls.getObject().translateZ(velocity.z);
    if ( isOnObject === true || isOnBouncy === true ) {
      velocity.y = Math.max( 0, velocity.y );
      canJump = true;
       
      } else {
      canJump = false;

    }

    // automatically jump on the bouncy objects and the floor
    if (isOnBouncy === true || isOnFloor === true ){

      //reset velocity first!
      velocity.y = 0;

      canJump = true;
      velocity.y += 650;
    }
  
    controls.getObject().translateX( velocity.x * delta );
    controls.getObject().translateY( velocity.y * delta );
    controls.getObject().translateZ( velocity.z * delta );

    //what is this?
    if ( controls.getObject().position.y < 10 ) {
      velocity.y = 0;
      controls.getObject().position.y = 10;
      canJump = true;
    }

    prevTime = time;

  // end controls enabled block
  }

  renderer.render( scene, camera );
}

//get renriz tracks
var playTrack = function(){

    SC.get('/users/127459/tracks').then(function(tracks){
      var song = $.map(tracks, function(i){
        return i;
      });
    //get a random track
    var i = Math.floor(Math.random() * song.length);
      //make the http request
      soundcloud.get(song[i].id).success(function (data) {

        var clientid = 'a7c99e975fa37c393cb1a6d89d5c1e0b';
        //make the data accessible in scope
        $scope.band = data.user.username;
        $scope.bandUrl = data.user.permalink_url;
        $scope.title = data.title;
        $scope.trackUrl = data.permalink_url;
        $scope.albumArt = data.artwork_url;
        $scope.wave = data.waveform_url;
        $scope.stream = data.stream_url + '?client_id=' + clientid;
             
        // only setting up audio context when the stream exists
        setupPlayer();

      });

    });


}


$scope.muted = localStorage.getItem('mute') ? true : false;

var setupPlayer = function(){

  var audio = new Audio($scope.stream);
  audio.crossOrigin = "anonymous";
  var source = context.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(context.destination);
  analyser.fftSize = 64;

  console.log($scope.stream)
  audio.volume = 0.8;
  if (!$scope.muted){
    audio.play();
    $scope.playing = true;
  }

  $scope.play = function () {

  if (!$scope.muted){

      $scope.playing = !$scope.playing;
      if (!$scope.playing) {
        audio.pause();
        $scope.playing = false;

        $('#songPlay').html('play')
      } else {
        audio.play();
        $scope.playing = true;

        $('#songPlay').html('stop')

      }
    }
  };

  //disable playing tracks         
$scope.mute = function(){
    if (!localStorage.getItem('mute')){
    localStorage.setItem('mute', true);
      audio.pause();
      $scope.playing = false;
      $scope.muted = true;
      $('#songPlay').html('play')
    } else {
      localStorage.removeItem('mute');
       audio.play();
      $scope.playing = true;
      $scope.muted = false;
      $('#songPlay').html('stop')
    }
  };

};

  var context = new (window.AudioContext || window.webkitAudioContext)();
  var analyser  = context.createAnalyser();
  var frequencyData = new Uint8Array(analyser.frequencyBinCount);


}]);