const wifi = require('Wifi');
const dht = require('DHT11');
const WebSocket = require('ws');
const storage = require('Storage');


const SSID = 'Metro-107';
const wifiPassword = { password: '02088475' };
let connectionTry = 0;

const server = 'ws://warm-floor.herokuapp.com/controller';
// const serverPort = 8082;

const updateTimeOut = 30000;

let wsConnection = null;

const state = {
  connected: false,
  current: {
    temp: null,
    on: false,
  },
  required: {
    temp: null,
    on: false,
  },
};


function sendStateMessage() {
  if (state.connected) {
    wsConnection.send(JSON.stringify(state.current));
  }
}


function handleCurrentState(temp) {
  state.current.temp = temp;
  const shouldPinWork = state.required.on && (state.current.temp < state.required.temp);
  state.current.on = shouldPinWork;
  digitalWrite(NodeMCU.D3, shouldPinWork);
  sendStateMessage();
}


function handleRequiredState(required) {
  state.required.temp = Number(required.temp);
  state.required.on = required.on;
  const isPinWork = state.current.on;
  const shouldPinWork = state.required.on && (state.current.temp < state.required.temp);
  if (shouldPinWork !== isPinWork) {
    state.current.on = shouldPinWork;
    digitalWrite(NodeMCU.D3, shouldPinWork);
    sendStateMessage();
  }
}


function startWsConnection() {
  console.log(`ws connecting to ${server}...`);
  const ws = new WebSocket(server);

  ws.on('open', () => {
    console.log('Connected to server!');
    state.connected = true;
    wsConnection = ws;
    setTimeout(sendStateMessage, 0);
  });

  ws.on('close', () => {
    console.log('connection closed');
    state.connected = false;
    wsConnection = null;
    setTimeout(checkConnection, updateTimeOut);
  });

  ws.on('message', (msg) => {
    const data = JSON.parse(msg);
    handleRequiredState(data);
    console.log(`state was write: ${storage.write('state.json', msg)}`);
  });

  setTimeout(checkConnection, updateTimeOut);
}


function updateCurrentTemperature() {
  dht.connect(NodeMCU.D4)
    .read((a) => {
      console.log(`temp: ${a.temp}`);
      if (state.current.temp !== a.temp) {
        handleCurrentState(a.temp);
      }
    });
}


function connectWifi() {
  if (connectionTry === 5) {
    // start ap mode
    console.log('5 connection try, wifi not connect');
    E.reboot();
    return;
  }
  console.log('start wifi connection');
  wifi.connect(SSID, wifiPassword, (e) => {
    if (e) {
      console.log('error during connect:', e);
      connectionTry += 1;
      wifi.disconnect(() => setTimeout(connectWifi, updateTimeOut));
    } else {
      wifi.getIP((err, info) => {
        if (err) {
          console.log('getting IP error:', err);
          connectionTry += 1;
          wifi.disconnect(() => setTimeout(connectWifi, updateTimeOut));
        } else {
          console.log(`wifi connected...\n${info.ip}`);
          connectionTry = 0;
          setTimeout(startWsConnection, 0);
        }
      });
    }
  });
}


function checkConnection() {
  if (state.connected) {
    return;
  }
  wifi.getDetails((details) => {
    if (details.status === 'connected') {
      console.log('wifi work!');
      setTimeout(startWsConnection, 0);
    } else {
      console.log('wifi error...');
      setTimeout(connectWifi, 0);
    }
  });
}


function mainLoop() {
  updateCurrentTemperature();
  setTimeout(mainLoop, updateTimeOut);
}


function onInit() {
  const lastState = storage.readJSON('state.json');
  if (lastState) {
    state.required = lastState;
    console.log('state loaded...');
  }
  setTimeout(mainLoop, 0);
  setTimeout(connectWifi, 0);
}
