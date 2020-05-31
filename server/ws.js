/* eslint-disable no-param-reassign */
const fs = require('fs');
const WebSocket = require('ws');
const path = require('path');
const _ = require('lodash');

module.exports = (internalPort, httpServer) => {
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

  const clients = [];
  const controllers = [];

  const extWss = new WebSocket.Server({ server: httpServer });
  // const innerWss = new WebSocket.Server({ port: internalPort });

  const sendMessage = (connectionsList, data) => {
    connectionsList.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };

  extWss.on('connection', (ws, req) => {
    const clientId = _.uniqueId();
    ws.id = clientId;
    ws.isAlive = true;
    if (req.headers.origin === 'Espruino') {
      if (state.controllerConnection === 'online') {
        controllers.forEach((c) => {
          if (c.id !== clientId) {
            c.terminate();
          }
        });
        console.log('old controller connection was terminated');
      }
      ws.type = 'controller';
      console.log('controller connected');
      state.controllerConnection = 'online';
      ws.send(JSON.stringify(state.required));
      sendMessage(clients, JSON.stringify({ type: 'connectionState', data: state.controllerConnection }));
      controllers.push(ws);
    } else {
      clients.forEach((c) => {
        if (c.id !== clientId) {
          c.terminate();
        }
      });
      ws.type = 'client';
      ws.send(JSON.stringify({ type: 'serverState', data: state }));
      clients.push(ws);
    }

    ws.on('message', (msg) => {
      if (ws.type === 'client') {
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
        sendMessage(controllers, msg);

        return;
      } if (ws.type === 'controller') {
        const data = JSON.parse(msg);
        state.current = data;
        console.log(`inner message\n ${JSON.stringify(state)}`);
        sendMessage(clients, JSON.stringify({ type: 'currentTemp', data }));
        return;
      }
      console.log(`unknown ws connection type ${ws.type}`);
    });

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    const interval = setInterval(() => {
      controllers.forEach((client) => {
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
      if (ws.type === 'client') {
        console.log('client disconnected');
        return;
      } if (ws.type === 'controller') {
        clearInterval(interval);
        if (controllers.length === 0) {
          state.controllerConnection = 'offline';
          state.current.temp = '';
          state.current.on = false;
          console.log('controller disconnected');
          sendMessage(clients, JSON.stringify({ type: 'serverState', data: state }));
        }
      }
    });

    ws.on('error', (err) => {
      console.log(err.message);
    });
  });
};


//   innerWss.on('connection', (ws, req) => {
//     const controllerId = _.uniqueId();
//     ws.isAlive = true;
//     ws.id = controllerId;
//     if (state.controllerConnection === 'online' && req.headers.origin === 'Espruino') {
//       innerWss.clients.forEach((client) => {
//         if (client.id !== controllerId) {
//           client.terminate();
//         }
//       });
//       console.log('old controller connection was terminated');
//     }
//     console.log('controller connected');
//     state.controllerConnection = 'online';
//     ws.send(JSON.stringify(state.required));
//     sendMessage(extWss,
//  JSON.stringify({ type: 'connectionState', data: state.controllerConnection }));

//     ws.on('message', (msg) => {
//       const data = JSON.parse(msg);
//       state.current = data;
//       console.log(`inner message\n ${JSON.stringify(state)}`);
//       sendMessage(extWss, JSON.stringify({ type: 'currentTemp', data }));
//     });

//     ws.on('pong', () => {
//       ws.isAlive = true;
//     });

//     const interval = setInterval(() => {
//       innerWss.clients.forEach((client) => {
//         if (!client.isAlive) {
//           console.log('controller not Alive');
//           client.terminate();
//         } else {
//           client.isAlive = false;
//           client.ping(() => { });
//         }
//       });
//     }, 10000);

//     ws.on('close', () => {
//       clearInterval(interval);
//       if (innerWss.clients.size === 0) {
//         state.controllerConnection = 'offline';
//         state.current.temp = '';
//         state.current.on = false;
//         console.log('controller disconnected');
//         sendMessage(extWss, JSON.stringify({ type: 'serverState', data: state }));
//       }
//     });

//     ws.on('error', (err) => {
//       console.log(err.message);
//     });
//   });
// };
