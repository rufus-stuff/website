document.addEventListener("DOMContentLoaded", () => {
  updateClock();
  setInterval(updateClock, 2000);
});

const updateClock = () => document.getElementById("taskbarClock").innerText = new Date().toTimeString().substring(0, 5);