import * as THREE from "three";
import * as MW from "../meshwalk/meshwalk.module.js";
import Experience from "./Experience.js";

export default class MeshWalk {
  constructor() {
    MW.install(THREE);
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.camera = this.experience.camera.instance;
    this.player = this.experience.foxLocal.model;
    this.renderer = this.experience.renderer;

    const playerController = new MW.CharacterController(this.player, 0.1);

    const keyInputControl = new MW.KeyInputControl();

    this.tpsCameraControls = new MW.TPSCameraControls(
      this.camera, // three.js camera
      this.player, // tracking object
      this.renderer.domElement
    );

    this.tpsCameraControls.addEventListener("update", () => {
      const cameraFrontAngle = this.tpsCameraControls.frontAngle;
      const characterFrontAngle = keyInputControl.frontAngle;
      playerController.direction = cameraFrontAngle + characterFrontAngle;
    });
  }

  update() {
    this.tpsCameraControls.update(16);
  }
}
