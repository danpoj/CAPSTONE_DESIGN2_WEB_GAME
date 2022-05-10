import Experience from "../Experience.js";
import * as THREE from "three";

export default class Audio {
  constructor() {
    this.experience = new Experience();
    this.camera = this.experience.camera.instance;

    this.listener = new THREE.AudioListener();
    this.camera.add(this.listener);

    this.sound = new THREE.Audio(this.listener);

    this.audioLoader = new THREE.AudioLoader();
    this.audioLoader.load("./resources/audio/forest.mp3", (buffer) => {
      this.sound.setBuffer(buffer);
      this.sound.setLoop(true);
      this.sound.setVolume(0.8);
      this.sound.play();
    });

    this.helpLabel0 = document.querySelector(".label-0");
    this.helpLabel1 = document.querySelector(".label-1");
    this.helpText = document.querySelector(".text");

    this.helpLabel1.addEventListener("click", () => {
      this.helpText.classList.toggle("visible");
    });

    this.helpLabel0.addEventListener("click", () => {
      if (this.sound.isPlaying) {
        this.helpLabel0.classList.remove("playing");
        this.sound.stop();
      } else {
        this.helpLabel0.classList.add("playing");
        this.sound.play();
      }
    });
  }
}
