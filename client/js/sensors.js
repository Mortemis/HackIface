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
}

