import Experience from "./Experience.js";

export default class Chat {
  constructor() {
    this.experience = new Experience();
    this.socket = this.experience.socket;

    this.chatContainer = document.querySelector("div.chat_container");
    this.hideBar = document.querySelector("div.chat_container__hidebar");
    this.showBar = document.querySelector("div.chat_container__showbar");
    this.messages = document.querySelector("ul.chat_container__text");
    this.form = document.querySelector("form.chat_container__form");
    this.input = document.querySelector("input.chat_container__input");

    this.chatContainer.classList.add("visible");

    this.form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (this.input.value) {
        this.socket.emit("chat message", this.input.value);
        this.input.value = "";
      }
    });

    this.socket.on("user connected", (data) => {
      let item = document.createElement("li");
      let name = document.createElement("span");
      let text = document.createElement("span");
      item.classList.add("message_onoff");
      item.style.backgroundColor = data.color;
      text.innerText = "님이 접속했습니다.";
      name.innerText = data.userName;
      item.appendChild(name);
      item.appendChild(text);
      this.messages.append(item);
    });

    this.socket.on("user disconnection", (data) => {
      let item = document.createElement("li");
      let name = document.createElement("span");
      let text = document.createElement("span");
      item.classList.add("message_onoff");
      item.style.backgroundColor = data.color;
      text.innerText = "님이 접속을 종료했습니다.";
      name.innerText = data.userName;
      item.appendChild(name);
      item.appendChild(text);
      this.messages.append(item);
    });

    this.socket.on("chat message", (msg_data) => {
      let item = document.createElement("li");
      item.classList.add("message_list");

      let div = document.createElement("div");
      div.classList.add("message_div");

      let name = document.createElement("span");
      name.innerText = msg_data.userName;
      name.style.backgroundColor = msg_data.color;
      name.classList.add("message_name");

      let text = document.createElement("span");
      text.innerText = msg_data.message;
      text.classList.add("message_text");

      let time = document.createElement("span");
      time.innerText = msg_data.time;
      time.classList.add("message_time");

      div.appendChild(name);
      div.appendChild(text);
      item.appendChild(div);
      item.appendChild(time);

      this.messages.appendChild(item);
      this.messages.scrollTop = this.messages.scrollHeight;
      //   window.scrollTo(0, document.body.scrollHeight);
    });

    this.hideBar.addEventListener("click", () => {
      this.chatContainer.classList.remove("visible");
      this.showBar.classList.add("visible");
    });

    this.showBar.addEventListener("click", () => {
      this.chatContainer.classList.add("visible");
      this.showBar.classList.remove("visible");
    });
  }
}
