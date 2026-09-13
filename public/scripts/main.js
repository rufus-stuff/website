import rwm from  './rwm.js';
import updateClock from './utils/taskbarClock.js';
import { loadAll, saveAll } from './memory.js';

import { game as batteryGame } from './games/battery/batteryGame.js';

// Initalize
document.addEventListener("DOMContentLoaded", () => {
  // Start taskbar utils
  updateClock(); 
  setInterval(updateClock, 2000);

  // Start window manager
  rwm.init();

  // Start memory management
  loadAll();
  window.addEventListener('beforeunload', saveAll);

  // Start games
  batteryGame.init()
});