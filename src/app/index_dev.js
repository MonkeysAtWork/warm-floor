import 'bootstrap/dist/css/bootstrap.css';
import './app';

console.log('Welcome to Expack!');
// Needed for Hot Module Replacement
if (module.hot) {
  module.hot.accept(); // eslint-disable-line no-undef
}
