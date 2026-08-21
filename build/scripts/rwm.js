// The Rufus Window Manager
const rwm = {
  init: () => {
    const windows = document.querySelectorAll(".window");

    windows.forEach((window) => {
      const appBar = window.querySelector(".window-bar");
      appBar.addEventListener("mousedown", (e) => {rwm.window.move(e)})
    })
  },

  window: {
    move: (e) => {
      const targetWindow = e.target.parentElement;
      const initCoords = {
        x: e.clientX - targetWindow.offsetLeft,
        y: e.clientY - targetWindow.offsetTop
      };

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