import Experience from "../Experience.js";

export default class Portal {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.gltfLoader = this.experience.resources.loaders.gltfLoader;

    this.setModel();
  }

  setModel() {
    this.gltfLoader.load("./Static/models/Portal/portal.glb", (file) => {
      const model = file.scene;
      // model.position.set(-20, -79, -30);
      // model.scale.set(1, 1, 1);

      model.position.set(0, 0, 0);
      model.rotation.y += Math.PI / 2;
      model.scale.set(0.2, 0.2, 0.2);

      this.scene.add(model);
    });
  }
}
