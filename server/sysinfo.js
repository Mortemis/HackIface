const express = require('express');
const sysinfo = require('systeminformation');
const router = express.Router();

const updateInterval = 1000;


const networkInterface = 1; //TODO add this to config;
var myIP;
var myMAC;

var coreTemp;
var coreLoad;
var uptime;
var totalMemory;
var usedMemory;

router.get('/temp', function (req, res) {
    res.send(coreTemp + '');
});

router.get('/coreload', function (req, res) {
    res.send(coreLoad + '');
});

router.get('/uptime', function (req, res) {
    res.send(uptime + '');
});

router.get('/mem', function (req, res) {
    res.send(totalMemory + '');
});

router.get('/usedmem', function (req, res) {
    res.send(usedMemory + '');
});

router.get('/mempercent', function(req, res) {
    let percent = usedMemory/totalMemory*100;
    percent = percent.toFixed(0);
    res.send(percent + '');
});

router.get('/ip', function (req, res) {
    res.send(myIP + '');
});

router.get('/mac', function (req, res) {
    res.send(myMAC + '');
});

initSystemInfo();

module.exports = router;

// Set up timers to update system info.
async function initSystemInfo() {
    let mem = await sysinfo.mem();
    totalMemory = mem.total;
    let netIfaces = await sysinfo.networkInterfaces();
    myIP = netIfaces[networkInterface].ip4;
    myMAC = netIfaces[networkInterface].mac.toUpperCase();

    setInterval(tempUpdater, updateInterval);
    setInterval(coreLoadUpdater, updateInterval);
    setInterval(uptimeUpdater, updateInterval);
    setInterval(memoryUpdater, updateInterval);
}


//#region Updaters - looped functions.
async function tempUpdater() {
    let temp = await sysinfo.cpuTemperature();
    coreTemp = temp.max;
}

async function coreLoadUpdater() {
    let load = await sysinfo.currentLoad();
    coreLoad = Math.trunc(load.currentload);
}

async function memoryUpdater() {
    let mem = await sysinfo.mem();
    usedMemory = mem.active;
}

function uptimeUpdater() {
    let time = sysinfo.time();
    uptime = time.uptime;
}
//#endregion

