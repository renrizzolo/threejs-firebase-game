# threejs firebase game

This project started out as vanilla js experimentation with canvas animation synced to audio. 
It then evolved to using threejs, and went from some random triangular shapes dancing around the screen to a simple game based on [this example](https://threejs.org/examples/#misc_controls_pointerlock).

I wanted to learn how to use firebase's authentication and realtime database to record and track users/scores, so I used AngularJS and the AngularFire library along with firebase.

I also integrated the Soundcloud API to play my tracks and used AudioContext.createAnalyser() to move the objects to the beat of the playing song.

Oh, the game is live here: [https://threejsthing.firebaseapp.com](https://threejsthing.firebaseapp.com)