updateSysInfo();
setInterval(updateSysInfo, 1000)


$.get('/api/sysinfo/ip', '', function(data) {
    document.getElementById("ipAddrText").innerText = `Main server monitor | ${data}`;
});


function updateSysInfo() {
    $.get('/api/sysinfo', '', function (data) {
        //CPU
        document.getElementById('loadBar').style.width = `${data.cpu.load}%`;
        document.getElementById('processorLoadText').innerText = 'Processor load | ' + data.cpu.load + '%';
        document.getElementById('temperatureText').innerText = `${data.cpu.temp}°C`;
        //Memory
        document.getElementById('memBar').style.width = `${data.mem.percent}%`
        document.getElementById("memText").innerText = `Memory | ${data.mem.used}/${data.mem.total}`;
        //Uptime
        document.getElementById("uptimeText").innerText = secondsToString(data.uptime);
    });
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

