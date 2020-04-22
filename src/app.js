export default () => {
  const ws = new WebSocket('ws://95.47.25.136', 'protocolOne');
  const state = {
    switchOn: false,
  };
  const switcher = document.querySelector('#customSwitch1');
  switcher.addEventListener('change', (e) => {
    console.log(e.target.checked);
    state.switchOn = e.target.checked;
    ws.send(state.switchOn)
  })
  ws.onmessage = msg => {
    console.dir(msg);
    console.log(msg.data);
  };

};
