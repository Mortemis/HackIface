const express = require('express');

const router = express.Router();
var config = require('../config.json');

var sysinfo = require('./sysinfo');
router.use('/sysinfo', sysinfo);

var scripts = require('./scripts');
router.use('/scripts', scripts);

var sensors = require('./sensors');
router.use('/sensors', sensors);

if (config.network.enabled) {
    var network = require('./network');
    router.use('/network', network);
}

router.get('/', function (req, res) {
    res.send('Welcome to HackIface API.');
});






module.exports = router;