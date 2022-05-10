import Experience from "../Experience.js";
import * as THREE from "three";

export default class Audio2 {
  constructor() {
    this.experience = new Experience();
    this.camera = this.experience.camera.instance;

    const listener = new THREE.AudioListener();
    this.camera.add(listener);

    // create the PositionalAudio object (passing in the listener)
    const sound = new THREE.PositionalAudio(listener);

    // load a sound and set it as the PositionalAudio object's buffer
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load("../../resources/audio/back.mp3", function (buffer) {
      sound.setBuffer(buffer);
      sound.setRefDistance(5);
      sound.setLoop(true);

      sound.setDirectionalCone(180, 230, 0.1);
      sound.setVolume(0.3);
      sound.play();
    });

    // create an object for the sound to play from
    const cube = new THREE.BoxGeometry(0.5, 0.5, 0.5);

    const material = new THREE.MeshPhongMaterial({ color: 0xff2200 });
    const mesh = new THREE.Mesh(cube, material);
    this.experience.scene.add(mesh);
    mesh.position.y = 0.25;

    // finally add the sound to the mesh
    mesh.add(sound);
  }
}
