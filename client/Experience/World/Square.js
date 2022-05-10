import Experience from "../Experience.js";

export default class Square {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.gltfLoader = this.experience.resources.loaders.gltfLoader;

    this.setModel();
  }

  setModel() {
    this.gltfLoader.load("./Static/models/Square/out.glb", (file) => {
      const model = file.scene;
      model.position.set(-20, -79, -30);
      // this.model.rotation.set(0, Math.PI, 0);
      model.scale.set(1, 1, 1);

      this.scene.add(model);
    });

    this.gltfLoader.load("./Static/models/Duck/Duck.gltf", (file) => {
      this.duck = file.scene;
      this.duck.position.set(-10, 0, 10);
      this.duck.scale.set(1.5, 1.5, 1.5);
      this.scene.add(this.duck);
    });
  }

  rotateDuck() {
    this.duck.rotation.y += 0.05;
  }
}
