import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";
import * as CANNON from "cannon-es";
import gsap from "gsap";
import CircleProgress from "js-circle-progress";
import axios from "axios";
import CannonUtils from "./cannon/cannonUtils";

const SERVER_ENDPOINT = import.meta.env.VITE_SERVER_ENDPOINT;
//circle progress bar
const play = (isDemo, publicKey = "") => {
  const cp = new CircleProgress({
    min: 0,
    max: 100,
    value: 0,
    textFormat: "percent",
  });
  cp.style.top = "45%";
  cp.style.left = "47%";
  cp.style.position = "absolute";
  document.body.append(cp);

  const text = document.createElement("p");
  text.style.fontSize = "36px";
  text.style.color = "white";
  text.style.fontFamily = "Monospace";
  text.innerHTML = "Click to play";

  const instructions = document.createElement("div");
  instructions.style.width = "100%";
  instructions.style.height = "100%";
  instructions.style.display = "flex";
  instructions.style.flexDirection = "column";
  instructions.style.alignItems = "center";
  instructions.style.justifyContent = "center";
  instructions.style.textAlign = "center";
  instructions.style.cursor = "pointer";
  instructions.append(text);

  const blocker = document.createElement("div");
  blocker.style.position = "absolute";
  blocker.style.width = "100%";
  blocker.style.height = "100%";
  blocker.style.top = "0px";
  blocker.style.left = "0px";
  blocker.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  blocker.append(instructions);

  const scoreLabel = document.createElement("img");
  scoreLabel.src = "images/score.gif";
  scoreLabel.style.paddingBottom = "8px";
  scoreLabel.width = 100;

  const score = document.createElement("p");
  score.append("0");

  const scoreDiv = document.createElement("div");
  scoreDiv.style.display = "flex";
  scoreDiv.style.justifyContent = "center";
  scoreDiv.style.alignItems = "center";
  scoreDiv.append(scoreLabel);
  scoreDiv.append(score);

  const timer = document.createElement("div");
  timer.style.fontSize = "28px";
  timer.style.color = "white";
  timer.style.fontFamily = "Monospace";
  timer.innerHTML = "30:00";

  const scoreBoard = document.createElement("div");
  scoreBoard.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  scoreBoard.style.position = "fixed";
  scoreBoard.style.top = "0px";
  scoreBoard.style.right = "0px";
  scoreBoard.style.display = "flex";
  scoreBoard.style.flexDirection = "column";
  scoreBoard.style.justifyContent = "center";
  scoreBoard.style.alignItems = "center";
  scoreBoard.style.height = "100px";
  scoreBoard.style.width = "200px";
  scoreBoard.style.border = "1px solid gray";
  scoreBoard.style.textAlign = "center";
  scoreBoard.style.pointerEvents = "none";
  scoreBoard.style.fontSize = "24px";
  scoreBoard.style.color = "white";
  scoreBoard.style.fontFamily = "Monospace";
  scoreBoard.append(timer);
  scoreBoard.append(scoreDiv);

  const plusText = document.createElement("img");
  plusText.style.position = "absolute";
  //plusText.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
  plusText.style.width = "100px";
  plusText.src = "images/plus.png";
  plusText.style.top = "40%";
  plusText.style.left = "50%";
  plusText.style.transform = "translate(-50%, -50%)";
  plusText.style.visibility = "hidden";
  plusText.style.transition = "all 0.5s ease";
  document.body.appendChild(plusText);

  const congratulation = document.createElement("img");
  congratulation.src = "images/congratulations.png";
  congratulation.style.width = "50%";
  congratulation.style.display = "none";
  congratulation.style.transition = "all 0.5s ease";
  instructions.append(congratulation);

  const youEarned = document.createElement("div");
  youEarned.style.width = "60%";
  youEarned.style.fontSize = "4vw";
  youEarned.style.fontWeight = "Bold";
  youEarned.style.display = "none";
  youEarned.style.paddingBottom = "20px";
  youEarned.innerHTML = "You earned 90 SOFT COQ INU";
  instructions.append(youEarned);

  const returnButton = document.createElement("div");
  returnButton.style.display = "none";
  returnButton.classList.add("Btn");

  returnButton.innerHTML = "Return to Menu";
  instructions.append(returnButton);

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("draco/");
  const gltfLoader = new GLTFLoader();
  gltfLoader.crossOrigin = true;
  gltfLoader.setDRACOLoader(dracoLoader);
  let walk: gsap.core.Tween;
  let crash = false;

  const positions = [
    {
      x1: -1.5,
      x2: 1.5,
      z1: -81,
      z2: 81,
    },
    {
      x1: 63,
      x2: 67,
      z1: -81,
      z2: 81,
    },
    {
      x1: -67,
      x2: -63,
      z1: -81,
      z2: 81,
    },
    {
      x1: -67,
      x2: 67,
      z1: 77,
      z2: 81,
    },
    {
      x1: -67,
      x2: 67,
      z1: -2,
      z2: 1,
    },
    {
      x1: -67,
      x2: 67,
      z1: -81,
      z2: -77,
    },
  ];

  gltfLoader.load(
    "models/map.glb",
    (gltf) => {
      let finished = false;
      let clicked = true; // navigate click event
      let min = 30;
      let sec = 0;
      const scene = new THREE.Scene();
      // scene.fog = new THREE.Fog('#60a3e0', 1, 100)

      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.set(0, 7, -2);
      scene.add(camera);

      const bgTexture = new THREE.TextureLoader().load("images/background.jpg");
      scene.background = bgTexture;
      scene.environment = bgTexture;

      const aLight = new THREE.AmbientLight(0xffffff);
      scene.add(aLight);

      const directionalLight = new THREE.DirectionalLight(0xffff00, 1);
      directionalLight.position.set(100, 100, 100);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2 * 2048;
      directionalLight.shadow.mapSize.height = 2 * 2048;
      directionalLight.shadow.camera.near = 0.1;
      directionalLight.shadow.camera.far = 500;
      directionalLight.shadow.camera.top = 500;
      directionalLight.shadow.camera.right = 500;
      directionalLight.shadow.camera.bottom = -500;
      directionalLight.shadow.camera.left = -500;
      scene.add(directionalLight);

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setClearColor("#60a3e0");
      renderer.useLegacyLights = true; // this option is to load light embed on glb file.
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.VSMShadowMap; // PCFShadowMap
      document.body.appendChild(renderer.domElement);

      returnButton.addEventListener("click", () => {
        window.location.reload();
        return true;
      });

      const raycaster = new THREE.Raycaster();
      const world = new CANNON.World();
      world.gravity.set(0, -9.82, 0);

      const groundMaterial = new CANNON.Material("groundMaterial");
      const slipperyMaterial = new CANNON.Material("slipperyMaterial");
      const slippery_ground_cm = new CANNON.ContactMaterial(
        groundMaterial,
        slipperyMaterial,
        {
          friction: 0,
          restitution: 0,
          contactEquationStiffness: 1e8,
          contactEquationRelaxation: 3,
        }
      );

      let egg;
      const eggBody = new CANNON.Body({ mass: 0, material: slipperyMaterial });
      const eggShape = new CANNON.Sphere(0.5);
      eggBody.addShape(eggShape, new CANNON.Vec3(0, 1, 0));
      eggBody.linearDamping = 0.95;

      let npc;
      const npcBody = new CANNON.Body({ mass: 0, material: slipperyMaterial });
      const npcShape = new CANNON.Sphere(1.0);
      npcBody.addShape(npcShape, new CANNON.Vec3(0, 1.0, 0));
      npcBody.linearDamping = 0.95;

      const npcBodyClone = [];
      const npcShapeClone = [];
      const npcPos = [];
      for (let i = 0; i < 12; i++) {
        npcBodyClone[i] = new CANNON.Body({
          mass: 0,
          material: slipperyMaterial,
        });

        npcShapeClone[i] = new CANNON.Sphere(1.0);
        npcBodyClone[i].addShape(npcShapeClone[i], new CANNON.Vec3(0, 1.0, 0));
        npcBodyClone[i].linearDamping = 0.95;
      }

      gltfLoader.load("models/egg.glb", (gltf) => {
        gltf.scene.traverse(function (child) {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        egg = gltf.scene;
        egg.children[0].scale.set(10, 10, 10);
        egg.children[0].position.set(0, 0.3, 18);
        scene.add(egg);

        eggBody.position.set(0, 0.3, 18);
        world.addBody(eggBody);
      });

      let count = 0;

      world.addContactMaterial(slippery_ground_cm);
      (world.solver as CANNON.GSSolver).iterations = 10;
      // Character Collider
      const characterCollider = new THREE.Object3D();
      const colliderShape = new CANNON.Sphere(0.5);
      const colliderBody = new CANNON.Body({
        mass: 1,
        material: slipperyMaterial,
      });

      let mixer: THREE.AnimationMixer;
      let modelReady = false;
      let modelMesh: THREE.Object3D;
      let targetMesh: THREE.Intersection;

      const animationActions: THREE.AnimationAction[] = [];
      let activeAction: THREE.AnimationAction;
      let lastAction: THREE.AnimationAction;

      const mapModel = gltf.scene;
      scene.add(mapModel);

      const video = document.createElement("video");
      video.src = "videos/video.mp4";
      video.crossOrigin = "anonymous";
      video.loop = true;
      // video.muted = false
      video.play();
      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.wrapS = THREE.MirroredRepeatWrapping;
      videoTexture.wrapT = THREE.MirroredRepeatWrapping;

      const videoMesh1 = mapModel.getObjectByName("poster1");
      videoMesh1.material.map = videoTexture;
      videoMesh1.material.side = THREE.FrontSide;
      videoMesh1.material.needsUpdate = true;

      const videoMesh2 = mapModel.getObjectByName("poster2");
      videoMesh2.material.map = videoTexture;
      videoMesh2.material.side = THREE.FrontSide;
      videoMesh2.material.needsUpdate = true;

      const videoMesh3 = mapModel.getObjectByName("poster3");
      videoMesh3.material.map = videoTexture;
      videoMesh3.material.side = THREE.FrontSide;
      videoMesh3.material.needsUpdate = true;

      const videoMesh4 = mapModel.getObjectByName("poster4");
      videoMesh4.material.map = videoTexture;
      videoMesh4.material.side = THREE.DoubleSide;
      videoMesh4.material.needsUpdate = true;

      const alink = scene.getObjectByName("alink")! as THREE.Mesh;
      alink.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      gltf.scene.traverse(function (child) {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
        if (
          child.name == "Ground" ||
          child.name == "Rectangle009" ||
          child.name == "B_basis" ||
          child.name == "Rectangle010" ||
          child.name == "Rectangle015" ||
          child.name == "Rectangle001" ||
          child.name == "Rectangle025" ||
          child.name == "Rectangle019" ||
          child.name == "Rectangle032" ||
          child.name == "Rectangle029" ||
          child.name == "Rectangle026" ||
          child.name == "Rectangle027" ||
          child.name == "Rectangle008" ||
          child.name == "Rectangle003" ||
          child.name == "Rectangle012" ||
          child.name == "Rectangle011" ||
          child.name == "Rectangle019"
        ) {
          const cityBody = new CANNON.Body({
            mass: 0,
            material: groundMaterial,
          });
          const cityMesh = child;
          const position = new THREE.Vector3();
          cityMesh.getWorldPosition(position);

          const cityShape = CannonUtils.CreateTrimesh(
            (cityMesh as THREE.Mesh).geometry
          );
          cityBody.position.x = position.x;
          cityBody.position.y = position.y;
          cityBody.position.z = position.z;
          cityBody.addShape(cityShape);
          world.addBody(cityBody);
        }
      });

      gltfLoader.load("models/npc.glb", (gltf) => {
        gltf.scene.traverse(function (child) {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        npc = gltf.scene;
        npc.children[0].scale.set(1, 1, 1);
        npc.children[0].position.set(0, 0, 38);
        npc.children[0].rotation.x = Math.PI * 2;
        npc.children[0].rotation.y = Math.PI;
        npcBody.position.set(0, 0, 38);
        npcPos.push([0, 0, 38]);
        scene.add(npc);
        world.addBody(npcBody);

        // Assuming you have initialized your scene, world, positions, npc, slipperyMaterial, and SkeletonUtils

        for (let i = 0; i < 12; i++) {
          const road = positions[Math.floor(i / 2)];
          const newX = Math.random() * (road.x2 - road.x1) + road.x1;
          const newZ = Math.random() * (road.z2 - road.z1) + road.z1;

          const cloneNpc = SkeletonUtils.clone(npc);
          cloneNpc.children[0].scale.set(1, 1, 1);
          cloneNpc.children[0].position.set(newX, 0, newZ);

          npcBodyClone[i].position.set(newX, 0, newZ);
          npcPos.push([newX, 0, newZ]);
          scene.add(cloneNpc);
          world.addBody(npcBodyClone[i]);
        }
      });

      gltfLoader.load(
        "models/chicken.glb",
        (gltf) => {
          gltf.scene.traverse(function (child) {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          const avatar = gltf.scene;

          avatar.children[0].scale.set(0.1, 0.1, 0.1);
          avatar.children[0].position.set(0, 1.72, 0);
          avatar.castShadow = true;
          avatar.receiveShadow = true;

          const orbitControls = new OrbitControls(camera, renderer.domElement);
          orbitControls.enableDamping = true;
          orbitControls.dampingFactor = 0.05;
          orbitControls.minPolarAngle = Math.PI / 3;
          orbitControls.maxPolarAngle = Math.PI / 3;
          orbitControls.enableZoom = false;
          orbitControls.enabled = false;

          mixer = new THREE.AnimationMixer(gltf.scene);
          animationActions.push(mixer.clipAction(gltf.animations[2]));
          animationActions.push(mixer.clipAction(gltf.animations[1]));

          activeAction = animationActions[0];
          activeAction.loop = THREE.LoopRepeat;
          activeAction.play();
          scene.add(avatar);
          modelMesh = gltf.scene;
          modelMesh.add(camera);

          const creatCollider = () => {
            characterCollider.position.x = 0;
            characterCollider.position.y = 3;
            characterCollider.position.z = 0;
            scene.add(characterCollider);

            colliderBody.addShape(colliderShape, new CANNON.Vec3(0, -0.5, 0));
            colliderBody.position.set(
              characterCollider.position.x,
              characterCollider.position.y,
              characterCollider.position.z
            );
            colliderBody.linearDamping = 0.95;
            colliderBody.angularFactor.set(0, 1, 0); // prevents rotation X,Z axis
            world.addBody(colliderBody);

            gsap.to(camera.position, { x: 0, y: 5, z: -20, duration: 2 });
          };

          // Add a variable to track whether the mouse or keyboard control is active
          let controlActive = "none"; // can be 'none', 'mouse', or 'keyboard'

          const setAction = (
            toAction: THREE.AnimationAction,
            loop: boolean
          ) => {
            if (toAction != activeAction) {
              lastAction = activeAction;
              activeAction = toAction;
              lastAction.fadeOut(0.1);
              activeAction.reset();
              activeAction.fadeIn(0.2);
              activeAction.play();
              if (!loop) {
                activeAction.clampWhenFinished = true;
                activeAction.loop = THREE.LoopOnce;
              }
            }
          };
          modelReady = true;

          creatCollider();

          const mouse = new THREE.Vector2();

          window.addEventListener(
            "mousedown",
            (event) => {
              event.preventDefault();

              if (!clicked) {
                if (controlActive === "keyboard") return;
                // Set the mouse coordinates (normalized between -1 and 1)
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

                // Set the origin of the raycaster to the camera position
                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObjects(scene.children);
                if (intersects.length > 0) {
                  if (
                    intersects[0].object.name == "Ground" ||
                    intersects[0].object.name == "Rectangle010" ||
                    intersects[0].object.name == "Rectangle015" ||
                    intersects[0].object.name == "Rectangle001" ||
                    intersects[0].object.name == "Rectangle025" ||
                    intersects[0].object.name == "Object_2"
                  ) {
                    //mouse pointer mesh
                    crash = false;
                    targetMesh = intersects[0];

                    if (walk) walk.kill();
                    const targetMeshPoint = new CANNON.Vec3(
                      targetMesh.point.x,
                      targetMesh.point.y,
                      targetMesh.point.z
                    );
                    distance =
                      colliderBody.position.distanceTo(targetMeshPoint);

                    walk = gsap.to(colliderBody.position, {
                      x: targetMesh.point.x,
                      // y: targetMesh.point.y,
                      z: targetMesh.point.z,
                      duration: distance / 2,
                      onComplete: () => {
                        clicked = false;
                      },
                    });

                    //mouse pointer mesh
                    const ringGeometry = new THREE.RingGeometry(0.1, 0.2);
                    // Define the material
                    const material = new THREE.MeshBasicMaterial({
                      color: "#ff66cc",
                      side: THREE.DoubleSide,
                    });
                    // Create the mesh
                    const ringMesh = new THREE.Mesh(ringGeometry, material);
                    ringMesh.rotation.x = Math.PI / 2;
                    ringMesh.position.set(
                      targetMesh.point.x,
                      targetMesh.point.y,
                      targetMesh.point.z
                    );
                    scene.add(ringMesh);
                    gsap.to(ringMesh.scale, {
                      x: 0,
                      y: 0,
                      z: 0,
                      duration: 1,
                    });
                  }
                }
                controlActive = "mouse";
              }
              // Explicitly set focus back to the window if it's lost
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }
              window.focus();
            },
            false
          );

          let keyUp = false;
          let keyDown = false;
          let keyLeft = false;
          let keyRight = false;

          window.addEventListener(
            "keydown",
            (event) => {
              event.preventDefault();

              if (!finished) {
                if (controlActive === "mouse") return;
                if (walk) {
                  walk.kill();
                }
                switch (event.key) {
                  case "ArrowUp":
                    keyUp = true;
                    break;
                  case "ArrowDown":
                    keyDown = true;
                    break;
                  case "ArrowLeft":
                    keyLeft = true;
                    break;
                  case "ArrowRight":
                    keyRight = true;
                    break;
                }
                controlActive = "keyboard";
              }
            },
            false
          );

          window.addEventListener(
            "keyup",
            (event) => {
              event.preventDefault();
              switch (event.key) {
                case "ArrowUp":
                  keyUp = false;
                  break;
                case "ArrowDown":
                  keyDown = false;
                  break;
                case "ArrowLeft":
                  keyLeft = false;
                  break;
                case "ArrowRight":
                  keyRight = false;
                  break;
              }
              setAction(animationActions[0], true);
              if (!keyUp && !keyDown && !keyLeft && !keyRight) {
                controlActive = "none";
              }
            },
            false
          );

          window.addEventListener("wheel", (event) => {
            event.preventDefault();

            // Adjust the camera's zoom based on the deltaY value of the event
            camera.position.z -= event.deltaY * 0.02;
            camera.position.x = 0;
            if (camera.position.z > 10) camera.position.z = 10;
            else if (camera.position.z < -10) camera.position.z = -10;
            else if (camera.position.z < 2 && camera.position.z > 0)
              camera.position.z = 2;
            else if (camera.position.z > -2 && camera.position.z < 0)
              camera.position.z = -2;
            render(); // Make sure to call render to update the scene after adjusting the zoom
          });

          window.addEventListener("resize", onWindowResize, false);

          function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            render();
          }

          const targetQuaternion = new THREE.Quaternion();
          const clock = new THREE.Clock();
          let delta = 0;
          let distance = 0;

          const rotationSpeed = (Math.PI / 180) * 5;
          const rotationAxis = new THREE.Vector3(0, 1, 0); // Rotate around the y-axis

          function animate() {
            requestAnimationFrame(animate);
            // If there's a key pressed, handle keyboard control
            if (keyUp || keyDown || keyLeft || keyRight) {
              // Allow keyboard control to proceed
              controlActive = "keyboard";
            }
            // release the control lock
            if (
              !keyUp &&
              !keyDown &&
              !keyLeft &&
              !keyRight &&
              controlActive === "keyboard"
            ) {
              controlActive = "none";
            }

            if (modelReady) {
              const currentDirectionQuaternion = new THREE.Vector3(
                0,
                0,
                1
              ).applyQuaternion(modelMesh.quaternion);
              if (controlActive === "keyboard") {
                if (keyLeft) {
                  const deltaLeftRotation =
                    new THREE.Quaternion().setFromAxisAngle(
                      rotationAxis,
                      rotationSpeed
                    );
                  targetQuaternion.multiplyQuaternions(
                    deltaLeftRotation,
                    targetQuaternion
                  );
                } else if (keyRight) {
                  const deltaRotation = new THREE.Quaternion().setFromAxisAngle(
                    rotationAxis,
                    -rotationSpeed
                  );
                  targetQuaternion.multiplyQuaternions(
                    deltaRotation,
                    targetQuaternion
                  );
                } else if (keyUp) {
                  let flag = false;
                  for (let i = 0; i < 6; i++) {
                    if (
                      positions[i].x1 <
                        colliderBody.position.x +
                          4 * currentDirectionQuaternion.x * delta &&
                      positions[i].x2 >
                        colliderBody.position.x +
                          4 * currentDirectionQuaternion.x * delta &&
                      positions[i].z1 <
                        colliderBody.position.z +
                          4 * currentDirectionQuaternion.z * delta &&
                      positions[i].z2 >
                        colliderBody.position.z +
                          4 * currentDirectionQuaternion.z * delta
                    ) {
                      flag = true;
                      break;
                    }
                  }
                  if (flag)
                    colliderBody.position.set(
                      colliderBody.position.x +
                        4 * currentDirectionQuaternion.x * delta,
                      colliderBody.position.y,
                      colliderBody.position.z +
                        4 * currentDirectionQuaternion.z * delta
                    );
                } else if (keyDown) {
                  let flag = false;
                  for (let i = 0; i < 6; i++) {
                    if (
                      positions[i].x1 <
                        colliderBody.position.x -
                          4 * currentDirectionQuaternion.x * delta &&
                      positions[i].x2 >
                        colliderBody.position.x -
                          4 * currentDirectionQuaternion.x * delta &&
                      positions[i].z1 <
                        colliderBody.position.z -
                          4 * currentDirectionQuaternion.z * delta &&
                      positions[i].z2 >
                        colliderBody.position.z -
                          4 * currentDirectionQuaternion.z * delta
                    ) {
                      flag = true;
                      break;
                    }
                  }
                  if (flag)
                    colliderBody.position.set(
                      colliderBody.position.x -
                        4 * currentDirectionQuaternion.x * delta,
                      colliderBody.position.y,
                      colliderBody.position.z -
                        4 * currentDirectionQuaternion.z * delta
                    );
                }
                if (!modelMesh.quaternion.equals(targetQuaternion)) {
                  modelMesh.quaternion.rotateTowards(
                    targetQuaternion,
                    delta * 10
                  );
                }
                modelMesh.position.lerp(characterCollider.position, 0.1);
              }

              if (distance >= 1 || keyUp || keyDown || keyLeft || keyRight) {
                setAction(animationActions[1], true);
                mixer.update(delta);
              } else {
                setAction(animationActions[0], true);
                mixer.update(delta);
              }
              const p = characterCollider.position;
              p.y -= 1;
              modelMesh.position.y = characterCollider.position.y;
              const rotationMatrix = new THREE.Matrix4();

              if (targetMesh && controlActive === "mouse") {
                const targetMeshPoint = new CANNON.Vec3(
                  targetMesh.point.x,
                  targetMesh.point.y,
                  targetMesh.point.z
                );
                distance = colliderBody.position.distanceTo(targetMeshPoint);
                if (distance > 1) {
                  if (targetMesh && !crash) {
                    rotationMatrix.lookAt(p, modelMesh.position, modelMesh.up);
                    targetQuaternion.setFromRotationMatrix(rotationMatrix);
                  }
                }
                if (!modelMesh.quaternion.equals(targetQuaternion)) {
                  modelMesh.quaternion.rotateTowards(
                    targetQuaternion,
                    delta * 10
                  );
                }
                modelMesh.position.lerp(characterCollider.position, 0.1);
              }
            }
            var fixedTimeStep = 1.0 / 60.0; // seconds
            var maxSubSteps = 3;

            delta = Math.min(clock.getDelta(), 0.1);
            world.step(fixedTimeStep, delta, maxSubSteps);

            characterCollider.position.set(
              colliderBody.position.x,
              colliderBody.position.y,
              colliderBody.position.z
            );

            orbitControls.update();
            if (video) {
              videoTexture.needsUpdate = true;
              video.play();
            }
            render();
          }

          function render() {
            if (!clicked) {
              camera.lookAt(
                modelMesh.position.x,
                modelMesh.position.y,
                modelMesh.position.z
              );
            }

            camera.updateProjectionMatrix();
            renderer.render(scene, camera);
          }

          // Function to calculate the distance between two points
          function calculateDistance(x1, z1, x2, z2) {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2));
          }

          colliderBody.addEventListener("collide", function (e: any) {
            crash = true;
            if (walk) walk.kill();
            if (e.contact.bj.id === 0) {
              world.removeBody(eggBody);

              // Function to generate newX and newZ not within distance d of any position in pos array
              let newX, newZ;
              let withinDistance = true;

              while (withinDistance) {
                // Generate random coordinates
                const road = positions[Math.floor(Math.random() * 5)];
                newX = Math.random() * (road.x2 - road.x1) + road.x1;
                newZ = Math.random() * (road.z2 - road.z1) + road.z1;

                // Check if the new coordinates are within distance d of any position in pos array
                withinDistance = npcPos.some(
                  (position) =>
                    calculateDistance(newX, newZ, position[0], position[2]) < 5
                );
                if (
                  calculateDistance(
                    newX,
                    newZ,
                    eggBody.position.x,
                    eggBody.position.z
                  ) < 5
                )
                  withinDistance = true;
                if (
                  calculateDistance(
                    newX,
                    newZ,
                    colliderBody.position.x,
                    colliderBody.position.z
                  ) < 5
                )
                  withinDistance = true;
              }
              egg.children[0].position.set(newX, 0.3, newZ);
              eggBody.position.set(newX, 0.3, newZ);

              // Add back to world after a delay
              setTimeout(() => {
                world.addBody(eggBody);
              }, 1000);

              plusText.style.top = "33%";
              plusText.style.visibility = "visible";

              // Move to the right top corner and disappear gradually after 2s
              setTimeout(function () {
                plusText.style.top = "50px";
                plusText.style.left = "calc(100% - 50px)";
                plusText.style.visibility = "hidden";
              }, 500);

              setTimeout(function () {
                plusText.style.top = "50%";
                plusText.style.left = "50%";
              }, 1500);

              count += 1;
              score.innerHTML = count.toString();
            }
          });

          animate();

          instructions.addEventListener("click", function () {
            if (!finished) {
              if (clicked == false) {
                clicked = true;

                gsap.to(camera.position, {
                  x: 0,
                  y: 40,
                  z: -50,
                  duration: 4,
                  onStart: () => {
                    orbitControls.enabled = false;
                  },
                  onUpdate: () => {
                    orbitControls.enabled = false;
                  },
                  onComplete: () => {
                    orbitControls.enabled = true;
                    orbitControls.autoRotate = true;
                  },
                });
              } else {
                const timerCount = setInterval(function () {
                  if (sec <= 0) {
                    if (min-- <= 0) {
                      finished = true;
                      min = 0;
                      sec = 0;
                      clearInterval(timerCount);
                      text.style.display = "none";
                      instructions.style.display = "flex";
                      blocker.style.display = "block";
                      returnButton.style.display = "flex";
                      youEarned.style.display = "block";
                      youEarned.innerHTML = `You earned ${
                        isDemo ? count : (count / 3).toFixed(2)
                      } ${isDemo ? "EGG(S)" : "SOFT COQ INU"}`;
                      congratulation.style.display = "block";
                      avatar.position.set(0, 1.72, 0);
                      characterCollider.position.set(0, 3, 0);
                      colliderBody.position.set(0, 3, 0);
                      if (count && !isDemo) {
                        axios.post(SERVER_ENDPOINT, {
                          address: publicKey,
                          amount: count,
                        });
                      }
                      count = 0;
                    } else {
                      sec = 59;
                      clicked = false;
                    }
                  } else {
                    sec--;
                    clicked = false;
                  }

                  timer.innerHTML =
                    min.toString().padStart(2, "0") +
                    ":" +
                    sec.toString().padStart(2, "0");
                }, 1000);
                instructions.style.display = "none";
                blocker.style.display = "none";
                document.body.appendChild(scoreBoard);
                gsap.to(camera.position, {
                  x: 0,
                  y: 7,
                  z: -2,
                  duration: 4,
                  onStart: () => {
                    orbitControls.enabled = false;
                  },
                  onUpdate: () => {
                    orbitControls.enabled = false;
                  },
                  onComplete: () => {
                    orbitControls.enabled = false;
                    orbitControls.autoRotate = false;
                  },
                });
              }
            }
          });
        },
        () => {},
        (error) => {
          console.log(error);
        }
      );
    },
    (xhr) => {
      cp.value = (xhr.loaded / 76807588) * 100;
      if (cp.value == 100) {
        gsap.to(cp, {
          duration: 2,
          opacity: 0,
          onComplete: () => {
            cp.remove();
            document.body.append(blocker);
          },
        });
      }
    },
    (error) => {
      console.log(error);
    }
  );
  return false;
};

export { play };
