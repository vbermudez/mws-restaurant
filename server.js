'use strict';

const express = require('express');
const compression  = require('compression');
const port = 8080;
const app = express();

app.set('port', (process.env.PORT || port));
app.use(compression());
app.use(express.static(__dirname + '/public'));

app.listen(app.get('port'), _ => console.log(`Server listening on: http://localhost:${app.get('port')}`) );

// const http = require('http');
// const https = require('https');
// const finalhandler = require('finalhandler');
// const serveStatic = require('serve-static');
// const fs = require('fs');
// const serve = serveStatic('./public');
// const options = {
//     key: fs.readFileSync('server.key'),
//     cert: fs.readFileSync('server.crt')
// };
// const port = 8080;
// const ssl_port = 8043;
// const handle_req = (req, res) => {
//     res.writeHead(301, { "Location": `https://localhost:8043${req.url}` });
//     res.end();
// };
// const handle_ssl_req = (req, res) => {
//     console.log(`${req.method} ${req.url}`);
    
//     const done = finalhandler(req, res);
  
//     serve(req, res, done);
// };
// const server = http.createServer(handle_ssl_req);
// const ssl_server = https.createServer(options, handle_ssl_req);

// server.listen(port, _ => console.log(`HTTP Server listening on: http://localhost:${port}`) );
// ssl_server.listen(ssl_port, _ => console.log(`HTTPS Server listening on: https://localhost:${ssl_port}`) );
