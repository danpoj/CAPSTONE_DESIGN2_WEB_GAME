import * as THREE from "three";
import Experience from "../Experience.js";
import MeshWalk from "../MeshWalk.js";
import EventEmitter from "../Utils/EventEmitter.js";
import FoxControl from "./FoxControl.js";

export default class FoxLocal extends EventEmitter {
  constructor(id) {
    super();
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.time = this.experience.time;
    this._camera = this.experience.camera.instance;

    // Resource

    // values
    this.id = id;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.anim = "idle";

    this.setModel();

    this.experience.socket.on("user name", (name) => {
      this.userName = name;
      this.CreateSprite(this.userName);
    });
  }

  CreateSprite(name) {
    this.element_ = document.createElement("canvas");
    this.context2d_ = this.element_.getContext("2d");
    this.context2d_.canvas.width = window.innerWidth;
    this.context2d_.canvas.height = window.innerHeight;
    this.context2d_.fillStyle = "#fff";
    this.context2d_.font = "60pt Helvetica";
    this.context2d_.shadowOffsetX = 3;
    this.context2d_.shadowOffsetY = 3;
    this.context2d_.shadowColor = "rgba(0,0,0,0.3)";
    this.context2d_.shadowBlur = 4;
    this.context2d_.textAlign = "center";
    this.context2d_.fillText(name, 400, 200);

    const map = new THREE.CanvasTexture(this.context2d_.canvas);

    this.sprite_ = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: map, color: 0xffffff })
    );
    this.sprite_.scale.set(2, 2, 1);
    // this.sprite_.position.y += modelData.nameOffset;
    this.experience.scene.add(this.sprite_);
    // console.log(this.sprite_);
  }

  setModel() {
    this.resources.loaders.gltfLoader.load(
      "./Static/models/Fox/glTF/Fox.gltf",
      (file) => {
        this.resource = file;
        this.model = file.scene;
        this.model.position.set(
          Math.random() * 6 - 3,
          0,
          Math.random() * 6 - 3
        );
        this.model.scale.set(0.01, 0.01, 0.01);

        this.model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
          }
        });

        const params = {
          target: this.model,
          camera: this._camera,
        };
        this._controls = new FoxControl(params);

        this.scene.add(this.model);

        this.setAnimation();

        this.meshwalk = new MeshWalk();
      }
    );

    // this.model.position.set(Math.random() * 3, 0, Math.random() * 3);
    this.trigger("playerReady");
  }

  setAnimation() {
    this.animation = {};

    // Mixer
    this.animation.mixer = new THREE.AnimationMixer(this.model);

    // Actions
    this.animation.actions = {};

    this.animation.actions.idle = this.animation.mixer.clipAction(
      this.resource.animations[0]
    );
    this.animation.actions.walking = this.animation.mixer.clipAction(
      this.resource.animations[1]
    );
    this.animation.actions.running = this.animation.mixer.clipAction(
      this.resource.animations[2]
    );

    this.animation.actions.current = this.animation.actions.idle;
    this.animation.actions.current.play();

    const idleAnim = this.animation.actions.idle;
    idleAnim.play();

    // Play the action
    this.animation.play = (name) => {
      const newAction = this.animation.actions[name];
      const oldAction = this.animation.actions.current;

      newAction.reset();
      newAction.play();
      newAction.crossFadeFrom(oldAction, 1);

      this.animation.actions.current = newAction;
    };
  }

  animBlending() {
    if (this._controls._move.forward) {
      if (this.animation.actions.current === this.animation.actions.idle) {
        this.animation.actions.walking.reset();
        this.animation.actions.walking.play();
        this.animation.actions.walking.crossFadeFrom(
          this.animation.actions.current,
          0.5
        );
        this.animation.actions.current = this.animation.actions.walking;
      }
      if (
        this.animation.actions.current === this.animation.actions.walking &&
        this._controls._move.shift
      ) {
        this.animation.actions.running.reset();
        this.animation.actions.running.play();
        this.animation.actions.running.crossFadeFrom(
          this.animation.actions.current,
          0.5
        );
        this.animation.actions.current = this.animation.actions.running;
      }
    } else if (!this._controls._move.forward) {
      this.animation.actions.idle.reset();
      this.animation.actions.idle.play();
      this.animation.actions.idle.crossFadeFrom(
        this.animation.actions.current,
        0.5
      );
      this.animation.actions.current = this.animation.actions.idle;
    }
  }

  // -3 -1
  // -0.8 4
  // 4 1.6
  // 2 -3

  update() {
    if (this._controls) {
      // update meshwalk camera
      this.meshwalk.update();

      this.animBlending();

      if (this.animation.actions.current === this.animation.actions.idle) {
        this.anim = "idle";
      } else if (
        this.animation.actions.current === this.animation.actions.walking
      ) {
        this.anim = "walking";
      } else if (
        this.animation.actions.current === this.animation.actions.running
      ) {
        this.anim = "running";
      }

      // console.log(this.anim);

      // character floating name
      if (this.sprite_) {
        this.sprite_.position.set(
          this.model.position.x,
          this.model.position.y + 1,
          this.model.position.z
        );
      }

      this.experience.socket.emit("update", {
        x: this.model.position.x,
        y: this.model.position.y,
        z: this.model.position.z,
        rotation: this.model.rotation,
        anim: this.anim,
      });

      if (!this._controls._move.shift) {
        this.animation.mixer.update(this.time.delta * 0.00085);
        this._controls.Update(this.time.delta * 0.00025);
      } else {
        this.animation.mixer.update(this.time.delta * 0.0015);
        this._controls.Update(this.time.delta * 0.0005);
      }
    }
  }
}
