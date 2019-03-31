const express = require('express');
const webdav = require('webdav-server').v2;
const webdavServer = new webdav.WebDAVServer();
const app = express();
const port = 3000;

const api = require('./server/api');
const loginExceptions = ['/css/hacker.css', '/js/login.js', '/login', '/404.html', '/favicon.ico', '/api/login', '/api/sysinfo/mac', '/api/sysinfo/ip'];

const webdavEnabled = false;
const authEnabled = false;


const staticDirectory = __dirname + '/client';



// Redirect... 
//TODO if nosession
if (authEnabled) {
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

app.get('/network', function (req, res) {
    res.sendFile(staticDirectory + '/' + 'lanmonitor.html');
});

if (webdavEnabled) {
    app.use(webdav.extensions.express('/webdav', webdavServer));
}



// 404 page.
app.get('*', function (req, res) {
    res.sendFile(staticDirectory + '/404.html');
});
//#endregion


app.listen(port, (err) => {
    if (err) {
        return console.log(`Can\'t start server. Something running on port ${port} or missing root privileges.`, err);
    }
    console.log(`Server is listening on port ${port}.`);
});
