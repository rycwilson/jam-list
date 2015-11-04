$(function() {

  initForm();
  initListeners();

});

function initForm () {
  $('#login-form').validator({
    delay: 4000
  });
}  // initForm

function initListeners () {
  // toggle between login and signup
  $('.welcome-toggle').on('click', function (e) {
    e.preventDefault();
    // activate/deactivate form validators
    // this has to come before forms toggling
    if ($(this).attr('id') === 'signup-toggle') {
      $('#login-form')[0].reset();
      $('#login-form').validator('destroy');
      $('#signup-form').validator({ delay: 4000 });
    }
    else {
      $('#signup-form')[0].reset();
      $('#signup-form').validator('destroy');
      $('#login-form').validator({ delay: 4000 });
      // $('#login-form').find("[type='email']").focus();
    }
    // toggle forms
    $('.welcome').toggleClass('show hidden');
    $('form').find("[type='email']").focus();
  });

  // login submit ajax
  $('#login-form').on('submit', function (e) {
    e.preventDefault();
    // $(this).find('#login-email').val() returns undefined - ?
    var loginUser = {
      email: $(this).find("[type='email']").val(),
      password: $(this).find('#login-password').val()
    };

    $.post('/sessions', { user: loginUser }, function (data, status) {
      // The user is returned - do anything with him?
      window.location.href = '/home';
    })
      .fail(function (data, status) {  // status is 'success' or 'error', not used here
        switch (data.status) {
          case 403:  // bad password
            $('#password-error-msg').text(data.responseText);
            $('#login-password').focus();
            $('#login-password').closest('.form-group')
              .toggleClass('has-error'); break;
          case 404:  // no such user
            $('#email-error-msg').text(data.responseText);
            $('#login-email').focus();
            $('#login-email').closest('.form-group')
              .toggleClass('has-error');
        }
      });
  });
}  // initListeners
