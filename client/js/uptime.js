updateUptime();
setInterval(updateUptime, 1000)
function updateUptime() {
    $.get('/api/sysinfo/uptime', '', gotUptime);
}
function gotUptime(data) {
    document.getElementById("uptimeText").innerText = secondsToString(data);
}
function secondsToString(data) {
    var seconds;
    var minutes;
    var hours;
    var days;
    seconds = data % 60;
    minutes = Math.floor(data / 60) % 60;
    hours = Math.floor((data / 60) / 60) % 24;
    days = Math.floor(((data / 60) / 60) / 24)
    var string = `${days} days\n ${hours} hours\n ${minutes} minutes\n ${seconds} seconds`;
    return string;
}
