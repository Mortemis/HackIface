const express = require('express');
const app = express();
const port = 3000;

const api = require('./server/api');

const staticDirectory = __dirname + '/client';


//#region Setting up request handlers
// Static website lies here.
app.use(express.static(staticDirectory));

app.use('/api', api);

app.get('/example', function (req, res) {
    res.sendFile(staticDirectory + '/' + 'example.html');
});

app.get('/network', function (req, res) {
    res.sendFile(staticDirectory + '/' + 'lanmonitor.html');
});




// 404 page.
app.get('*', function (req, res) {
    res.sendFile(staticDirectory + '/404.html');
});
//#endregion


app.listen(port, (err) => {
    if (err) {
        return console.log(`Can\'t start server. Something running on port ${port} or missing root privileges.`, err)
    }
    console.log(`Server is listening on port ${port}.`)
})





//if host state is changed, it changes in a database.


