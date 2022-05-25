import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import CC from './CSM/CC';
import BCCI from './CSM/BCCI';

const characterControls = CC;
// Canvas
const canvas = document.querySelector('canvas.webgl');

const scene = new THREE.Scene();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const ambientLight = new THREE.AmbientLight('#ffffff', 0.4);
const directionalLight = new THREE.DirectionalLight('#ffffff', 1);
directionalLight.position.set(1, 1, 1);

scene.add(ambientLight, directionalLight);

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.001,
  100
);
// camera.position.x = 1;
camera.position.y = 2;
camera.position.z = 3;
scene.add(camera);

// Controls
const orbitControls = new OrbitControls(camera, canvas);
orbitControls.enableDamping = true;

const plane = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(40, 40, 32, 32),
  new THREE.MeshStandardMaterial({ color: '#125c15', side: THREE.DoubleSide })
);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// lisiening to key press
document.addEventListener('keydown', (e) => {
  BCCI._onKeyDown(e);

  if (e.shiftKey && !characterControls._toggleRun) {
    characterControls.switchRunToggle();
  }
});
document.addEventListener('keyup', (e) => {
  BCCI._onKeyUp(e);
  if (e.key === 'Shift') {
    characterControls.switchRunToggle();
  }
});

/**
 * Model
 */

const modelLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('draco/');
modelLoader.setDRACOLoader(dracoLoader);

const model = modelLoader.load('model/cop.glb', (gltf) => {
  gltf.scene.scale.set(0.5, 0.5, 0.5);
  scene.add(gltf.scene);

  let _model = gltf.scene;
  const gltfAnims = gltf.animations;
  const mixer = new THREE.AnimationMixer(gltf.scene);
  const animMap = new Map();

  gltfAnims.forEach((anim) => {
    animMap.set(anim.name, mixer.clipAction(anim));
  });

  characterControls._init(
    _model,
    mixer,
    animMap,
    orbitControls,
    camera,
    'Breathing Idle'
  );

  console.log(animMap);
  console.log(gltfAnims);

  gltf.animations.forEach((anim, i) => {});
});

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ANIMATE
const clock = new THREE.Clock();

function animate() {
  let mixerUpdateDelta = clock.getDelta();
  if (characterControls) {
    characterControls.update(mixerUpdateDelta, BCCI._keys);
  }
  orbitControls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
document.body.appendChild(renderer.domElement);
animate();
