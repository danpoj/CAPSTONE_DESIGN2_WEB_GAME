import * as THREE from "three";

import Sizes from "./Utils/Sizes.js";
import Time from "./Utils/Time.js";
import Camera from "./Camera.js";
import Renderer from "./Renderer.js";
import World from "./World/World.js";
import Resources from "./Utils/Resources.js";
import FullScreen from "./Utils/FullScreen.js";

import sources from "./sources.js";

import { io } from "socket.io-client";
import Fox from "./World/Fox.js";
import FoxLocal from "./World/FoxLocal.js";
import Audio from "./World/Audio.js";

import Chat from "./Chat.js";
import FPS from "./Utils/FPS.js";
import LoadingProgress from "../LoadingProgress.js";
import Square from "./World/Square.js";
import Editor from "./Editor.js";
import Bowling from "./World/Bowling.js";
import Mirror from "./World/Mirror.js";

let instance = null;

export default class Experience {
  constructor(_canvas) {
    // Singleton
    if (instance) {
      return instance;
    }
    instance = this;

    // Global access
    window.experience = this;

    // Options
    this.canvas = _canvas;

    this.socket = io("https://cd2-webgame.herokuapp.com/");
    // this.socket = io("http://localhost:3001");

    this.socket.on("connect", () => {});

    // Setup
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();
    this.loadingProgress = new LoadingProgress();
    this.resources = new Resources(sources);
    this.camera = new Camera();
    this.renderer = new Renderer();
    this.world = new World();
    this.fullscreen = new FullScreen();
    this.fps = new FPS();

    this.foxLocal = new FoxLocal();

    this.audio = new Audio();
    this.chat = new Chat();
    // this.audio2 = new Audio2();

    this.square = new Square();
    this.bowling = new Bowling();
    this.mirror = new Mirror();

    this.editor = new Editor();

    this.scene.background = new THREE.Color(0x050505);
    // this.scene.background = new THREE.Color(0x111111);
    // values
    this.rplayer = [];
    this.addedListID = [];

    // Resize event
    this.sizes.on("resize", () => {
      this.resize();
    });

    // Time tick event
    this.time.on("tick", () => {
      this.update();
    });

    this.foxLocal.on("playerReady", () => {
      this.socket.emit("init", {
        username: this.foxLocal.userName,
        x: this.foxLocal.model.position.x,
        y: this.foxLocal.model.position.y,
        z: this.foxLocal.model.position.z,
        rotation: this.foxLocal.model.rotation,
        anim: "idle",
      });
    });

    this.socket.on("setId", (data) => {
      this.id = data.id;
    });

    this.socket.on("remoteData", (remotePlayer) => {
      // console.log(remotePlayer);
      for (let data of remotePlayer) {
        if (
          this.id !== undefined &&
          data.id !== this.id &&
          this.isAdded(data.id) === false &&
          this.rplayer.length < remotePlayer.length - 1
        ) {
          this.rplayer.push(
            new Fox(
              data.name,
              data.id,
              data.x,
              data.y,
              data.z,
              data.rotation,
              data.anim
            )
          );
          this.addedListID.push(data.id);
        }
      }
      // console.log(remotePlayer);
    });

    this.socket.on("deletePlayer", (data) => {
      for (let i = 0; i < this.rplayer.length; i++) {
        if (this.rplayer[i].id === data.id) {
          this.scene.remove(this.rplayer[i].sprite_);
          this.scene.remove(this.rplayer[i].model);
          this.rplayer.splice(i, 1);
          i--;
        }
      }
    });
  }

  isAdded(dataID) {
    for (let id of this.addedListID) {
      if (id === dataID) {
        return true;
      }
    }

    return false;
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  update() {
    this.bowling.update();

    // if (this.square.duck) {
    //   this.square.rotateDuck();
    // }
    this.fps.updateBegin();

    this.camera.update();
    this.world.update();
    this.renderer.update();

    if (this.foxLocal._controls) {
      this.foxLocal.update();

      // this.meshwalk.tpsCameraControls.update();

      // this.thirdPersonCamera.update();
    }
    // console.log(this.rplayer);

    for (let i = 0; i < this.rplayer.length; i++) {
      this.rplayer[i].update();
    }

    // this.thirdPersonCamera.update();
    this.fps.updateEnd();
  }

  destroy() {
    // this.sizes.off("resize");
    // this.time.off("tick");

    // Traverse the whole scene
    this.scene.traverse((child) => {
      // Test if it's a mesh
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();

        // Loop through the material properties
        for (const key in child.material) {
          const value = child.material[key];

          // Test if there is a dispose function
          if (value && typeof value.dispose === "function") {
            value.dispose();
          }
        }
      }
    });

    // this.camera.controls.dispose();
    // this.renderer.instance.dispose();
  }

  initSocket() {
    //console.log("PlayerLocal.initSocket");
  }

  addRemotePlayer() {}
}
