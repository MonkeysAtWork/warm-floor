// const fs = require('fs');
const path = require('path');
const express = require('express');
// const https = require('https');
const http = require('http');
// const basicAuth = require('express-basic-auth');
const server = require('./ws');


const DIST_DIR = path.join(__dirname, '../dist');
const externalPort = process.env.PORT || 8080;
const internalPort = 8083;
// const httpsOptions = {
//   cert: fs.readFileSync(path.join(__dirname, '/certs/localhost.crt')),
//   key: fs.readFileSync(path.join(__dirname, '/certs/device.key')),
// };

const app = express();
app.disable('x-powered-by');

// const auth = basicAuth({
//   users: { admin: 'admin' },
//   challenge: true,
//   realm: 'Imb4T3st4pp',
// });


app.use((req, res, next) => {
  console.log(req.url);
  next();
});

app.use(express.static(DIST_DIR));


const httpServer = http.createServer(app);

httpServer.listen(externalPort, () => {
  console.log(`Server listening on port ${externalPort}!`);
});

server(internalPort, httpServer);
