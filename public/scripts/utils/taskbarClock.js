export default function updateClock() {
  document.getElementById("taskbarClock").innerText = new Date().toTimeString().substring(0, 5);
}