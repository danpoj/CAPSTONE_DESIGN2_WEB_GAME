import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import * as THREE from "three";

import Experience from "../Experience.js";

export default class Mirror {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;

    let geometry, material;
    let groundMirror, verticalMirror;

    geometry = new THREE.PlaneGeometry(5, 5);
    groundMirror = new Reflector(geometry, {
      clipBias: 0.003,
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
      color: 0xaafdcc,
    });
    groundMirror.position.x += 20;
    groundMirror.position.z -= 25;
    // groundMirror.rotateZ(-Math.PI / 2);
    // groundMirror.rotateX(-Math.PI / 2);
    // groundMirror.rotateY(-Math.PI / 4);
    groundMirror.rotation.set(-1, 0, 0);
    this.scene.add(groundMirror);
  }
}
