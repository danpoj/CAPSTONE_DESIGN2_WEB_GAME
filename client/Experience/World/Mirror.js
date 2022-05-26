import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import * as THREE from "three";

import Experience from "../Experience.js";

export default class Mirror {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;

    let geometry, material;
    let groundMirror, verticalMirror;

    geometry = new THREE.CircleGeometry(100, 64);
    groundMirror = new Reflector(geometry, {
      clipBias: 0.003,
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
      color: 0xaafdcc,
    });

    groundMirror.rotateX(-Math.PI / 2);

    this.scene.add(groundMirror);
  }
}
