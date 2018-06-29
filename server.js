'use strict';

// const http2 = require('spdy');
// const logger = require('morgan');
// const express = require('express');
// const compression  = require('compression');
// const fs = require('fs');
// const port = process.env.PORT || 8080;
// const options = {
//     key: fs.readFileSync(__dirname + '/certs/server.key'),
//     cert: fs.readFileSync(__dirname + '/certs/server.crt')
// };
// const app = express();

// app.use(logger('dev'));
// app.use(compression());
// app.use(express.static(__dirname + '/public'));

// http2.createServer(options, app).listen(port, _ => console.log(`Server listening on: https://localhost:${port}`) );

const express = require('express');
const compression  = require('compression');
const port = 8080;
const app = express();

app.set('port', (process.env.PORT || port));
app.use(compression());
app.use(express.static(__dirname + '/public'));

app.listen(app.get('port'), _ => {
    console.log(`Server listening on: http://localhost:${app.get('port')}`);
});
