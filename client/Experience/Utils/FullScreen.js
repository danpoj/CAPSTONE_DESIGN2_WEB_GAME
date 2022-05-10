import Experience from "../Experience.js";

export default class FullScreen {
  constructor() {
    this.experience = new Experience();
    this.canvas = this.experience.canvas;

    this.fullscreenDiv = document.querySelector("div.label-2");

    this.fullscreenDiv.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        this.canvas.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });
  }
}
