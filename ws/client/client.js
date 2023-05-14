let input = document.querySelector("#message");
let fileInput = document.querySelector("#file");
let button = document.querySelector("button");
let serverSend = document.querySelector(".server-send");
let audio = document.querySelector('audio');
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
  console.log(typeof data, data.length);

  if (data.length > 1000) {
    let question = confirm("Chrome has sent you a picture");
    if (question) {
      const img = new Image();
      img.src = data;
      document.body.appendChild(img);
      return;
    } else return
  }

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

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  console.log("change triggered");
  console.log(file);
  // const url = URL.createObjectURL(fileInput.files[0])
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    const imgSourceAsBlob = reader.result;
    socket.send(imgSourceAsBlob);
  };
  // socket.send(url)
});