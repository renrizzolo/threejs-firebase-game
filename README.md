# threejs firebase game

This project started out as vanilla js experimentation with canvas animation synced to audio. 
It then evolved to using threejs, and went from some random triangular shapes dancing around the screen to a simple game based on [this example](https://threejs.org/examples/#misc_controls_pointerlock).

I wanted to learn how to use firebase's authentication and realtime database to record and track users/scores, so I used AngularJS and the AngularFire library along with firebase.

I also integrated the Soundcloud API to play my tracks and used AudioContext.createAnalyser() to move the objects to the beat of the playing song.

Oh, the game is live here: [https://threejsthing.firebaseapp.com](https://threejsthing.firebaseapp.com)

Ohhh and I made this in 2015. It wasn't in version control.

##Game play

Aim to get as many of the 3 black __movingsupergems__ as you can before they rise too high. 
From there you can take your time, trying to get as many points as you can before you use up all your lives. 
It's kinda hard.

__W A S D__ = Move
__SPACE__ = Jump
__MOUSE__ = Look

![Coin](https://raw.githubusercontent.com/renrizzolo/threejs-firebase-game/master/public/images/coin.png "Coin") = 5 points
![diamond](https://raw.githubusercontent.com/renrizzolo/threejs-firebase-game/master/public/images/diamond.png "diamond") = 10 points
![movingsupergem](https://raw.githubusercontent.com/renrizzolo/threejs-firebase-game/master/public/images/movingsupergem.png "movingsupergem") = 50 points