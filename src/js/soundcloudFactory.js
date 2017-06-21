app.factory('soundcloud', ['$http',
    function ($http) {
      var clientid = 'a7c99e975fa37c393cb1a6d89d5c1e0b';
      scope.track = '13158665';
        $http({
            method: 'GET',
            url: 'http://api.soundcloud.com/tracks/'+scope.track+'.json?client_id='+clientid
        }).
        success(function (data) {
            scope.band = data.user.username;
            scope.bandUrl = data.user.permalink_url;
            scope.title = data.title;
            scope.trackUrl = data.permalink_url;
            scope.albumArt = data.artwork_url.replace("large", "t500x500");
            scope.wave = data.waveform_url;
            scope.stream = data.stream_url + '?client_id=' + clientid;
            scope.song = new Audio();
        });
        scope.playing = false;
        scope.play = function () {
            scope.playing = !scope.playing;
            if (!scope.playing) {
              scope.song.pause();
            }
          else
            {
              if (scope.song.src == '') {scope.song.src = scope.stream;}
              scope.song.play();
            }
        }
    }]);

//   function soundcloud_get(permalink_url) {
//   var client_id = 'a7c99e975fa37c393cb1a6d89d5c1e0b';
//   var permalink_url = permalink_url;
//   $.ajax({
//       type: 'GET',
//       url: 'https://api.soundcloud.com/resolve.json?url=' + permalink_url + '&client_id=' + client_id,
//       jsonp: 'callback',
//       dataType: 'jsonp',
//       success: function (result) {
//           console.log(result.stream_url);
//           var stream_url = result.stream_url;
//           callback_function(stream_url, client_id);
       
//       }
//   });
   
// }



//   function callback_function(stream_url, client_id, playing) {
//   WebAudiox.loadBuffer(context, stream_url + '&client_id=' + client_id, function(buffer){
//    // setup a play function
  
//     var source = context.createBufferSource();
//     source.buffer = buffer;
//     source.connect(lineOut.destination);
//     source.loop = true;
//       source.start(0);
//         $('#loading').fadeOut(300);
//   });
// }
