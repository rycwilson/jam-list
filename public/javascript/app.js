// this part only required if list items are present at initialization
// var options = {
//     valueNames: ['title', 'artist']
//   };

// var options = {
//   item: 'song-li'
// };

// var songsList = new List('songs-list', options);

// var options = {
//     valueNames: [ 'name', 'city' ]
// };

// var hackerList = new List('hacker-list', options);


$(function() {

  View.init();
  Song.all();
  initFlash();
  initUnderscore();

});

// View class
function View() { }

View.renderSongs = function (songs) {
  console.log(songs);
  var songsTemplate = _.template($("#songs-template").html());
  $("#songs-list ul").append(songsTemplate({ songs: songs }));
};

View.renderLyrics = function (song) {  // song = { id, url }

  window.frames.lyrics.location = '/lyrics/' + song.id; // references the name attribute

  // Below, a couple of approaches that didn't work...
  /*
    the src attribute is changed (with either approach),
    but request is still /lyrics/0
    apparently the src attribute is cached or something
    // $('#lyrics-iframe').attr('src', '/lyrics/' + song.id);
    $('#lyrics-iframe')[0].src = '/lyrics/' + song.id;
    $('#lyrics-iframe')[0].contentWindow.location.reload(true);
  */
  /*
    Initially tried displaying lyrics dynamically via underscore template,
    but this required a remote script to be loaded asynchronously
    Challenge: The remote script contains a document.write, but that doesn't work for async,
    because the DOM "closes" after initial load
    Tried to asynchronously add a script element, but it didn't work
    var $script = document.createElement('script');
    $script.setAttribute('src', "//genius.com/songs/" + song.id + "/embed.js");
    $script.setAttribute('crossDomain', 'true');
    $script.setAttribute('async', true);
    document.body.appendChild($script);
  */
 };

/*
  attach listeners here...
*/
View.init = function() {

  /*
    new song
    create only if song exists in genius api
  */
  $('#new-song-form').on('submit', function (e) {
    e.preventDefault();
    var newSong = {
      title: $(this).find('#new-song-title').val(),
      artist: $(this).find('#new-song-artist').val()
    };
    if (Song.geniusLookup)
    Song.create(newSong);
    $.get('/genius-search', newSong, function (geniusData, status) {
      if (geniusData.error) {
        // TODO: render a "song not found" mesg, and offer suggestions
        return console.log('error: ', geniusData.error);
      }
      // if found in genius api, save the song to db
      $.post('/songs', { song: { title: geniusData.title,
                                artist: geniusData.artist,
                              geniusId: geniusData.id,
                             geniusUrl: geniusData.url } },
        function (data, status) {
          // pass it as an array so _.each() can process it in template
          View.renderSongs([data]);
      });
    });
  });

  /*
    song click -> display lyrics
    artist click -> ?
  */
  $('#songs-list').on('click', 'a', function (e) {
    e.preventDefault();
    if ($(this).hasClass('song-title')) {
      View.renderLyrics({ id: $(this).data('genius-id'),
                         url: $(this).data('genius-url') });
    }
    else if ($(this).hasClass('song-artist')) {
      // artist
    }
    else if ($(this).hasClass('song-delete')) {  // delete
      if (confirm('Are you sure?')) {
        $.ajax({
          url: '/songs/' + $(this).data('id'),
          method: 'delete',
          context: $(this), /* keep the <a> tag as the context,
                               otherwise context inside the callback
                               is the jqXHR (AJAX) object */
          success: function (data, status) {
            $(this).closest('li').remove();
            // if we just do this, page will have to be refreshed for
            // element to actually be removed
            // $(this).remove();
          }
        });
      }
    }
  });

  /*
    sign-out
  */
  $('#sign-out').on('click', function (e) {
    e.preventDefault();
    // note: there is no $.delete
    $.ajax({
      url: '/sessions',
      type: 'DELETE',
      success: function (data, status) {
        window.location.href = '/welcome';
      }
    });
  });

  /*
    tabs
  */
  $('#navTabs a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
  });

};

function Song() {}

Song.all = function () {
  $.get('/songs', function (data, status) {
    View.renderSongs(data);
  });
};

function initFlash() {
  $('.alert').slideDown(function () {
    setTimeout(function () {
      $('.alert').slideUp();
    }, 3000);
  });
}

function initUnderscore() {
  // this changes underscore to use {{ }} delimiters
  // (so doesn't clash with ejs)
  _.templateSettings = {
    evaluate:    /\{\{(.+?)\}\}/g,
    interpolate: /\{\{=(.+?)\}\}/g,
    escape:      /\{\{-(.+?)\}\}/g
  };
}





