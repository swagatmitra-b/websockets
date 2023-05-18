let input = document.querySelector("#message");
let fileInput = document.querySelector("#file");
let send = document.querySelector("button");
let serverSend = document.querySelector(".server-send");
let mediaContainer = document.querySelector(".container");
let fileSend = document.getElementById("file-button");
let playMusic = document.getElementById("play-music");
let anchorTag = document.querySelector("a"); 
send.disabled = true;
fileInput.disabled = true;
fileSend.style.display = "none";
playMusic.style.display = "none";

input.addEventListener("keypress", (e) => {
  if (e.key == "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

const socket = new WebSocket("ws://localhost:5500");

socket.onopen = (e) => {
  console.log("Client socket opened!");
  send.disabled = false;
  fileInput.disabled = false;

  let name = prompt("Enter Chat username: ");
  if (name == "") {
    alert("Username is required!");
    while(name == "") {
      name = prompt("Enter chat username")
    }
  }
  socket.send(name);
};

socket.onmessage = (message) => {
  scroll()
  const { data } = message;
  let mediaSrc = data.split(" ")[1];
  let mediaType = data.split(";")[0].split(":")[2];
  console.log(mediaSrc);
  console.log(mediaType);

  if (mediaType == "video/mp4") {
    let question = confirm(
      "Chrome has sent you a video. Would you like to receive it?"
    );
    if (question) {
      const video = document.createElement("video");
      video.src = mediaSrc;
      video.width = "600";
      video.height = "400";
      video.controls = true;
      mediaContainer.appendChild(video);
      return;
    } else return;
  } else if (mediaType == "image/jpeg" || mediaType == "image/png") {
    let question = confirm(
      "Chrome has sent you a picture. Would you like to receive it?"
    );
    if (question) {
      const img = new Image();
      img.src = mediaSrc;
      document.body.appendChild(img);
      return;
    } else return;
  } else if (mediaType == "audio/mpeg") {
    const music = document.createElement("audio");
    music.src = mediaSrc;
    document.body.appendChild(music);
    playMusic.style.display = "block";
    playMusic.onclick = () => {
      music.play();
    };
    return;
  } else if (mediaType == "application/pdf") {
    const download = document.createElement("button"); 
    download.innerText = "Download PDF";
    anchorTag.href = mediaSrc;
    anchorTag.download = "";
    anchorTag.appendChild(download);
    return
  }

  serverSend.innerHTML += `
      <span style="margin-bottom: 0.7rem; color: blue; background-color: lavender; border-radius: 0.2rem; font-size: 1rem; padding: 0.2rem 0.4rem">
        ${data}
        </span>`;
};

send.addEventListener("click", sendMessage, false);

function sendMessage() {
  scroll()
  let message = input.value;
  socket.send(message);
  serverSend.innerHTML += `
  <span style="margin-bottom: 0.7rem; color: red; background-color: lightpink; border-radius: 0.2rem; font-size: 1rem; padding: 0.2rem 0.4rem">
    You: ${message}
    </span>`;
}

fileInput.addEventListener("change", () => {
  console.log("change triggered");
  const file = fileInput.files[0];
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
      You sent a${file.type == "audio/mpeg" ? "n MP3 file" : " video"}
      </span>`;
  };
});

function scroll () {
  serverSend.scrollTo({
    top: serverSend.scrollHeight + 400, 
    behavior: "smooth"
  })
}
