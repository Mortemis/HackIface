const express = require('express');
const sysinfo = require('systeminformation');
const ping = require('ping');
const mongo = require('mongoose');
const arp = require('node-arp');
const app = express();
const port = 3000;

const staticDirectory = __dirname + '/client';
const updateInterval = 1000;
const netUpdateInterval = 50000;

const networkInterface = 1; //TODO add this to config;

var myIP;
sysinfo.networkInterfaces().then(data => function (data){myIP = data[networkInterface].ip4});
var myMAC;
sysinfo.networkInterfaces().then(data => function (data){myIP = data[networkInterface].mac.toUpperCase});


const Schema = mongo.Schema;
const scheme = new Schema({
    ip: String,
    mac: String,
    note: String, 
    is_alive: Boolean
});
mongo.connect("mongodb://localhost:27017/network", { useNewUrlParser: true }).then(console.log('Database connected.'));
var Host = mongo.model("Host", scheme);

var coreTemp;
var coreLoad;
var uptime;
var totalMemory;
var usedMemory;

//test array for frontend
var testHosts = [['10.10.10.1', 'FF::F1', 'Gateway'], ['10.10.10.2', 'FF::F2', 'Shit'], ['10.10.10.3', 'FF::F3', 'Unregistered']];


//#region Setting up request handlers
//TODO router
// Static website lies here.
app.use(express.static(staticDirectory));


app.get('/network', function (req, res) {
    res.sendFile(staticDirectory+'/'+'lanmonitor.html');
});

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
        //TODO drop cache script running here
    } else {
        res.send(false);
    }
});

app.get('/api/test', function (req, res) {
    res.send(testHosts);

});

app.get('/api/network', function (req, res) {
    Host.find({'is_alive':true}, 'ip mac note', function(err, hosts) {
        
        var hostArray = [];

        Object.keys(hosts).forEach(function (host) {
        
            hostArray.push([hosts[host].ip, hosts[host].mac, hosts[host].note]);
        });
        res.send(hostArray);
    });
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
async function initSystemInfo() {
    mem = await sysinfo.mem();
    totalMemory = mem.total;

    setInterval(tempUpdater, updateInterval);
    setInterval(coreLoadUpdater, updateInterval);
    setInterval(uptimeUpdater, updateInterval);
    setInterval(memoryUpdater, updateInterval);

    setInterval(networkScanUpdater, netUpdateInterval);
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



function networkScanUpdater() {
    for (let i = 1; i < 255; i++) {
        checkHost(`10.10.10.${i}`);
    }
}

//#endregion

//if host state is changed, it changes in a database.
function checkHost(ip) {
    ping.sys.probe(ip, function (isAlive) {
        Host.findOne({ 'ip': ip }, 'ip mac is_alive', function (err, host) {
            if (err) { console.log('Query failed. Database corrupt.'); }

            if (host.is_alive != isAlive) {

                Host.updateOne({ 'ip': host.ip }, { 'is_alive': isAlive }, function (err, ip) {
                    console.log(`[${host.ip}] State updated to ${isAlive ? "Alive" : "Dead"}.`);
                });
            }

            if (host.is_alive == true) {
                var _mac = 'N/A';
                arp.getMAC(host.ip, function (err, mac) {
                    if (!err) {
                        if (host.ip != myIP) { //Bug here - undefined on selfscan
                            _mac = mac.toUpperCase();
                        } else { _mac = myMAC; }
                        if (host.mac !== _mac) {
                            Host.updateOne({ 'ip': host.ip }, { 'mac': _mac }, function (err, ip) {
                                console.log(`[${host.ip}] MAC changed to ${_mac}.`);
                            });
                        }
                    }
                });
            }
        });
    });
}

