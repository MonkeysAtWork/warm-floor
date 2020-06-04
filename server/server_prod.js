const path = require('path');
const express = require('express');
const http = require('http');
const secure = require('ssl-express-www');
const wss = require('./ws');


const DIST_DIR = path.join(__dirname, '../dist');
const externalPort = process.env.PORT || 8080;

const app = express();
app.disable('x-powered-by');

app.use(secure);

app.use((req, res, next) => {
  console.log(req.url);
  next();
});

app.use(express.static(DIST_DIR));


const httpServer = http.createServer(app);


wss(httpServer);


httpServer.listen(externalPort, () => {
  console.log(`Server listening on port ${externalPort}!`);
});
