import { Battery, store } from './batteryStore.js'

export const game = {
  init() {
    store.load();
    game.inner.handleOfflineTime()
    game.ui.render.all()

    setInterval(() => {
      game.inner.tick();
    }, 1000);

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        game.inner.handleOfflineTime();
        game.ui.render.all();
      }
    });
  },

  action: {
    handleClick(idx) {
      if (store.state.socket[idx].energy.current >= store.state.socket[idx].energy.max) {
        game.inner.socket.collect(idx)
      } else {
        game.inner.socket.energize(idx)
      }
    },
    
    handleUpgrade(idx, e) {
      e.preventDefault();
      if (store.state.socket[idx] instanceof Battery) {
        game.inner.socket.upgrade(idx)
      } else {
        game.inner.socket.unlock(idx)
      }
    },

    handleTooltip(idx) {
      switch (idx) {
        case 0:
        case 1:
        case 2:
        case 3:
          if (store.state.socket[idx] instanceof Battery) {
            game.ui.tooltip.trigger('battery', idx)
          } else game.ui.tooltip.trigger('socket', idx)
          break
        case 4:
          game.ui.tooltip.trigger('energy')
          break
      }
    },

    clearTooltip() {
      game.ui.tooltip.clear()
    }
  },

  inner: {
    tick() {
      store.state.lastTick = Date.now()
      game.inner.player.recharge();
      game.ui.render.sockets();
      game.ui.render.taskbarIcon();
      game.inner.socket.recharge();
      if (game.ui.tooltip.current !== null) game.ui.tooltip.redraw();
    },

    handleOfflineTime() {
      const now = Date.now();
      const last = store.state.lastTick || now;
      const elapsedSeconds = Math.max(0, Math.floor((now - last) / 1000));

      if (elapsedSeconds > 0) {
        const e = store.state.energy;
        e.current = Math.min(e.max, e.current + e.reload * elapsedSeconds);

        for (let i = 0; i < 4; i++) {
          const socket = store.state.socket[i];
          if (socket instanceof Battery) {
            socket.energy.current = Math.min(
              socket.energy.max,
              socket.energy.current + store.state.socketDeploy * elapsedSeconds
            );
          }
        }
      }

      store.state.lastTick = now;
      store.save();
      return elapsedSeconds;
    },

    player: {
      recharge() {
        if ( store.state.energy.current <= store.state.energy.max )
          store.state.energy.current += store.state.energy.reload
        if ( store.state.energy.current > store.state.energy.max )
          store.state.energy.current = store.state.energy.max
        store.save()
        game.ui.render.energy()
      }
    },
    
    socket: {
      collect(idx) {
        if (store.state.socket[idx].energy.current < store.state.socket[idx].energy.max) return;
        store.state.cash += store.state.socket[idx].value;
        store.state.socket[idx] = new Battery(store.state.socket[idx].level);
        store.save();
        game.ui.render.all();
      },

      energize(idx, natural = false) {
        if ( store.state.socket[idx].energy.current < store.state.socket[idx].energy.max ) {

          let deployable
          if (natural) deployable = store.state.socketDeploy
          else deployable = Math.min(store.state.energy.current, store.state.energy.deploy)

          let intakeable = store.state.socket[idx].energy.max - store.state.socket[idx].energy.current
          let transfer = Math.min(deployable, intakeable)
          store.state.socket[idx].energy.current += transfer;
          if (!natural) store.state.energy.current -= transfer;

          store.save();
          game.ui.render.socket(idx);
          game.ui.render.energy();
          if (game.ui.tooltip.current != null) game.ui.tooltip.redraw();
        }
      },
      unlock(idx) {
        if (store.state.socket[idx] instanceof Battery) return
        if (store.state.cash >= store.state.socket[idx]) {
          store.state.cash -= store.state.socket[idx];
          store.state.socket[idx] = new Battery(1);
          store.save();
          game.ui.render.all();
        }
      },
      recharge() {
        for (let i=0; i<4; i++) {
          if (store.state.socket[i] instanceof Battery) this.energize(i, true)
    this.updated = new Date();
        }
      },
      upgrade(idx) {
        if (store.state.cash >= store.state.socket[idx].upgradeCost) {
          store.state.cash -= store.state.socket[idx].upgradeCost;
          store.state.socket[idx].upgrade();
        }
      }
    }
  },

  ui: {
    display: {
      energy: document.getElementById('batteryCurrencyEnergy'),
      cash: document.getElementById('batteryCurrencyCash'),
      socket: [
        document.getElementById('socketDisplay0'),
        document.getElementById('socketDisplay1'),
        document.getElementById('socketDisplay2'),
        document.getElementById('socketDisplay3'),
      ],
      taskbarIcon: document.getElementById('batteryLevel')
    },

    render: {
      all() {
        game.ui.render.cash();
        game.ui.render.energy();
        game.ui.render.sockets();
        game.ui.render.taskbarIcon();
        if(game.ui.tooltip.current !== null) game.ui.tooltip.redraw();
      },
      cash() { game.ui.display.cash.innerText = store.state.cash.toFixed(0) },
      energy() { game.ui.display.energy.innerText = store.state.energy.current.toFixed(1) },
      socket(idx) {
        if (store.state.socket[idx] instanceof Battery) {
          let percentage = store.state.socket[idx].energy.current / store.state.socket[idx].energy.max * 100
          let bat_variant = Math.floor(percentage / 10)
          game.ui.display.socket[idx].src = `./resources/battery/bat_${bat_variant}.png`
        } else {
          game.ui.display.socket[idx].src = './resources/battery/plug.png';
        }
      },
      sockets() {
        for (let i=0; i<4; i++) {
          this.socket(i)
        }
      },
      taskbarIcon() {
        let topBatteryCharge = 0;

        for (let socket of store.state.socket) {
          if (socket instanceof Battery) {
            topBatteryCharge = Math.max(topBatteryCharge, (socket.energy.current / socket.energy.max * 10).toFixed(0))
          }
        }

        game.ui.display.taskbarIcon.src = `./resources/battery/bat_${topBatteryCharge}.png`
      }
    },

    tooltip: {
      current: null,
      display: document.getElementById('batteryTooltip'),
      clear() {
        this.current = null;
        this.display.classList.remove('show');
        this.display.innerHTML = '';
      },
      makeContent(type, idx) {
        switch (type) {
          case "battery":
            let currentEnergy = store.state.socket[idx].energy.current;
            let maxEnergy = store.state.socket[idx].energy.max;
            let leftAction = (currentEnergy >= maxEnergy) ? `Sell for $${store.state.socket[idx].value}` : 'Recharge'
            return `
              <b>Level ${store.state.socket[idx].level}</b>
              Energy: ${currentEnergy.toFixed(1)}/${maxEnergy.toFixed(1)}<br><br>
              Left click: ${leftAction} <br>
              Right click: Upgrade for $${store.state.socket[idx].upgradeCost} (takes longer to recharge, sells for more)`
            break
          case "socket":
            return `
            <b>Empty</b><br><br>
            Right click: Buy for $${store.state.socket[idx]}`
          case "energy":
            return `
            <b>Energy:</b>
            ${store.state.energy.current.toFixed(1)}/${store.state.energy.max}<br><br>
            Battery recharge: ${Math.round(store.state.socketDeploy * 600) / 10}/min<br>
            Energy recharge: ${Math.round(store.state.energy.reload * 600) / 10}/min<br>
            Upgrades: Not implemented<br>
            Achievements: Not implemented<br>`
        }
      },
      redraw() {
        this.trigger(this.current[0], this.current[1]);
      },
      trigger(type, idx){
        this.current = [type, idx];
        this.display.innerHTML = this.makeContent(type, idx);
        this.display.classList.add('show');
      }
    }
  }
}

window.batteryGame = game;
