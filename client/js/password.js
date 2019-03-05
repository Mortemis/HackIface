var pass;

/*
document.getElementById('clearCacheButton').onClick = function() {
   //pass = document.getElementById("inputPassword").textContent;
   pass = 'hello!';
    $.get('/api/system/dropcache', pass);
};*/

$('#clearCacheButton').on('click', function(event) {
    event.preventDefault(); // To prevent following the link (optional)
    pass = document.getElementById("inputPassword").value;
    $.get('/api/system/dropcache', {'pass' : pass}, gotResponse);
});

function gotResponse(data) {
    if (data) {
        alert('Not implemented yet.');
    } else {
        alert('Wrong password!');
    }
}