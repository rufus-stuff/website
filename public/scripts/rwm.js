// The Rufus Window Manager
const rwm = {
  focus: 1,

  init: () => {
    const windows = document.querySelectorAll(".window");

    windows.forEach((window) => {
      const appBar = window.querySelector(".window-bar");
      if (appBar) appBar.addEventListener("mousedown", (e) => {rwm.window.move(e)})
      window.addEventListener("click", () => rwm.window.focus(window))
      const minimizer = window.querySelector(".window-bar button")
      if (minimizer) minimizer.addEventListener("click", () => rwm.window.minimizer(window, false))
      rwm.taskbar.registerWindow(window)

      // Window commands
      if (window.classList.contains('wincmd-center')) {
        const winH = window.offsetHeight;
        const winW = window.offsetWidth;
        const docH = document.documentElement.clientHeight;
        const docW = document.documentElement.clientWidth;

        window.style.top = `${(docH-winH)/2}px`;
        window.style.left = `${(docW-winW)/2}px`;
      }
    })
  },

  taskbar: {
    display: document.getElementById('taskbar-activities'),
    registerWindow: (window) => {
      let windowTitle = window.querySelector('.window-bar p')
      if (windowTitle) {
        const title = windowTitle.innerText;
      
        const activityButton = document.createElement('button');
        activityButton.innerText = title;
        activityButton.onclick = () => rwm.window.minimizer(window);

        rwm.taskbar.display.appendChild(activityButton);
      }
    }
  },

  window: {
    focus: (window) => {
      rwm.focus++;
      window.style.zIndex = rwm.focus;
    },
    invokeById: (id, e) => {
      e.stopPropagation();
      let window = document.getElementById(id);
      rwm.window.minimizer(window, true);
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

export default rwm;
window.rwm = rwm;