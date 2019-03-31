const express = require('express');

const router = express.Router();
var config = require('../config.json');

var sysinfo = require('./sysinfo');
router.use('/sysinfo', sysinfo);

var scripts = require('./scripts');
router.use('/scripts', scripts);

if (config.network.enabled) {
    var network = require('./network');
    router.use('/network', network);
}

router.get('/', function (req, res) {
    res.send('Welcome to HackIface API.');
});


router.get('/login', function (req, res) {
    console.log('Login: '+req.query.login);
    console.log('Pass: '+req.query.pass);

    //TODO send cookie session id.
});




module.exports = router;