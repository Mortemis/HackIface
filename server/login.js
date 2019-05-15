const uuid = require('uuid/v4');
const express = require('express');
const router = express.Router();
const staticDirectory = __dirname.substring(0, __dirname.lastIndexOf('/')) + '/client';


const mongo = require('mongoose');
var Account = require('./account_model');

router.use(express.json());

router.route('/')
    .get(function (req, res) {
        res.sendFile(staticDirectory + '/login.html');
    })
    .post(async function (req, res) {
        console.log(`Info > Got post req, login=${req.body.login}, password=${req.body.pass}`);
        if (await validateAccount(req.body.login, req.body.pass)) {
            let sessionid = createUUID();
            res.cookie('sessionid', sessionid, { path: '/', secure: false }).send('access_granted');
            console.log('Info > Access granted. sessionid=' + sessionid);
        } else {
            res.status('403').send('access_denied');
            console.log('Warning > Access denied.');
        }
    });

async function validateAccount(login, pass) {
    await mongo.connect("mongodb://localhost:27017/network", { useNewUrlParser: true });
    let access = false;
    await Account.findOne({ login: login }, '', async function (err, account) {
        if (!err && account) {
            if (account.pass === pass) {
                access = true;
            }
        }
        await mongo.disconnect();
    });
    return access;
}

function createUUID() {
    let id = uuid();
    //TODO add id to database;
    idArray.push(id);
    return id;
}

module.exports = router;