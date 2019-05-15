var mongo = require('mongoose');

const schema = new mongo.Schema({
    login: String,
    pass: String
});

module.exports = mongo.model('Account', schema);