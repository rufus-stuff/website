
const memory = new Map();

export function registerStore(name, instance) {
  memory.set(name, instance);
}

export function saveAll() {
  for (const store of memory.values()) store.save();
}

export function loadAll() {
  for (const store of memory.values()) store.load();
}