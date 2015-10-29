$(function() {

  View.init();

  $('.alert').slideDown(function() {
    setTimeout(function() {
      $('.alert').slideUp();
    }, 3000);
  });

});

function View() {}

View.init = function() {

  // sign-out
  $('#sign-out').on('click', function (e) {
    e.preventDefault();
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

};


