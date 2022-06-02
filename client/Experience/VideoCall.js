import Experience from "./Experience.js";

export default class VideoCall {
  constructor() {
    this.experience = new Experience();
    this.socket = this.experience.socket;

    this.myPeer = new Peer(undefined, {
      host: "/",
      port: "3002",

      //   key: "peerjs",
      //   debug: 2,
      //   secure: process.env.REACT_APP_ENV === "PRODUCTION" ? true : false,

      //   host: "https://cd2-webgame.herokuapp.com",
      //   port: 443,
      //   path: "/",
      //   secure: true,
    });
    this.peers = {};
    this.videoGrid = document.getElementById("video-grid");
    this.myVideo = document.createElement("video");
    this.myVideo.muted = true;

    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        this.addVideoStream(this.myVideo, stream);

        this.myPeer.on("call", (call) => {
          call.answer(stream);
          const video = document.createElement("video");
          call.on("stream", (userVideoStream) => {
            this.addVideoStream(video, userVideoStream);
          });
        });

        this.socket.on("user-connected", (userId) => {
          this.connectedToNewUser(userId, stream);
        });
      });

    this.socket.on("user-disconnected", (userId) => {
      if (this.peers[userId]) {
        this.peers[userId].close();
      }
    });

    this.myPeer.on("open", (id) => {
      this.socket.emit("join-room", "room1", id);
    });

    this.socket.on("user-connected", (userId) => {
      console.log(`user connection: ${userId}`);
    });
  }

  connectedToNewUser(userId, stream) {
    const call = this.myPeer.call(userId, stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
      this.addVideoStream(video, userVideoStream);
    });
    call.on("close", () => {
      video.remove();
    });

    this.peers[userId] = call;
  }

  addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    this.videoGrid.append(video);
  }
}
