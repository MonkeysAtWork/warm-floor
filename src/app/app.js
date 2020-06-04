import { watch } from 'melanke-watchjs';


const ws = new WebSocket(`wss://${location.host}/client`, 'protocolOne'); // eslint-disable-line no-restricted-globals

const state = {
  connection: 'disconnected',
  current: {
    temp: '',
    on: false,
  },
  required: {
    temp: '',
    on: false,
  },
};

const switcher = document.querySelector('#customSwitch');
const tempChanger = document.querySelector('#customRange');
const workIndicator = document.querySelector('#indicator');
const realTemperatureElement = document.querySelector('#realTemperature');
const requiredTemperatureElement = document.querySelector('#requiredTemperature');
const connectionStatus = document.querySelector('#connectionStatus');


watch(state, 'connection', () => {
  console.log('watch connect!!');
  switch (state.connection) {
    case 'disconnected':
      switcher.setAttribute('disabled', true);
      tempChanger.setAttribute('disabled', true);
      connectionStatus.textContent = 'Disconnected';
      break;
    case 'controller online':
      switcher.removeAttribute('disabled');
      tempChanger.removeAttribute('disabled');
      connectionStatus.textContent = 'Online';
      break;
    case 'controller offline':
      switcher.removeAttribute('disabled');
      tempChanger.removeAttribute('disabled');
      connectionStatus.textContent = 'Controller Offline';
      break;
    default:
      throw new Error(`${state.connection} - unknown connection state`);
  }
});

watch(state, 'current', () => {
  console.log('watch current!!');
  workIndicator.classList.remove('badge-danger');
  workIndicator.classList.remove('badge-secondary');
  workIndicator.classList.add(state.current.on ? 'badge-danger' : 'badge-secondary');
  realTemperatureElement.textContent = state.current.temp;
});

watch(state, 'required', () => {
  console.log('watch required');
  requiredTemperatureElement.textContent = state.required.temp;
  tempChanger.value = state.required.temp;
  switcher.checked = state.required.on;
});


tempChanger.addEventListener('input', (e) => {
  state.required.temp = e.target.value;
});

tempChanger.addEventListener('change', () => {
  ws.send(JSON.stringify(state.required));
});

switcher.addEventListener('change', (e) => {
  state.required.on = e.target.checked;
  ws.send(JSON.stringify(state.required));
});

window.addEventListener('unload', () => {
  ws.close(1000, 'client disconnected');
});

ws.onclose = () => {
  state.connection = 'disconnected';
};

ws.onmessage = (msg) => {
  const { data, type } = JSON.parse(msg.data);
  switch (type) {
    case 'serverState':
      state.connection = `controller ${data.controllerConnection}`;
      state.current = data.current;
      state.required = data.required;
      break;
    case 'currentTemp':
      state.current = data;
      break;
    case 'connectionState':
      state.connection = `controller ${data}`;
      break;
    default:
      console.log(`wrong message type: ${type}`);
  }
};
