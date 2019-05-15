document.onkeydown = function (e) {
    e = e || window.event;
    switch (e.which || e.keyCode) {
        case 13: $('#regButton').click();
            break;
    }
}

$('#regButton').on('click', function (event) {
    event.preventDefault();
    $('#inputForms').removeClass('has-error');
    
    let login = $('#inputLogin').val();
    let pass = $('#inputPassword').val();
    let rePass = $('#inputRePassword').val();

    if (rePass === pass) {
        $.post('/reg', { 'login': login, 'pass': pass }).done(function (data) {
            if (data === 'success') {
                $('#inputForms').addClass('has-success');
            } else {
                $('#inputForms').addClass('has-error');
            }
        });
    } else {
        $('#inputForms').addClass('has-error');
        alert('Passwords mismatch.');
    }
});
