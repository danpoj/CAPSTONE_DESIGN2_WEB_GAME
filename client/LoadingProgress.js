import * as THREE from "three";
import Experience from "./Experience/Experience.js";

export default class LoadingProgress {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;

    this.overlayGeometry = new THREE.PlaneGeometry(150, 150, 1, 1);
    this.overlayMaterial = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uAlpha: { value: 1 },
      },
      vertexShader: `
            void main() {
                gl_Position = vec4(position, 1.0);
            }
        `,
      fragmentShader: `
            uniform float uAlpha;
            void main() {
                gl_FragColor = vec4(1.0, 1.0, 1.0, uAlpha);
            }
        `,
    });
    this.overlay = new THREE.Mesh(this.overlayGeometry, this.overlayMaterial);
    this.scene.add(this.overlay);
  }
}
