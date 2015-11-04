$(function() {

  View.init();
  Song.all();

  $('.alert').slideDown(function() {
    setTimeout(function() {
      $('.alert').slideUp();
    }, 3000);
  });

  // this changes underscore to use {{ }} delimiters
  _.templateSettings = {
    evaluate:    /\{\{(.+?)\}\}/g,
    interpolate: /\{\{=(.+?)\}\}/g,
    escape:      /\{\{-(.+?)\}\}/g
  };

});

// View class
function View() { }

View.render = function (songs) {
  // songs template
  var template = _.template($("#songs-template").html());
  $("#songs-list").append(template({ songs: songs }));
};

View.init = function() {

  // sign-out
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

  // tabs
  $('#navTabs a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
  });

  // new song
  $('#new-song-form').on('submit', function (e) {
    e.preventDefault();
    var title = $(this).find('#new-song-title').val();
    var artist = $(this).find('#new-song-artist').val();
    $.post('/songs', { song: { title: title, artist: artist } },
      function (data, status) {
        // pass it as an array so _.each() can process it in template
        View.render([data]);
      }
    );
  });

};

function Song() {}

Song.all = function () {
  $.get('/songs', function (data, status) {

    View.render(data);
  });
};



