updateData();
setInterval(updateData, 1000)

$('#buzzBtn').click(function () {
    $.get('/api/sensors/buzz');
});

function updateData() {
    $.get('/api/sensors/weatherware', '', function (data) {
        $('#temp').text(`${data.temp} °C`);
        $('#pres').text(`${data.pres} Pa`);
        $('#light').text(`${data.light}`);
    });
    $.get('/api/sensors/nodemcu', '', function (data) {
        $('#dstemp').text(`${data.dstemp} °C`);
        $('#dhttemp').text(`${data.dhttemp} °C`);
        $('#dhtrh').text(`${data.dhtrh}`);
    });
}

