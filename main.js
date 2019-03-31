const express = require('express');
const basicAuth = require('express-basic-auth');
var config = require('./config.json');
const webdav = require('webdav-server').v2;
const webdavServer = new webdav.WebDAVServer();
const app = express();

const api = require('./server/api');
const loginExceptions = ['/css/hacker.css', '/js/login.js', '/login', '/404.html', '/favicon.ico', '/api/login', '/api/sysinfo/mac', '/api/sysinfo/ip'];
const staticDirectory = __dirname + '/client';



app.use(basicAuth({
    users : {
        admin : "test"
    }, challenge : true
}));

// Redirect... 
//TODO if nosession
if (config.auth.enabled) {
    app.use((req, res, next) => {
        let isException = false;
        for (let i = 0; i < loginExceptions.length; i++) {
            if (req.originalUrl == loginExceptions[i]) {
                if (req.originalUrl !== loginExceptions[i]) {
                    console.log('Something crazy: ' + req.originalUrl);
                }
                isException = true;
            }
        }
        if (isException) {
            next();
        } else {
            res.status('403').redirect('/login');
        }
    });
}
//#region Request handlers
// Static website lies here.
app.use(express.static(staticDirectory));

app.use('/api', api);

app.get('/login', function (req, res) {
    res.sendFile(staticDirectory + '/' + 'login.html');
});

app.get('/example', function (req, res) {
    res.sendFile(staticDirectory + '/' + 'example.html');
});

app.get('/dashboard', function (req, res) {
    res.sendFile(staticDirectory + '/' + 'dashboard.html');
});

app.get('/network', function (req, res) {
    if (config.network.enabled) {
    res.sendFile(staticDirectory + '/' + 'lanmonitor.html');
    } else {
        res.sendFile(staticDirectory+'/'+ 'lanmonitorplaceholder.html');
    }
});

if (config.webdav.enabled) {
    app.use(webdav.extensions.express('/webdav', webdavServer));
}



// 404 page.
app.get('*', function (req, res) {
    res.sendFile(staticDirectory + '/404.html');
});
//#endregion


app.listen(config.port, (err) => {
    if (err) {
        return console.log(`Can\'t start server. Something running on port ${config.port} or missing root privileges.`, err);
    }
    console.log(`Server is listening on port ${config.port}.`);
});
