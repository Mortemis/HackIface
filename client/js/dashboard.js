updateSystemInfo();
setInterval(updateSystemInfo, 1000)

$.get('/api/sysinfo/ip', '', function(data) {
    document.getElementById("ipAddrText").innerText = `Main server monitor | ${data}`;
});
var totalMemory;
$.get('/api/sysinfo/mem', '', function(data) {
    totalMemory = Math.floor(data/1024/1024);
});


function updateSystemInfo() {
    $.get('/api/sysinfo/temp', '', gotTemp);
    $.get('/api/sysinfo/usedmem', '', gotMem);
    $.get('/api/sysinfo/uptime', '', gotUptime);
}

function gotTemp(data) {
    document.getElementById("temperatureText").innerText = `${data}°C`;
}

function gotMem(data) {
    var usedMemory = Math.floor(data / 1024 / 1024);
    var percentage = usedMemory / totalMemory * 100;
    document.getElementById("memBar").style.width = `${percentage}%`;
    document.getElementById("memText").innerText = `Memory | ${usedMemory}/${totalMemory}`;
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

