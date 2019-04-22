const express = require('express');
const router = express.Router();
var data = {nodes: []};

router.use(express.json());

router.get('/', function(req, res) {
    res.send(data.nodes);
});

router.route('/temp')
    .get(function (req, res) {
        res.send(data.nodes[0]);
    })
    .post(function (req, res) {
        data.nodes[0] = req.body;
        console.log(`Got data from sensor > ${data.nodes[0]}`);
        res.status(200).send('');
    });

module.exports = router;