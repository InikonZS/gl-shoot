const {App} = require('./app.js');

const mainNode = document.querySelector('#app-main');

const app = new App(
  mainNode
);

window.app = app; // allow browser console access
