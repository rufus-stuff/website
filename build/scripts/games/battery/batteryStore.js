import { registerStore } from '../../memory.js';

const batteryAttributes = {
  1: { energy: 10,  value: 10,  upgradeCost: 20 },
  2: { energy: 25,  value: 30,  upgradeCost: 100 },
  3: { energy: 50,  value: 70,  upgradeCost: 300 },
  4: { energy: 100, value: 160 }
}

export class Battery {
  constructor(level, initialEnergy = 0) {
    this.level = level;
    this.energy = {
      current: initialEnergy,
      max: batteryAttributes[level].energy,
    }
    this.value = batteryAttributes[level].value;
    this.updated = new Date();
    this.upgradeCost = batteryAttributes[level].upgradeCost;
  }
  
  upgrade() { 
    const nextLevel = this.level + 1;
    const nextAttributes = batteryAttributes[nextLevel];

    this.level = nextLevel;
    this.energy.max = nextAttributes.energy;
    this.value = nextAttributes.value;
    this.upgradeCost = nextAttributes.upgradeCost; 
    store.save()
  }
}

function initGameState() {
  return {
    version: 1,
    cash: 10,
    multiplier: 1,
    socketDeploy: 0.0833,
    energy: {
      current: 50,
      max: 50,
      reload: 0.0166,
      deploy: 1,
    },
    stats: {
      soldBatteries: 0,
      totalCash: 10,
    },
    socket: [
      new Battery ( 1 ),
      20,
      75,
      250
    ],
    lastTick: Date.now()
  }
}

function saveObjectTagger(key, value) {
  if (value instanceof Battery) {
    return { __type: 'Battery', ...value };
  }
  return value;
}

function batteryObjectReviver(key, value) {
  if (value && value.__type === 'Battery') {
    const battery = Object.create(Battery.prototype);
    Object.assign(battery, value);
    delete battery.__type;
    return battery;
  }
  return value;
}

const store = {
  state: initGameState(),

  save() {
    localStorage.setItem('battery', JSON.stringify(this.state, saveObjectTagger));
  },

  load() {
    const raw = localStorage.getItem('battery');
    this.state = raw ? JSON.parse(raw, batteryObjectReviver) : initGameState();
  },

  reset() {
    store.state = initGameState();
    store.save();
  }
}

registerStore('battery', store)
export { store }