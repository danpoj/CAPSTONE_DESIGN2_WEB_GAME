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

    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath("/Static/draco/");
    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(this.dracoLoader);

    this.input = document.querySelector(".model_upload");

    this.scene.background = new THREE.Color(0x000000);

    this.sizes = {
      width: window.innerWidth / 1.8,
      height: window.innerHeight / 1.4,
    };

    this.addCamera();
    this.addLight();
    this.addArrowHelper();
    // this.loadModel();

    this.setRenderer();

    this.input.addEventListener(
      "change",
      (e) => {
        const reader = new FileReader();
        reader.readAsDataURL(this.input.files[0]);
        reader.onload = () => {
          this.gltfLoader.load(reader.result, (gltf) => {
            let box = new THREE.Box3().setFromObject(gltf.scene);
            let center = new THREE.Vector3();
            box.getCenter(center);
            gltf.scene.position.sub(center); // center the model
            gltf.scene.rotation.y = Math.PI; // rotate the model
            this.scene.add(gltf.scene);

            this.zoomfit(gltf.scene, this.camera);
          });
        };
      },
      false
    );

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

  update() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
