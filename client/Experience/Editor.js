import * as THREE from "three";
import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "../node_modules/three/examples/jsm/loaders/DRACOLoader.js";
import Experience from "./Experience.js";

export default class Editor {
  constructor() {
    this.canvas = document.querySelector("canvas.editor");
    this.scene = new THREE.Scene();
    this.experience = new Experience();
    this.time = this.experience.time;
    this.socket = this.experience.socket;

    // this.dracoLoader = new DRACOLoader();
    // this.dracoLoader.setDecoderPath("/Static/draco/");
    this.gltfLoader = new GLTFLoader();
    // this.gltfLoader.setDRACOLoader(this.dracoLoader);

    this.input = document.querySelector('input[type="file"]');
    this.editorContainer = document.querySelector("div.editor_container");
    this.clear = document.querySelector("div.clear");
    this.add = document.querySelector("div.add");
    this.hide = document.querySelector("div.hide_editor");
    this.show = document.querySelector("div.show_editor");

    this.scene.background = new THREE.Color(0x000000);

    this.world = this.experience.bowling.world;
    this.foxLocal = this.experience.foxLocal;
    this.modelsToUpdate = [];
    this.remoteModelsToUpdate = [];

    this.sizes = {
      width: window.innerWidth / 1.8,
      height: window.innerHeight / 1.4,
    };

    this.addCamera();
    this.addLight();
    this.addArrowHelper();
    // this.loadModel();

    this.setRenderer();

    this.hide.addEventListener("click", () => {
      this.editorContainer.classList.remove("visible_flex");
      this.canvas.classList.remove("visible_flex");
      this.show.classList.remove("hide");
    });

    this.show.addEventListener("click", () => {
      this.editorContainer.classList.add("visible_flex");
      this.canvas.classList.add("visible_flex");
      this.show.classList.add("hide");
    });

    this.add.addEventListener(
      "click",
      () => {
        if (this.model) {
          this.model.scene.scale.set(
            1 / this.sizeBox,
            1 / this.sizeBox,
            1 / this.sizeBox
          );
          this.model.scene.position.set(
            this.experience.foxLocal.model.position.x,
            this.experience.foxLocal.model.position.y,
            this.experience.foxLocal.model.position.z
          );

          this.addModelCollision(0.5 / this.sizeBox);

          this.modelsToUpdate.push({
            mesh: this.model.scene,
            body: this.modelBody,
          });

          this.socket.emit("model", {
            dataURL: this.modelDataURL,
            position: this.foxLocal.model.position,
          });

          // this.socket.emit("uploaded model", this.model);

          this.experience.scene.add(this.model.scene);
          this.scene.remove(this.model.scene);
          this.model = undefined;
        }
      },
      false
    );

    this.input.addEventListener(
      "change",
      (e) => {
        const reader = new FileReader();
        reader.readAsDataURL(this.input.files[0]);
        reader.onload = () => {
          this.gltfLoader.load(reader.result, (gltf) => {
            this.modelDataURL = reader.result;

            this.model = gltf;
            let box = new THREE.Box3().setFromObject(gltf.scene);
            let center = new THREE.Vector3();
            box.getCenter(center);
            gltf.scene.position.sub(center); // center the model
            gltf.scene.rotation.y = Math.PI; // rotate the model
            this.scene.add(gltf.scene);

            this.zoomfit(gltf.scene, this.camera);

            this.measureSize(gltf.scene);
          });
        };
      },
      false
    );

    this.clear.addEventListener(
      "click",
      () => {
        if (this.model) {
          this.scene.remove(this.model.scene);
          this.experience.scene.remove(this.model.scene);
        }
      },
      false
    );

    this.socket.on("model", (data) => {
      this.gltfLoader.load(data.dataURL, (gltf) => {
        let box = new THREE.Box3().setFromObject(gltf.scene);
        const sizeBox = box.getSize(new THREE.Vector3()).length();

        gltf.scene.scale.set(1 / sizeBox, 1 / sizeBox, 1 / sizeBox);
        gltf.scene.position.set(
          data.position.x,
          data.position.y,
          data.position.z
        );

        this.addRemoteModelCollision(0.5 / sizeBox, data.position);

        this.remoteModelsToUpdate.push({
          mesh: gltf.scene,
          body: this.modelBody,
        });

        this.experience.scene.add(gltf.scene);
      });
    });

    window.addEventListener("resize", () => {
      // Update sizes
      this.sizes.width = window.innerWidth / 1.8;
      this.sizes.height = window.innerHeight / 1.4;

      // Update camera
      this.camera.aspect = this.sizes.width / this.sizes.height;
      this.camera.updateProjectionMatrix();

      // Update renderer
      this.renderer.setSize(this.sizes.width / 1.4, this.sizes.height / 1.4);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    this.time.on("tick", () => {
      this.update();
    });

    this.controls = new OrbitControls(this.camera, this.canvas);
  }

  zoomfit(object3d, camera) {
    const box = new THREE.Box3().setFromObject(object3d);
    const sizeBox = box.getSize(new THREE.Vector3()).length();
    const centerBox = box.getCenter(new THREE.Vector3());
    const halfSizeModel = sizeBox * 1;
    const halfFov = THREE.Math.degToRad(camera.fov * 0.5);
    const distance = halfSizeModel / Math.tan(halfFov);

    const direction = new THREE.Vector3()
      .subVectors(camera.position, centerBox)
      .normalize();

    const position = direction.multiplyScalar(distance).add(centerBox);
    camera.position.copy(position);

    camera.near = sizeBox / 100;
    camera.far = sizeBox * 100;

    camera.updateProjectionMatrix();
    camera.lookAt(centerBox.x, centerBox.y, centerBox.z);
  }

  addLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024);
    directionalLight.shadow.camera.far = 15;
    directionalLight.shadow.camera.left = -7;
    directionalLight.shadow.camera.top = 7;
    directionalLight.shadow.camera.right = 7;
    directionalLight.shadow.camera.bottom = -7;
    directionalLight.position.set(-5, 5, 0);
    this.scene.add(directionalLight);
  }

