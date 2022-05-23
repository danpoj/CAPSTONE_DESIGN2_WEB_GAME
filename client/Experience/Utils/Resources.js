import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Experience from "../Experience.js";
import EventEmitter from "./EventEmitter.js";
import { gsap } from "../../node_modules/gsap/src/all.js";

export default class Resources extends EventEmitter {
  constructor(sources) {
    super();

    this.experience = new Experience();
    this.points = document.querySelector("div.point");
    this.loadingBar = document.querySelector(".loading-bar");
    this.loadingFox = document.querySelector(".loading_fox");
    this.editorContainer = document.querySelector("div.editor_container");
    this.editorCanvas = document.querySelector("canvas.editor");
    this.chatContainer = document.querySelector("div.chat_container");
    this.chatHideBar = document.querySelector("div.chat_container__hidebar");
    this.showBar = document.querySelector("div.chat_container__showbar");
    this.showEditor = document.querySelector("div.show_editor");
    this.addCubeBtn = document.querySelector("button.cube");
    this.removeCubeBtn = document.querySelector("button.cube_remove");
    this.addBowlingPinBtn = document.querySelector("button.bowling_pin");

    this.loadingProgress = this.experience.loadingProgress;
    this.sources = sources;

    this.loadingManager = new THREE.LoadingManager(
      // when loaded
      () => {
        gsap.delayedCall(0.5, () => {
          gsap.to(this.loadingProgress.overlayMaterial.uniforms.uAlpha, {
            delay: 1.2,
            duration: 2,
            value: 0,
          });
          this.loadingBar.classList.add("ended");
          this.loadingBar.style.transform = "";
          setTimeout(() => {
            this.loadingFox.classList.remove("visible_flex");
            // this.editorContainer.classList.add("visible_flex");
            // this.editorCanvas.classList.add("visible_flex");
            // this.chatContainer.classList.add("visible");
            this.showBar.classList.add("visible");
            this.showEditor.classList.remove("hide");
            this.addCubeBtn.classList.remove("hide");
            this.removeCubeBtn.classList.remove("hide");
            this.addBowlingPinBtn.classList.remove("hide");
            this.points.classList.remove("hide");
          }, 1000);
        });
      },
      // when progress
      (itemUrl, itemsLoaded, itemsTotal) => {
        const progressRatio = itemsLoaded / itemsTotal;
        this.loadingBar.style.transform = `scaleX(${progressRatio})`;
      }
    );

    this.items = {};
    this.toLoad = this.sources.length - 1;
    this.loaded = 0;

    this.setLoaders();
    this.startLoading();
  }

  setLoaders() {
    this.loaders = {};
    this.loaders.gltfLoader = new GLTFLoader(this.loadingManager);
    this.loaders.textureLoader = new THREE.TextureLoader(this.loadingManager);
    this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader(
      this.loadingManager
    );
  }

  startLoading() {
    // Load each source
    for (const source of this.sources) {
      // if (source.type === "gltfModel") {
      //   this.loaders.gltfLoader.load(source.path, (file) => {
      //     this.sourceLoaded(source, file);
      //   });
      // } else if (source.type === "texture") {
      //   this.loaders.textureLoader.load(source.path, (file) => {
      //     this.sourceLoaded(source, file);
      //   });
      // } else if (source.type === "cubeTexture") {
      //   this.loaders.cubeTextureLoader.load(source.path, (file) => {
      //     this.sourceLoaded(source, file);
      //   });
      if (source.type === "texture") {
        this.loaders.textureLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      } else if (source.type === "cubeTexture") {
        this.loaders.cubeTextureLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      }
    }
  }

  sourceLoaded(source, file) {
    this.items[source.name] = file;

    this.loaded++;

    if (this.loaded === this.toLoad) {
      this.trigger("ready");
    }
  }
}
