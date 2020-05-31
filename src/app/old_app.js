export default () => {
  const ws = new WebSocket('wss://localhost:8080', 'protocolOne');

  const state = {
    connected: false,
    data: {
      real: {
        temp: '',
        on: false,
      },
      required: {
        temp: '',
        on: false,
      },
    },
  };

  const switcher = document.querySelector('#customSwitch');
  const tempChanger = document.querySelector('#customRange');
  const workIndicator = document.querySelector('#indicator');
  const realTemperatureElement = document.querySelector('#realTemperature');
  const requiredTemperatureElement = document.querySelector('#requiredTemperature');
  const connectionStatus = document.querySelector('#connectionStatus');

  const connectStateRender = () => {
    if (state.connected) {
      switcher.removeAttribute('disabled');
      tempChanger.removeAttribute('disabled');
      connectionStatus.textContent = 'Connected';
    } else {
      switcher.setAttribute('disabled', true);
      tempChanger.setAttribute('disabled', true);
      connectionStatus.textContent = 'Disconnected';
    }
  };

  const render = () => {
    console.log(state);
    workIndicator.classList.remove('badge-danger');
    workIndicator.classList.remove('badge-secondary');
    workIndicator.classList.add(state.data.real.on ? 'badge-danger' : 'badge-secondary');
    realTemperatureElement.textContent = state.data.real.temp;
    requiredTemperatureElement.textContent = state.data.required.temp;
    switcher.checked = state.data.required.on;
    tempChanger.value = state.data.required.temp;
  };


  tempChanger.addEventListener('change', (e) => {
    state.data.required.temp = e.target.value;
    ws.send(JSON.stringify(state.data.required));
    render();
  });

  switcher.addEventListener('change', (e) => {
    state.data.required.on = e.target.checked;
    ws.send(JSON.stringify(state.data.required));
    render();
  });

  // window.addEventListener('unload', () => {
  //   ws.close(1000, 'client disconnected');
  // });

  ws.onopen = () => {
    state.connected = true;
    connectStateRender();
    setTimeout(() => render('real'), 0);
  };

  ws.onclose = () => {
    state.connected = false;
    connectStateRender();
  };

  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    state.data = { ...state.data, ...data };
    render();
  };
};
