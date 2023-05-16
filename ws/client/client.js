let input = document.querySelector("#message");
let fileInput = document.querySelector("#file");
let send = document.querySelector("button");
let serverSend = document.querySelector(".server-send");
let mediaContainer = document.querySelector(".container");
let fileSend = document.getElementById("file-button");
let playMusic = document.getElementById('play-music')
send.disabled = true;
fileInput.disabled = true;
fileSend.style.display = "none";
playMusic.style.display = "none";

input.addEventListener("focus", () => {
  document.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
      sendMessage();
    }
  });
});

const socket = new WebSocket("ws://localhost:5500");

socket.onopen = (e) => {
  console.log("Client socket opened!");
  send.disabled = false;
  fileInput.disabled = false;

  const name = prompt('Enter Chat username: ');
  socket.send(name);
};

socket.onmessage = (message) => {
  const { data } = message;
  let type = data.split(";")[0];
  console.log(type);

  if (type == "data:video/mp4") {
    let question = confirm(
      "Chrome has sent you a video. Would you like to receive it?"
    );
    if (question) {
      const video = document.createElement("video");
      video.src = data;
      video.width = "600";
      video.height = "400";
      video.controls = true;
      mediaContainer.appendChild(video);
      return;
    } else return;
  } else if (type == "data:image/jpeg" || type == "data:image/png") {
    let question = confirm(
      "Chrome has sent you a picture. Would you like to receive it?"
    );
    if (question) {
      const img = new Image();
      img.src = data;
      document.body.appendChild(img);
      return;
    } else return;
  } else if (type == "data:audio/mpeg") {
    const music = document.createElement('audio'); 
    music.src = data; 
    document.body.appendChild(music);
    playMusic.style.display = "block"; 
    playMusic.onclick = () => {
      music.play()
    } 
    return   
  }

  serverSend.innerHTML += `
      <span style="margin-bottom: 0.7rem; color: blue; background-color: lavender; border-radius: 0.2rem; font-size: 1rem; padding: 0.2rem 0.4rem">
        ${data}
        </span>`;
};

send.addEventListener("click", sendMessage, false);

function sendMessage() {
  let message = input.value;
  socket.send(message);
  serverSend.innerHTML += `
  <span style="margin-bottom: 0.7rem; color: red; background-color: lightpink; border-radius: 0.2rem; font-size: 1rem; padding: 0.2rem 0.4rem">
    You: ${message}
    </span>`;
}

fileInput.addEventListener("change", () => {
  console.log("change triggered");
  const file = fileInput.files[0];;
  fileSend.style.display = "block";

  fileSend.onclick = () => {
    if (file) {
      console.log(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const mediaBlob = reader.result;
        socket.send(mediaBlob);
      };
    }
    serverSend.innerHTML += `
    <span style="margin-bottom: 0.7rem; color: red; background-color: lightpink; border-radius: 0.2rem; font-size: 1rem; padding: 0.2rem 0.4rem">
      You sent a${file.type == 'audio/mpeg' ? 'n MP3 file' : ' video' }
      </span>`;
  };
});
