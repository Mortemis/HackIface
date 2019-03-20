const express = require('express');
const router = express.Router();

var sysinfo = require('./sysinfo');
var network = require('./network');


router.use('/sysinfo', sysinfo);
router.use('/network', network);

router.get('/', function (req, res) {
    res.send('Welcome to HackIface API.');
});

router.get('/login', function (req, res) {
    console.log('Login: '+req.query.login);
    console.log('Pass: '+req.query.pass);
});


/*
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
*/

module.exports = router;