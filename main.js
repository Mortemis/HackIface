const express = require('express');
var config = require('./config.json');

const uuid = require('uuid/v4');
const cookieParser = require('cookie-parser');

const app = express();

const api = require('./server/api');
const loginExceptions = ['/img/', '/css/', '/js/', '/login', '/404.html', '/favicon.ico', '/api/login', '/api/sysinfo/mac', '/api/sysinfo/ip', '/index', '/api/sensors'];
var idArray = [];
const staticDirectory = __dirname + '/client';

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Redirect... 
if (config.auth.enabled) {
    app.use((req, res, next) => {
        if (idArray.includes(req.cookies.sessionid)) {
            next();
        } else {
            if (isLoginException(req.originalUrl)) {
                next();
            } else {
                res.status('403').redirect('/login');
            }
        }
    });
}

//#region Request handlers
// Static website lies here.
app.use(express.static(staticDirectory));

app.use('/api', api);

if (config.webdav.enabled) {
    const webdav = require('webdav-server').v2;
    const webdavServer = new webdav.WebDAVServer();
    app.use(webdav.extensions.express('/webdav', webdavServer));
}

app.route('/login')
    .get(function (req, res) {
        res.sendFile(staticDirectory + '/' + 'login.html');
    })
    .post(auth);

app.post('/logout', function (req, res) {
    let sessionid = req.cookies.sessionid;
    if (idArray.includes(req.cookies.sessionid)) {
        console.log('Logout: ' + idArray.indexOf(sessionid));
        idArray.splice(idArray.indexOf(sessionid), 1);
    }
});

app.get('/logout', function (req, res) {
    let sessionid = req.cookies.sessionid;
    if (idArray.includes(req.cookies.sessionid)) {
        console.log('Logout: ' + idArray.indexOf(sessionid));
        idArray.splice(idArray.indexOf(sessionid), 1);
    }
});

app.get('/index', function (req, res) {
    res.sendFile(staticDirectory + '/index.html');
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
        res.sendFile(staticDirectory + '/' + 'lanmonitorplaceholder.html');
    }
});

app.get('/sensors', function (req, res) {
    res.sendFile(staticDirectory+'/sensors.html');
});




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

function isLoginException(url) {
    let isException = false;
    for (let i = 0; i < loginExceptions.length; i++) {
        if (url.indexOf(loginExceptions[i]) !== -1 || url === '/') {
            isException = true;
        }
    }
    return isException;
}

function auth(req, res) {
    console.log(`Got post req, login=${req.body.login}, password=${req.body.pass}`);
    if (req.body.login === 'admin' && req.body.pass === '12345') {
        let sessionid = uuid();
        idArray.push(sessionid);
        res.cookie('sessionid', sessionid, { path: '/', secure: false }).send('access_granted');
        console.log('Access granted. sessionid=' + sessionid);
    } else {
        res.status('403').send('access_denied');
        console.log('Access denied.');
    }
} 