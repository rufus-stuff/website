import rwm from  './rwm.js';
import updateClock from './utils/taskbarClock.js';

// Initalize
document.addEventListener("DOMContentLoaded", () => {
  updateClock(); 
  setInterval(updateClock, 2000);
  rwm.init();
});