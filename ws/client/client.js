let input = document.querySelector("input");
let button = document.querySelector("button");
let serverSend = document.querySelector(".server-send");
button.disabled = true;

input.addEventListener("change", () => {
  document.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
      sendMessage();
    }
  });
});

const socket = new WebSocket("ws://localhost:5500");

socket.onopen = (e) => {
  console.log("Client socket opened!");
  button.disabled = false;
};

socket.onmessage = (message) => {
  const { data } = message;
  serverSend.innerHTML += `
      <span style="margin-bottom: 0.7rem; color: blue; background-color: lavender; border-radius: 0.2rem; font-size: 1rem; padding: 0.2rem 0.4rem">
        ${data}
        </span>`;
};

button.addEventListener("click", sendMessage, false);

function sendMessage() {
  let message = input.value;
  socket.send(message);
  serverSend.innerHTML += `
  <span style="margin-bottom: 0.7rem; color: red; background-color: lightpink; border-radius: 0.2rem; font-size: 1rem; padding: 0.2rem 0.4rem">
    ${message}
    </span>`;
}
