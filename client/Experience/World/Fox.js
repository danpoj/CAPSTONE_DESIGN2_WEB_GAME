import * as THREE from "three";
import Experience from "../Experience.js";
import EventEmitter from "../Utils/EventEmitter.js";
import FoxControl from "./FoxControl.js";

export default class Fox extends EventEmitter {
  constructor(name, id, x, y, z, rotation, anim) {
    super();
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.time = this.experience.time;
    this._camera = this.experience.camera.instance;

    setTimeout(() => {
      this.world = this.experience.bowling.world;
      this.addFoxRemoteCollision();
    }, 10000);

    // Resource

    // values
    this.userName = name;
    this.id = id;
    this.x = x;
    this.y = y;
    this.z = z;
    this.rotation = rotation;
    this.anim = anim;
    this.isAddedInRplayer = false;

    this.mixer = null;

    this.setModel();

    this.CreateSprite(this.userName);

    // for (let data of remotePlayer) {
    //   if (data.id === this.id) {
    //     this.userName = data.name;
    //     console.log(this.userName);
    //   }
    // }

    this.experience.socket.on("remoteData", (remotePlayer) => {
      for (let data of remotePlayer) {
        if (data.id === this.id) {
          this.x = data.x;
          this.y = data.y;
          this.z = data.z;
          this.rotation = data.rotation;
          this.anim = data.anim;
        }
      }

      if (this.model) {
        this.model.position.set(this.x, this.y, this.z);

        if (this.rotation) {
          this.model.rotation.set(
            this.rotation._x,
            this.rotation._y,
            this.rotation._z
          );
        }

        if (this.anim === "idle") {
          this.animation.play("idle");
        } else if (this.anim === "walking") {
          this.animation.play("walking");
        } else if (this.anim === "running") {
          this.animation.play("running");
        }
      }
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
  }

  setModel() {
    this.resources.loaders.gltfLoader.load(
      "./Static/models/Girl/animeGirl.glb",
      (file) => {
        this.resource = file;
        this.model = file.scene;
        // this.model.position.set(
        //   Math.random() * 6 - 3,
        //   0,
        //   Math.random() * 6 - 3
        // );
        this.model.position.set(
          20 + Math.sin(Math.random() * 10) * 2,
          -0.3,
          -20 + Math.sin(Math.random() * 10) * 2
        );
        this.model.scale.set(0.008, 0.008, 0.008);

        this.model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
          }
        });

        this.scene.add(this.model);

        // this.mixer = new THREE.AnimationMixer(file.scene);
        // const action = this.mixer.clipAction(file.animations[0]);
        // action.play();

        this.setAnimation();
      }
    );

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

    // Play the action
    this.animation.play = (name) => {
      const newAction = this.animation.actions[name];
      const oldAction = this.animation.actions.current;

      if (newAction !== oldAction) {
        newAction.reset();
        newAction.play();
        newAction.crossFadeFrom(oldAction, 1);
      }

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

  addFoxRemoteCollision() {
    this.foxShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.8, 0.5));
    this.foxBody = new CANNON.Body({
      mass: 0.8,
      shape: this.foxShape,
    });
    // this.foxBody.position.set(
    //   this.model.position.x,
    //   this.model.position.y,
    //   this.model.position.z
    // );
    this.world.addBody(this.foxBody);
  }

  update() {
    if (this.model) {
      this.sprite_.position.set(
        this.model.position.x,
        this.model.position.y,
        this.model.position.z
      );

      if (this.model && this.foxBody) {
        this.foxBody.position.copy(this.model.position);
      }
    }

    if (this.animation) {
      if (this.anim === "running") {
        this.animation.mixer.update(this.time.delta * 0.0015);
      } else if (this.anim === "idle" || this.anim === "walking") {
        this.animation.mixer.update(this.time.delta * 0.00085);
      }
    }
  }
}
