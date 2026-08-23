// The Rufus Window Manager
const rwm = {
  focus: 1,

  init: () => {
    const windows = document.querySelectorAll(".window");

    windows.forEach((window) => {
      const appBar = window.querySelector(".window-bar");
      appBar.addEventListener("mousedown", (e) => {rwm.window.move(e)})
      window.addEventListener("click", () => rwm.window.focus(window))
      const minimizer = window.querySelector(".window-bar button")
      minimizer.addEventListener("click", () => rwm.window.minimizer(window, false))
      rwm.taskbar.registerWindow(window)
    })
  },

  taskbar: {
    display: document.getElementById('taskbar-activities'),
    registerWindow: (window) => {
      const title = window.querySelector('.window-bar p').innerText;
    
      const activityButton = document.createElement('button');
      activityButton.innerText = title;
      activityButton.onclick = () => rwm.window.minimizer(window);

      rwm.taskbar.display.appendChild(activityButton);
    }
  },

  window: {
    focus: (window) => {
      rwm.focus++;
      window.style.zIndex = rwm.focus;
    },
    minimizer: (window, resuming = null) => {
      if (resuming === true) {
        window.classList.remove('minimized');
        rwm.window.focus(window)
      } else if (resuming === false) {
        window.classList.add('minimized');
      } else {
        window.classList.toggle('minimized');
        if (!window.classList.contains('minimized')) rwm.window.focus(window)
      } 
    },
    move: (e) => {
      const targetWindow = e.target.parentElement;
      const initCoords = {
        x: e.clientX - targetWindow.offsetLeft,
        y: e.clientY - targetWindow.offsetTop
      };
      rwm.window.focus(targetWindow);

      const onMove = (e) => {
        targetWindow.style.top = e.clientY - initCoords.y + "px";
        targetWindow.style.left = e.clientX - initCoords.x + "px";
      }
      const onDrop = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onDrop);
        targetWindow.classList.remove("grabbing");
      }

      targetWindow.classList.add('grabbing');
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onDrop);
    },
  }
}

document.addEventListener("DOMContentLoaded", rwm.init);