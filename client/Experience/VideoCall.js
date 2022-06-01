import Experience from "./Experience.js";

export default class VideoCall {
  constructor() {
    this.experience = new Experience();
    this.socket = this.experience.socket;

    const peers = {};

    this.videoGrid = document.getElementById("video-grid");
    const myPeer = new Peer(undefined, {
      host: "https://cd2-webgame.herokuapp.com/",
      port: 443,
      path: "/",
      secure: true,
    });
    const myVideo = document.createElement("video");
    myVideo.muted = true;

    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        this.addVideoStream(myVideo, stream);

        myPeer.on("call", (call) => {
          call.answer(stream);
          const video = document.createElement("video");
          call.on("stream", (userVideoStream) => {
            this.addVideoStream(video, userVideoStream);
          });
        });

        this.socket.on("user connected", (userId) => {
          const call = myPeer.call(userId, stream);
          const video = document.createElement("video");
          call.on("stream", (userVideoStream) => {
            this.addVideoStream(video, userVideoStream);
          });
          call.on("close", () => {
            video.remove();
          });
          peers[userId] = call;
        });
      });

    this.socket.on("user disconnected", (userId) => {
      if (peers[userId]) {
        peers[userId].close();
      }
    });

    myPeer.on("open", (id) => {
      this.socket.emit("join room", this.userId, 10);
    });

    this.socket.emit("join room", this.userId);
    this.socket.on("user connected", () => {});
    this.socket.on("user id", (userId) => {
      this.userId = userId;
    });
  }

  addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    this.videoGrid.append(video);
  }
}
