$(function() {

  $('.welcome-toggle').on('click', function (e) {
    e.preventDefault();
    $('.welcome').toggleClass('show hidden');
  });

  $('#login-form').on('submit', function (e) {
    e.preventDefault();
    // $(this).find('#login-email').val() returns undefined - ?
    var loginUser = {
      email: $(this).find("[type='email']").val(),
      password: $(this).find('#login-password').val()
    };
    $.post('/sessions', {user: loginUser}, function (data, status) {
      window.location.href = '/home';
    })
      .fail(function (data, status) {
        switch (res.status) {
          case 403:
            $('#password-error-msg').text(res.responseText);
            $('#login-password').focus();
            $('#login-password').closest('.form-group')
              .toggleClass('has-error'); break;
          case 404:
            $('#email-error-msg').text(res.responseText);
            $('#login-email').focus();
            $('#login-email').closest('.form-group')
              .toggleClass('has-error');
        }
      });
  });

});
