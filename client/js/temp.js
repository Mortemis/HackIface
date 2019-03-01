updateTemp();
setInterval(updateTemp, 1000)
function updateTemp() {
    $.get('/api/sysinfo/temp', '', gotTemp);
}
function gotTemp(data) {
    document.getElementById("temperatureText").innerText = `${data}°C`;
}
