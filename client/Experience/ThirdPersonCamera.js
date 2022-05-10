import Experience from "./Experience.js";
import * as THREE from "three";

export default class ThirdPersonCamera {
  constructor() {
    this.experience = new Experience();
    this.camera = this.experience.camera.instance;

    this.currentPosition = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();
  }

  update() {
    const idealOffset = this.calculateIdealOffset();
    const idealLookAt = this.calculateIdealLookAt();

    this.currentPosition.copy(idealOffset);
    this.currentLookAt.copy(idealLookAt);

    this.camera.position.x = this.currentPosition.x;
    this.camera.position.z = this.currentPosition.z;
    // this.camera.lookAt(this.currentLookAt);
  }

  calculateIdealOffset() {
    // const idealOffset = new THREE.Vector3(-15, 20, -30);
    const idealOffset = new THREE.Vector3(-1.49, 0, -14);

    idealOffset.applyQuaternion(this.experience.foxLocal.model.quaternion);
    idealOffset.add(this.experience.foxLocal.model.position);
    return idealOffset;
  }

  calculateIdealLookAt() {
    const idealLookAt = new THREE.Vector3(0, 10, 50);
    idealLookAt.applyQuaternion(this.experience.foxLocal.model.quaternion);
    idealLookAt.add(this.experience.foxLocal.model.position);
    return idealLookAt;
  }
}
