import 'bootstrap/dist/css/bootstrap.css';
import run from './app';

run();
console.log('Welcome to Expack!');
// Needed for Hot Module Replacement
if (module.hot) {
  module.hot.accept(); // eslint-disable-line no-undef
}
