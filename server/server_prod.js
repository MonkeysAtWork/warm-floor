const fs = require('fs');
const path = require('path');
const express = require('express');
const https = require('https');
const server = require('./ws');


const DIST_DIR = path.join(__dirname, '../dist');
const externalPort = process.env.PORT || 443;
const internalPort = 8082;
const httpsOptions = {
  cert: fs.readFileSync(path.join(__dirname, '/certs/localhost.crt')),
  key: fs.readFileSync(path.join(__dirname, '/certs/device.key')),
};

const app = express();
app.disable('x-powered-by');


app.use((req, res, next) => {
  console.log(req.url);
  next();
});

app.use(express.static(DIST_DIR));


const httpServer = https.createServer(httpsOptions, app);

httpServer.listen(externalPort, () => {
  console.log(`Server listening on port ${externalPort}!`);
});

server(internalPort, httpServer);
