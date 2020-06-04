/* eslint-disable no-param-reassign */
const fs = require('fs');
const WebSocket = require('ws');
const path = require('path');
const _ = require('lodash');
const url = require('url');

module.exports = (httpServer) => {
  const SAVED_STATE_DIR = path.join(__dirname, '/state.json');

  const state = {
    controllerConnection: 'offline',
    current: {
      temp: '',
      on: false,
    },
    required: {
      temp: 0,
      on: false,
    },
  };

  try {
    const lastState = JSON.parse(fs.readFileSync(SAVED_STATE_DIR));
    state.required = lastState;
    console.log('state loaded');
  } catch (e) {
    console.log('no saved state');
  }

  const innerWss = new WebSocket.Server({ noServer: true });
  const extWss = new WebSocket.Server({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    const { pathname } = url.parse(request.url);

    if (pathname === '/controller') {
      innerWss.handleUpgrade(request, socket, head, (ws) => {
        innerWss.emit('connection', ws, request);
      });
    } else if (pathname === '/client') {
      extWss.handleUpgrade(request, socket, head, (ws) => {
        extWss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  const sendMessage = (wsServer, data) => {
    wsServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };

  extWss.on('connection', (ws) => {
    console.log('client connected');
    const clientId = _.uniqueId();
    ws.id = clientId;
    extWss.clients.forEach((client) => {
      if (client.id !== clientId) {
        client.terminate();
      }
    });
    ws.send(JSON.stringify({ type: 'serverState', data: state }));

    ws.on('message', (msg) => {
      const data = JSON.parse(msg);
      state.required = data;

      fs.writeFile(SAVED_STATE_DIR, msg, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('The file has been saved!');
        }
      });

      console.log(`ext message\n ${JSON.stringify(state)}`);
      sendMessage(innerWss, msg);
    });

    ws.on('close', () => {
      console.log('client disconnected');
    });

    ws.on('error', (err) => {
      console.log(err.message);
    });
  });


  innerWss.on('connection', (ws, req) => {
    const controllerId = _.uniqueId();
    ws.isAlive = true;
    ws.id = controllerId;
    if (state.controllerConnection === 'online' && req.headers.origin === 'Espruino') {
      innerWss.clients.forEach((client) => {
        if (client.id !== controllerId) {
          client.terminate();
        }
      });
      console.log('old controller connection was terminated');
    }
    console.log('controller connected');
    state.controllerConnection = 'online';
    ws.send(JSON.stringify(state.required));
    sendMessage(extWss, JSON.stringify({ type: 'connectionState', data: state.controllerConnection }));

    ws.on('message', (msg) => {
      const data = JSON.parse(msg);
      state.current = data;
      console.log(`inner message\n ${JSON.stringify(state)}`);
      sendMessage(extWss, JSON.stringify({ type: 'currentTemp', data }));
    });

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    const interval = setInterval(() => {
      innerWss.clients.forEach((client) => {
        if (!client.isAlive) {
          console.log('controller not Alive');
          client.terminate();
        } else {
          client.isAlive = false;
          client.ping(() => { });
        }
      });
    }, 10000);

    ws.on('close', () => {
      clearInterval(interval);
      if (innerWss.clients.size === 0) {
        state.controllerConnection = 'offline';
        state.current.temp = '';
        state.current.on = false;
        console.log('controller disconnected');
        sendMessage(extWss, JSON.stringify({ type: 'serverState', data: state }));
      }
    });

    ws.on('error', (err) => {
      console.log(err.message);
    });
  });
};
