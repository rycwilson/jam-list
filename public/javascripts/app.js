$(function() {

  View.init();

  console.log('app.js loaded');
  $('.alert').slideDown(function() {
    setTimeout(function() {
      $('.alert').slideUp();
    }, 3000);
  });

});

function View() {};

View.init = function() {
  $('#sign-out').on('click', function(event) {
    console.log('sign out clicked');
    event.preventDefault();
    $.get('/logout', function() {
      location.reload();
    });
  });
};


