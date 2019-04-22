updateData();
setInterval(updateData, 10000)

function updateData() {
    $.get('/api/sensors/temp', '', function (data) {
        $('#dhtTemp').text(`${data.dht.temp}°C`);
        $('#dhtRh').text(`${data.dht.rh}`);
        $('#dsTemp').text(`${data.ds.temp}`);
    });
}


