$('#loginButton').on('click', function (event) {
    event.preventDefault();
    let login = document.getElementById('inputLogin').value;
    let pass = document.getElementById('inputPassword').value;
    $.get('/api/login', { 'login': login, 'pass': pass });
});
