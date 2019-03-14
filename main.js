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
const myIP = '10.10.10.180';
const myMAC = 'WOW IT IS ME';


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
// Static website lies here.
app.use(express.static(staticDirectory));

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
function initSystemInfo() {
    sysinfo.mem()
        .then(data => setMemory(data.total))
        .catch();
    setInterval(tempUpdater, updateInterval);
    setInterval(coreLoadUpdater, updateInterval);
    setInterval(uptimeUpdater, updateInterval);
    setInterval(memoryUpdater, updateInterval);

    setInterval(networkScanUpdater, netUpdateInterval)
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
    //TODO scan
    for (let i = 1; i < 255; i++) {
        checkHost(`10.10.10.${i}`);
    }
    /*
        for (let i = 1; i <= 254; i++) {
            let _host = Host.findOne(`10.10.10.${i}`)   
        }
    */
    /*var host = new Host(
        {
            ip: "10.10.10.1",
            mac: "FF::FF",
            note: "Gateway",
            is_alive: "true"
        }
    );*/
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

async function fetchMAC(_ip) {
    var _hostMAC = 'N/A';
    var flag = false;
    if (_ip == '10.10.10.180') { return 'WOW I AM SERVER'; }
    await console.log(`Fetching mac for ${_ip}`)
    await arp.getMAC(_ip, function (err, mac) {
        if (!err) {
            _hostMAC = mac.toUpperCase();
            //console.log(_hostMAC);
            flag = true;
        }
    });

    return _hostMAC;
}

function generateDatabaseTemplate() {
    Host.collection.drop();
    for (let i = 1; i < 255; i++) {
        let _hostname = `10.10.10.${i}`;
        let _host = new Host({ ip: _hostname, mac: 'N/A', note: 'Unregistered', is_alive: false });

        _host.save(function (err) {
            if (err) return console.log(err);
        });
    }
}

function alarm(whatHappened, data) {

}