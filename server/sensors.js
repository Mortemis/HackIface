const express = require('express');
const udp = require('dgram');
const router = express.Router();
var config = require('../config.json');

const WEATHERWARE_HOST = '10.10.10.200';
const WEATHERWARE_PORT = 333;
const SENSOR_INTERVAL = 1000;
var weatherware = udp.createSocket('udp4');
var cmd = Buffer.from('sens\n');
var parsedData = { light: 'N/A', temp: 'N/A', pres: 'N/A' };

router.get('/', function (req, res) {
    res.send('Under construction');
});

router.get('/weatherware', function (req, res) {
    res.send(parsedData);
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

setInterval(requestSensorData, SENSOR_INTERVAL);

function parseSensorData(rawData) {
    let strings = rawData.split(',');
    parsedData.light = removeBrackets(strings[0]);
    parsedData.temp = removeBrackets(strings[1]); // + ' °C';
    parsedData.pres = removeBrackets(strings[2]); // + ' Pa';
    if (config.debug_mode == true) {
        console.log('[sensors] Weatherware > ' + parsedData.toString);
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
                console.log('[sensors] > Requested sensor data...');
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


