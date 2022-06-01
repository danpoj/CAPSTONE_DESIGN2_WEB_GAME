import Experience from "./Experience.js";

export default class VideoCall {
  constructor() {
    this.experience = new Experience();
    this.socket = this.experience.socket;

    const videoGrid = document.getElementById("video-grid");
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
        myVideo.srcObject = stream;
        myVideo.addEventListener("loadedmetadata", () => {
          myVideo.play();
        });
        videoGrid.append(myVideo);

        myPeer.on("call", (call) => {
          call.answer(stream);
          const video = document.createElement("video");
          call.on("stream", (userVideoStream) => {});
        });

        this.socket.on("user connected", () => {
          const call = myPeer.call();
          const video = document.createElement("video");
          call.on("stream", (userVideoStream) => {
            video.srcObject = userVideoStream;
            video.addEventListener("loadedmetadata", () => {
              video.play();
            });
            videoGrid.append(video);
          });
          call.on("close", () => {
            video.remove();
          });
        });
      });

    myPeer.on("open", (id) => {
      console.log(id);
    });

    this.socket.emit("join room");
    this.socket.on("user connected", () => {});
    this.socket.on("user id", (userId) => {
      console.log(userId);
    });
  }
}