  addArrowHelper() {
    const axesHelper = new THREE.AxesHelper(400);
    this.scene.add(axesHelper);
  }

  addCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.sizes.width / this.sizes.height,
      0.1,
      100
    );

    this.scene.add(this.camera);
  }

  loadModel() {
    this.gltfLoader.load("/client/Static/models/Fox/glTF/Fox.gltf", (gltf) => {
      let box = new THREE.Box3().setFromObject(gltf.scene);
      let center = new THREE.Vector3();
      box.getCenter(center);
      gltf.scene.position.sub(center); // center the model
      gltf.scene.rotation.y = Math.PI; // rotate the model
      this.scene.add(gltf.scene);

      this.zoomfit(gltf.scene, this.camera);
    });
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(this.sizes.width / 1.4, this.sizes.height / 1.4);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  clearScene() {}

  cleanMaterial(material) {
    material.dispose();

    for (const key of Object.keys(material)) {
      const value = material[key];
      if (value && typeof value === "object" && "minFilter" in value) {
        value.dispose();
      }
    }
  }

  measureSize(object) {
    let box = new THREE.Box3().setFromObject(object);
    this.sizeBox = box.getSize(new THREE.Vector3()).length();
  }

  addModelCollision(size) {
    this.modelShape = new CANNON.Box(new CANNON.Vec3(size, size, size));
    // this.modelShape = new CANNON.Sphere(size);
    this.modelBody = new CANNON.Body({
      mass: 0.2,
      shape: this.modelShape,
    });

    this.modelBody.position.set(
      this.foxLocal.model.position.x,
      this.foxLocal.model.position.y + 5,
      this.foxLocal.model.position.z
    );

    this.world.addBody(this.modelBody);
  }

  addRemoteModelCollision(size, position) {
    this.modelShape = new CANNON.Box(new CANNON.Vec3(size, size, size));
    // this.modelShape = new CANNON.Sphere(size);
    this.modelBody = new CANNON.Body({
      mass: 0.2,
      shape: this.modelShape,
    });

    this.modelBody.position.set(position.x, position.y + 5, position.z);

    this.world.addBody(this.modelBody);
  }

  update() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);

    if (this.modelsToUpdate.length > 0) {
      for (const object of this.modelsToUpdate) {
        object.mesh.position.copy(object.body.position);
        // object.mesh.quaternion.copy(object.body.quaternion);
      }
    }
    if (this.remoteModelsToUpdate.length > 0) {
      for (const object of this.remoteModelsToUpdate) {
        object.mesh.position.copy(object.body.position);
        // object.mesh.quaternion.copy(object.body.quaternion);
      }
    }
  }
}
