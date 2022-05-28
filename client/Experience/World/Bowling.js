import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DragControls } from "three/examples/jsm/controls/DragControls.js";
import Experience from "../Experience.js";

export default class Bowling {
  constructor() {
    this.experience = new Experience();
    this.foxLocal = this.experience.foxLocal;
    this.scene = this.experience.scene;
    this.time = this.experience.time;
    this.square = this.experience.square;
    this.socket = this.experience.socket;
    this.loader = new GLTFLoader();
    this.camera = this.experience.camera.instance;
    this.renderer = this.experience.renderer.instance;

    this.hitSound = new Audio("resources/audio/hit.mp3");
    this.playHitSound = (collision) => {
      const impactStrength = collision.contact.getImpactVelocityAlongNormal();

      if (impactStrength > 1.5) {
        this.hitSound.volume = Math.random() * 0.3;
        this.hitSound.currentTime = 0;
        this.hitSound.play();
      }
    };

    this.objectsToUpdate = [];
    this.remoteBox = [];
    this.bowlingPins = [];
    this.isPins = false;
    // this.draggableObjects = [];

    // const controls = new DragControls(
    //   this.draggableObjects,
    //   this.camera,
    //   this.renderer.domElement
    // );

    this.world = new CANNON.World();
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.allowSleep = true;
    this.world.gravity.set(0, -9.82, 0);

    this.boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    this.boxMaterial = new THREE.MeshStandardMaterial({
      metalness: 0.9,
      roughness: 0.05,
      color: 0xffffff,
    });
    this.sphereGeometry = new THREE.SphereGeometry(0.2, 10, 10);
    this.sphereMaterial = new THREE.MeshStandardMaterial({
      metalness: 0.6,
      roughness: 0.2,
      color: 0xffffff,
    });
    this.addFloor();

    window.addEventListener("keypress", (e) => {
      if (
        (e.key === "p" || e.key === "P") &&
        this.objectsToUpdate.length < 200
      ) {
        const width = Math.random();
        const height = Math.random();
        const depth = Math.random();
        const position = {
          x: this.foxLocal.model.position.x,
          y: 3,
          z: this.foxLocal.model.position.z,
        };

        this.createBox(width, height, depth, position);

        this.socket.emit("box", {
          width,
          height,
          depth,
          position,
        });
      }
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "r" || e.key === "R") {
        this.isPins = false;
        this.removeBox(this.objectsToUpdate);
        this.removeBox(this.bowlingPins);
        this.socket.emit("remove box");
      }
    });

    window.addEventListener("keydown", (e) => {
      if ((e.key === "o" || e.key === "O") && !this.isPins) {
        this.isPins = true;
        this.createBowlingPin();
      }
    });

    this.socket.on("box", (boxData) => {
      this.createBox(boxData.width, boxData.height, boxData.depth, {
        x: boxData.position.x,
        y: boxData.position.y,
        z: boxData.position.z,
      });
    });

    this.socket.on("sphere", (sphereData) => {
      this.createRemoteSphere(sphereData);
    });

    this.socket.on("remove box", () => {
      this.removeBox(this.objectsToUpdate);
    });

    window.addEventListener("keydown", (e) => {
      if (
        (e.key === "]" || e.key === "}") &&
        this.objectsToUpdate.length < 200
      ) {
        this.createSphere();
      }
    });

