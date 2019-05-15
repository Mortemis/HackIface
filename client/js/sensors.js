updateData();
setInterval(updateData, 10000)

function updateData() {
    $.get('/api/sensors/temp', '', function (data) {
        $('#dhtTemp').text(`${data.sensors[1].data[0].value}°C`);
        $('#dhtRh').text(`${data.sensors[1].data[1].value}`);
        $('#dsTemp').text(`${data.sensors[0].data[0].value}`);
    });
}
