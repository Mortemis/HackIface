const express = require('express');
const udp = require('dgram');
const router = express.Router();
var config = require('../config.json');

const NODEMCU_HOST = '10.10.10.192';
const NODEMCU_PORT = 666;
const WEATHERWARE_HOST = '10.10.10.200';
const WEATHERWARE_PORT = 333;

const SENSOR_INTERVAL = 1000;

var cmd = Buffer.from('sens\n');

var nodemcu = udp.createSocket('udp4');
var weatherware = udp.createSocket('udp4');

var nodemcuData = {dstemp: 'N/A', dhttemp: 'N/A', dhtrh: 'N/A'}; 
var weatherwareData = { light: 'N/A', temp: 'N/A', pres: 'N/A' };

router.get('/', function (req, res) {
    res.send('Under construction');
});

router.get('/weatherware', function (req, res) {
    res.send(weatherwareData);
});

router.get('/nodemcu', function (req, res) {
    res.send(nodemcuData);
});

router.get('/buzz', function (req, res) {
    buzz();
    res.send('ok');
});

module.exports = router;

//Response processor
weatherware.on('message', function (msg, info) {
    if (msg.toString() !== 'ok\r\n' && msg.toString() !== 'busy\r\n') {
        var data = msg.toString();
        parseSensorData(data);
    }
});

//Response processor
nodemcu.on('message', function (msg, info) {
    try {
        nodemcuData = JSON.parse(msg.toString());
    } catch (error) {
        console.log('[sensors] Nodemcu failure');
    }
});


setInterval(requestSensorData, SENSOR_INTERVAL);

function parseSensorData(rawData) {
    let strings = rawData.split(',');
    weatherwareData.light = removeBrackets(strings[0]);
    weatherwareData.temp = removeBrackets(strings[1]); // + ' °C';
    weatherwareData.pres = removeBrackets(strings[2]); // + ' Pa';
    if (config.debug_mode == true) {
        console.log('[sensors] Weatherware > ' + weatherwareData.toString);
    }
}

function removeBrackets(str) {
    return str.slice(str.indexOf('[') + 1, str.indexOf(']'));
}

//Request sensor data
function requestSensorData() {
    weatherware.send(cmd, WEATHERWARE_PORT, WEATHERWARE_HOST, function (error) {
        if (error) {
            weatherware.close();
        } else {
            if (config.debug_mode == true) {
                console.log('[sensors] > Requested weatherware data...');
            }
        }
    });
    nodemcu.send(cmd, NODEMCU_PORT, NODEMCU_HOST, function (error) {
        if (error) {
            nodemcu.close();
        } else {
            if (config.debug_mode == true) {
                console.log('[sensors] > Requested nodemcu data...');
            }
        }
    });
}

//Send buzz command
function buzz() {
    weatherware.send('buzz\n', WEATHERWARE_PORT, WEATHERWARE_HOST, function (error) {
        if (error) {
            weatherware.close();
        } else {
            console.log('[sensors] > BZZZ');
        }
    });
}