    this.addFoxLocalCollision();
  }

  addFloor() {
    this.floorShape = new CANNON.Plane();
    this.floorBody = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(0, 0, 0),
      shape: this.floorShape,
    });
    this.floorBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(-1, 0, 0),
      Math.PI * 0.5
    );
    this.world.addBody(this.floorBody);
  }

  addFoxLocalCollision() {
    setTimeout(() => {
      this.foxShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.8, 0.5));
      this.foxBody = new CANNON.Body({
        mass: 0.8,
        shape: this.foxShape,
      });

      // this.foxBody.position.set(
      //   this.foxLocal.model.position.x,
      //   this.foxLocal.model.position.y,
      //   this.foxLocal.model.position.z
      // );
      this.world.addBody(this.foxBody);
    }, 5000);
  }

  createSphere() {
    const sphere = new THREE.Mesh(this.sphereGeometry, this.sphereMaterial);
    sphere.position.set(
      this.foxLocal.model.position.x,
      2,
      this.foxLocal.model.position.z
    );
    this.scene.add(sphere);

    const sphereShape = new CANNON.Sphere(0.2);
    const sphereBody = new CANNON.Body({
      mass: 0.9,
      shape: sphereShape,
    });
    sphereBody.position.set(
      this.foxLocal.model.position.x,
      2,
      this.foxLocal.model.position.z
    );

    this.world.addBody(sphereBody);

    sphereBody.addEventListener("collide", this.playHitSound);

    this.objectsToUpdate.push({
      mesh: sphere,
      body: sphereBody,
    });

    this.socket.emit("sphere", {
      x: this.foxLocal.model.position.x,
      y: 2,
      z: this.foxLocal.model.position.z,
    });
  }

  createRemoteSphere(position) {
    const sphere = new THREE.Mesh(this.sphereGeometry, this.sphereMaterial);
    sphere.position.set(position.x, 2, position.z);
    this.scene.add(sphere);

    const sphereShape = new CANNON.Sphere(0.2);
    const sphereBody = new CANNON.Body({
      mass: 0.9,
      shape: sphereShape,
    });
    sphereBody.position.set(position.x, 2, position.z);

    this.world.addBody(sphereBody);

    sphereBody.addEventListener("collide", this.playHitSound);

    this.objectsToUpdate.push({
      mesh: sphere,
      body: sphereBody,
    });
  }

  createBox(width, height, depth, position) {
    const mesh = new THREE.Mesh(this.boxGeometry, this.boxMaterial);
    mesh.scale.set(width / 2, height / 2, depth / 2);
    mesh.position.copy(position);
    this.scene.add(mesh);

    const shape = new CANNON.Box(
      new CANNON.Vec3(width * 0.25, height * 0.25, depth * 0.25)
    );
    const body = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(0, 3, 0),
      shape: shape,
    });
    body.position.copy(position);
    this.world.addBody(body);

    body.addEventListener("collide", this.playHitSound);

    this.objectsToUpdate.push({
      mesh,
      body,
    });
  }

  removeBox(objects) {
    for (const object of objects) {
      // Remove body
      object.body.removeEventListener("collide", this.playHitSound);
      this.world.removeBody(object.body);

      // Remove mesh
      this.scene.remove(object.mesh);
    }
    objects.splice(0, objects.length);
  }

  createBowlingPin() {
    const PIN_PATH = "./Static/models/Bowling/pin.glb";

    this.loader.load(PIN_PATH, (gltf) => {
      this.pin(gltf, 0, 0);
    });
    this.loader.load(PIN_PATH, (gltf) => {
      this.pin(gltf, -0.5, 0);
    });
    this.loader.load(PIN_PATH, (gltf) => {
      this.pin(gltf, 0, 0.5);
    });
    this.loader.load(PIN_PATH, (gltf) => {
      this.pin(gltf, -0.5, 0.5);
    });
    this.loader.load(PIN_PATH, (gltf) => {
      this.pin(gltf, -1, 0);
    });
    this.loader.load(PIN_PATH, (gltf) => {
      this.pin(gltf, 0, 1);
    });
    this.loader.load(PIN_PATH, (gltf) => {
      this.pin(gltf, -1.5, 0);
    });
    this.loader.load(PIN_PATH, (gltf) => {
      this.pin(gltf, 0, 1.5);
    });
    this.loader.load(PIN_PATH, (gltf) => {
      this.pin(gltf, -0.5, 1);
    });
    this.loader.load(PIN_PATH, (gltf) => {
      this.pin(gltf, -1, 0.5);
    });
  }

  pin(gltf, x, z) {
    gltf.scene.position.set(
      this.foxLocal.model.position.x + x,
      0,
      this.foxLocal.model.position.z + z
    );
    gltf.scene.scale.set(1.5, 1.5, 1.5);
    this.scene.add(gltf.scene);

    const shape = new CANNON.Box(new CANNON.Vec3(0.1, 0.2, 0.1));
    const body = new CANNON.Body({
      mass: 1,
      shape: shape,
    });
    body.position.copy(gltf.scene.position);

    body.addEventListener("collide", this.playHitSound);

    this.world.addBody(body);

    this.bowlingPins.push({
      mesh: gltf.scene,
      body: body,
    });
  }

  update() {
    this.world.step(1 / 60, this.time.delta / 1200, 3);

    if (this.objectsToUpdate.length > 0) {
      for (const object of this.objectsToUpdate) {
        object.mesh.position.copy(object.body.position);
        object.mesh.quaternion.copy(object.body.quaternion);
      }
    }

    if (this.bowlingPins.length > 0) {
      for (const pin of this.bowlingPins) {
        pin.mesh.position.copy(pin.body.position);
        pin.mesh.quaternion.copy(pin.body.quaternion);
      }
    }

    // if (this.sphere) {
    //   this.sphere.position.copy(this.sphereBody.position);
    //   this.sphere.quaternion.copy(this.sphereBody.quaternion);
    // }

    if (this.foxLocal.model && this.foxBody) {
      this.foxBody.position.copy(this.foxLocal.model.position);
      this.foxBody.quaternion.copy(this.foxLocal.model.quaternion);
    }
  }
}
