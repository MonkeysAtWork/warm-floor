// const fs = require('fs');
// const path = require('path');
const express = require('express');
const webpack = require('webpack');
// const https = require('https');
const http = require('http');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackConf = require('../webpack.dev.config.js');
const wss = require('./ws');

const externalPort = 8080;
// const httpsOptions = {
//   cert: fs.readFileSync(path.join(__dirname, '/certs/localhost.crt')),
//   key: fs.readFileSync(path.join(__dirname, '/certs/device.key')),
// };


const app = express();
app.disable('x-powered-by');

const compiller = webpack(webpackConf);

const hotMiddleware = webpackHotMiddleware(compiller);
const devMiddleWare = webpackDevMiddleware(compiller, {
  publicPath: webpackConf.output.publicPath,
});

app.use((req, res, next) => {
  console.log(req.url);
  next();
});

app.use(devMiddleWare);
app.use(hotMiddleware);


// const httpServer = https.createServer(httpsOptions, app);
const httpServer = http.createServer(app);

wss(httpServer);

httpServer.listen(externalPort, () => {
  console.log(`Server listening on port ${externalPort}!`);
});
