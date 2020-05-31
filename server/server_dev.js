const fs = require('fs');
const path = require('path');
const express = require('express');
const webpack = require('webpack');
const https = require('https');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('../webpack.dev.config.js');
const server = require('./ws');
// const basicAuth = require('express-basic-auth');


const externalPort = 8080;
const internalPort = 8082;
const httpsOptions = {
  cert: fs.readFileSync(path.join(__dirname, '/certs/localhost.crt')),
  key: fs.readFileSync(path.join(__dirname, '/certs/device.key')),
};

const app = express();
app.disable('x-powered-by');

// const auth = basicAuth({
//   users: { 'someuser': 'somepassword' },
//   challenge: true,
//   realm: 'Imb4T3st4pp',
// });

console.log('Dev!');
const compiler = webpack(config);
const middleware = webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
});
app.use((req, res, next) => {
  console.log(req.url);
  next();
});
app.use(middleware);

app.use(webpackHotMiddleware(compiler));


const httpServer = https.createServer(httpsOptions, app);

httpServer.listen(externalPort, () => {
  console.log(`Server listening on port ${externalPort}!`);
});

server(internalPort, httpServer);
