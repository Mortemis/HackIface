const express = require('express');
const sysinfo = require('systeminformation');
const app = express();
const port = 3000;
const staticDirectory = __dirname + '/client';

var coreTemp;
var coreLoad;
var uptime;
var totalMemory;
var usedMemory;

// Static website lies here.
app.use(express.static(staticDirectory));


app.get('/api/sysinfo/temp', function(req, res) {
    res.send(coreTemp+'');
});

app.get('/api/sysinfo/coreload', function(req, res) {
    res.send(coreLoad+'');
});

app.get('/api/sysinfo/uptime', function(req, res) {
    res.send(uptime+'');
});

app.get('/api/sysinfo/mem', function(req, res) {
    res.send(totalMemory+'');
});

app.get('/api/sysinfo/usedmem', function(req, res) {
    res.send(usedMemory+'');
});

// 404 page
app.get('*', function (req, res) {
    res.sendFile(staticDirectory + '/404.html');
});



app.listen(port, (err) => {
    if (err) {
        return console.log(`Can\'t start server. Something running on port ${port} or missing root privileges.`, err)
    }
    console.log(`Server is listening on port ${port}.`)
    setInterval(tempUpdater, 1000);
    setInterval(coreLoadUpdater, 1000);
    setInterval(uptimeUpdater, 1000);
})

//TODO
function initSystemInfo() {
    sysinfo.mem()
    .then(data => setUsedMemory(data.active))
    .catch();

    setInterval(tempUpdater, 1000);
    setInterval(coreLoadUpdater, 1000);
    setInterval(uptimeUpdater, 1000);
    setInterval(memoryUpdater, 1000);
}

function setTemp(temp) {
    coreTemp = temp;
}

function tempUpdater() {
    sysinfo.cpuTemperature()
    .then(data => setTemp(data.max))
    .catch();
}

function setCoreLoad(load) {
    coreLoad = load;
    coreLoad = Math.trunc(coreLoad);
    //console.log(coreLoad.toFixed(1));
}

function coreLoadUpdater() {
    sysinfo.currentLoad()
    .then(data => setCoreLoad(data.currentload))
    .catch();
}

function setUptime(_uptime) {
    uptime = _uptime;
    //console.log(uptime);
}

function uptimeUpdater() {
    var time = sysinfo.time();
    setUptime(time.uptime);
}

function setMemory(_memory) {
    memory = _memory;
    //console.log(memory);
}

function setUsedMemory(_memory) {
    usedMemory = _memory;
}

function memoryUpdater() {
    sysinfo.mem()
    .then(data => setMemory(data.total))
    .catch();
}
