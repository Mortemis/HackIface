const express = require('express');
const router = express.Router();

const mongo = require('mongoose');
var Account = require('./account_model');

const staticDirectory = __dirname.substring(0, __dirname.lastIndexOf('/')) + '/client';

router.use(express.json());

router.route('/')
    .get(function (req, res) {
        res.sendFile(staticDirectory + '/reg.html');
    })
    .post(async function (req, res) {
        console.log('Info > Account to insert: ' + req.body.login)
        if (await register(req.body.login, req.body.pass)) {
            res.send('success');
        }
    });

async function register(login, pass) {
    await mongo.connect("mongodb://localhost:27017/network", { useNewUrlParser: true });
    await Account.findOne({ login: login }, '', async function (err, account) {
        if (!err && account) {
            console.log('Warning > Account already exists: ' + login);
            return false;
        } else {
            await Account.collection.insertOne({ login: login, pass: pass })
                .then(console.log('Info > Successfully inserted login:' + login));
            mongo.disconnect();
            return true;
        }
    });
}

module.exports = router;