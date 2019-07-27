const express = require('express');
var config = require('./config.json');
const cookieParser = require('cookie-parser');

const app = express();

const api = require('./server/api');
const login = require('./server/login');
const reg = require('./server/reg');
const loginExceptions = ['/img/', '/css/', '/js/', '/login', '/404.html', '/favicon.ico', '/api/login', '/api/sysinfo/mac', '/api/sysinfo/ip', '/index', '/api/sensors'];
global.idArray = [];

const staticDirectory = __dirname + '/client';

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
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

app.use('/reg', reg);

app.use('/login', login);

if (config.webdav.enabled) {
    const webdav = require('webdav-server').v2;
    const webdavServer = new webdav.WebDAVServer();
    app.use(webdav.extensions.express('/webdav', webdavServer));
}

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
    res.render('index');
});

app.get('/example', function (req, res) {
    res.sendFile(staticDirectory + '/' + 'example.html');
});

app.get('/dashboard', function (req, res) {
    res.render('dashboard');
});

app.get('/network', function (req, res) {
    res.render('lanmon', {isEnabled: config.network.enabled});
});

app.get('/sensors', function (req, res) {
    res.render('sensors');
});

// 404 page.
app.get('*', function (req, res) {
    res.render('404');
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

