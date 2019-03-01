const express = require('express');
const sysinfo = require('systeminformation');
const evilscan = require('evilscan');
const app = express();
const port = 3000;
const staticDirectory = __dirname + '/client';

var coreTemp;
var coreLoad;
var uptime;
var totalMemory;
var usedMemory;

var addrTemp = [];
var addrOnline = [];

var options = {
    target: '10.10.10.1-254',
    port: '22',
    status: 'TROU', // Timeout, Refused, Open, Unreachable
    banner: false
};

var scanner = new evilscan(options);


scanner.on('result', function (data) {
    // fired when item is matching options
    if (data.status != 'closed (timeout)') {
        addrTemp.push(data.ip);
    }
});

scanner.on('error', function (err) {
    throw new Error(data.toString());
});

scanner.on('done', function () {
    console.log('Scan\'s done!')
    addrOnline = addrTemp.sort();
});



// Static website lies here.
app.use(express.static(staticDirectory));

// Get requests responses.
app.get('/api/sysinfo/temp', function (req, res) {
    res.send(coreTemp + '');
});

app.get('/api/sysinfo/coreload', function (req, res) {
    res.send(coreLoad + '');
});

app.get('/api/sysinfo/uptime', function (req, res) {
    res.send(uptime + '');
});

app.get('/api/sysinfo/mem', function (req, res) {
    res.send(totalMemory + '');
});

app.get('/api/sysinfo/usedmem', function (req, res) {
    res.send(usedMemory + '');
});

app.get('/api/test', function (req, res) {
    console.log(addrOnline);
});

// 404 page.
app.get('*', function (req, res) {
    res.sendFile(staticDirectory + '/404.html');
});



app.listen(port, (err) => {
    if (err) {
        return console.log(`Can\'t start server. Something running on port ${port} or missing root privileges.`, err)
    }
    console.log(`Server is listening on port ${port}.`)
    initSystemInfo();
})






// Set up timers to update system info.
function initSystemInfo() {
    sysinfo.mem()
        .then(data => setMemory(data.total))
        .catch();

    setInterval(tempUpdater, 1000);
    setInterval(coreLoadUpdater, 1000);
    setInterval(uptimeUpdater, 1000);
    setInterval(memoryUpdater, 1000);
    setInterval(networkScanUpdater, 1000)
}

// Updaters - looped functions.
function tempUpdater() {
    sysinfo.cpuTemperature()
        .then(data => setTemp(data.max))
        .catch();
}

function coreLoadUpdater() {
    sysinfo.currentLoad()
        .then(data => setCoreLoad(data.currentload))
        .catch();
}

function uptimeUpdater() {
    var time = sysinfo.time();
    setUptime(time.uptime);
}

function memoryUpdater() {
    sysinfo.mem()
        .then(data => setUsedMemory(data.active))
        .catch();
}

function networkScanUpdater() {
    scanner.run();
}

// Updater setters.
function setTemp(temp) {
    coreTemp = temp;
}

function setCoreLoad(load) {
    coreLoad = load;
    coreLoad = Math.trunc(coreLoad);
}

function setUptime(_uptime) {
    uptime = _uptime;
}

function setMemory(_memory) {
    totalMemory = _memory;
}

function setUsedMemory(_memory) {
    usedMemory = _memory;
}

