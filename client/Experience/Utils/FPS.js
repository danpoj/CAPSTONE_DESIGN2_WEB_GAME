import Stats from "../../node_modules/stats.js/src/Stats.js";
import Experience from "../Experience.js";

export default class FPS {
  constructor() {
    this.experience = new Experience();
    const stats = new Stats();
    this.stats = stats;
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
  }

  updateBegin() {
    this.stats.begin();
  }

  updateEnd() {
    this.stats.end();
  }
}
