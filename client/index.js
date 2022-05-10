import Experience from "./Experience/Experience.js";

// if (false) {
//   const experience = new Experience(canvas);
// }

class Start {
  constructor() {
    this.form = document.querySelector("form.start_menu__form");
    document.querySelector("canvas.webgl").hidden = true;

    this.form.addEventListener("submit", this.onSubmit);
  }

  onSubmit(event) {
    event.preventDefault();

    this.canvas = document.querySelector("canvas.webgl");
    this.input = document.querySelector("input.start_menu__form_input");
    this.startMenuDiv = document.querySelector("div.start_menu");
    this.helpDiv = document.querySelector("div.point");
    this.loadingBar = document.querySelector("div.loading-bar");

    this.experience = new Experience(this.canvas);

    this.startMenuDiv.style.display = "none";
    this.canvas.hidden = false;

    this.experience.socket.emit("user name", this.input.value);

    this.helpDiv.style.display = "block";
    this.loadingBar.classList.add("visible");
  }
}

const startmenu = new Start();

// const socket = io("http://localhost:3001");
