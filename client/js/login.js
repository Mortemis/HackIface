document.onkeydown = function (e) {
    e = e || window.event;
    switch (e.which || e.keyCode) {
        case 13: $('#loginButton').click();
            break;
    }
}

$('#loginButton').on('click', function (event) {
    event.preventDefault();

    let login = document.getElementById('inputLogin').value;
    let pass = document.getElementById('inputPassword').value;


    $.post('/login', { 'login': login, 'pass': pass }).done(function (data) {
        if (data === 'access_granted') {
            document.location.href = '/';
        }
    });
});
