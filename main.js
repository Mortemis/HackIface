const express = require('express');
const sysinfo = require('systeminformation');

const app = express();
const port = 3000;

const staticDirectory = __dirname + '/client';

const updateInterval = 1000; 
const netUpdateInterval = 5000;

var coreTemp;
var coreLoad;
var uptime;
var totalMemory;
var usedMemory;





//#region Setting up request handlers
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

app.get('/api/system/dropcache', function (req, res) {
    var data = req.query;
    const passwd = 'gurrenlagann';
    if (data.pass == passwd) {
        res.send(true);
        //drop cache
    } else {
        res.send(false);
    }
});

app.get('/api/test', function (req, res) {
    console.log(addrOnline);
});



// 404 page.
app.get('*', function (req, res) {
    res.sendFile(staticDirectory + '/404.html');
});
//#endregion


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
    setInterval(tempUpdater, updateInterval);
    setInterval(coreLoadUpdater, updateInterval);
    setInterval(uptimeUpdater, updateInterval);
    setInterval(memoryUpdater, updateInterval);
    
    //setInterval(networkScanUpdater, netUpdateInterval)
}


//#region Updaters - looped functions.
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
    addrTemp = [];
    scanner.run();
}
//#endregion
//#region Updater setters.
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
//#endregion
