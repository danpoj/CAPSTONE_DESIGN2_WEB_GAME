import * as THREE from "three";
import * as MW from "../meshwalk/meshwalk.module.js";
import Experience from "./Experience.js";

MW.install(THREE);

export default class MeshWalk {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.camera = this.experience.camera.instance;
    this.player = this.experience.foxLocal.model;
    this.renderer = this.experience.renderer;

    // const world = new MW.World();

    const playerController = new MW.CharacterController(this.player, 0.1);
    // world.add(playerController);

    const keyInputControl = new MW.KeyInputControl();

    this.tpsCameraControls = new MW.TPSCameraControls(
      this.camera, // three.js camera
      this.player, // tracking object
      this.renderer.domElement
    );

    // keyInputControl.addEventListener(
    //   "movekeyon",
    //   () => (playerController.isRunning = true)
    // );
    // keyInputControl.addEventListener(
    //   "movekeyoff",
    //   () => (playerController.isRunning = false)
    // );
    // keyInputControl.addEventListener("jumpkeypress", () =>
    //   playerController.jump()
    // );

    // keyInputControl.addEventListener("movekeychange", () => {
    //   const cameraFrontAngle = this.tpsCameraControls.frontAngle;
    //   const characterFrontAngle = keyInputControl.frontAngle;
    //   playerController.direction = cameraFrontAngle + characterFrontAngle;
    // });

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
