const netUpdateInterval = 50000;
const express = require('express');
const router = express.Router();
const request = require('request-promise');

const subnet = '10.10.10.';
var myIP = '10.10.10.180';
var myMAC = 'B4:2E:99:31:9C:C8';

const ping = require('ping');
const arp = require('node-arp');

const mongo = require('mongoose');
const Schema = mongo.Schema;

const scheme = new Schema({
    ip: String,
    mac: String,
    note: String,
    is_alive: Boolean
});

mongo.connect("mongodb://localhost:27017/network", { useNewUrlParser: true }).then(console.log('Database connected.'));

var Host = mongo.model("Host", scheme);

initNetworkScanner();

router.get('/', function (req, res) {
    Host.find({ 'is_alive': true }, 'ip mac note', function (err, hosts) {
        var hostArray = [];
        Object.keys(hosts).forEach(function (host) {
            hostArray.push([hosts[host].ip, hosts[host].mac, hosts[host].note]);
        });
        res.send(hostArray);
    });
});

module.exports = router;

async function initLocalIPAndMAC() {
    let ip = await request('http://localhost:3000/api/sysinfo/ip');
    let mac = await request('http://localhost:3000/api/sysinfo/mac');
    myIP = ip;
    myMAC = mac;
}

async function initNetworkScanner() {
    await initLocalIPAndMAC();
    setInterval(networkScanUpdater, netUpdateInterval);
}

function networkScanUpdater() {
    for (let i = 1; i < 255; i++) {
        checkHost(`${subnet}${i}`);
    }
}

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