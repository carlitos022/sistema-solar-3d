import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.querySelector('#space');
const status = document.querySelector('#status');
const hint = document.querySelector('#hint');
const earthData = document.querySelector('#earth-data');
const enterBtn = document.querySelector('#enter');
const backBtn = document.querySelector('#back');
const pauseBtn = document.querySelector('#pause');
const homeBtn = document.querySelector('#home');
const mode = document.querySelector('#mode');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x010207);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.05, 1000);
camera.position.set(0, 16, 30);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.setSize(innerWidth, innerHeight);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.minDistance = 2;
controls.maxDistance = 100;
scene.add(new THREE.AmbientLight(0x667799, 0.4));
const sun = new THREE.Mesh(new THREE.SphereGeometry(2.2, 40, 28), new THREE.MeshBasicMaterial({ color: 0xffbd42 }));
scene.add(sun);
scene.add(new THREE.PointLight(0xffffff, 900, 160));

const earthGroup = new THREE.Group();
earthGroup.position.set(10, 0, 0);
scene.add(earthGroup);
const earth = new THREE.Mesh(new THREE.SphereGeometry(1.18, 64, 48), new THREE.MeshStandardMaterial({ color: 0x1769aa, roughness: 0.82 }));
earth.rotation.z = THREE.MathUtils.degToRad(23.44);
earthGroup.add(earth);
const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.28, 48, 32), new THREE.MeshBasicMaterial({ color: 0x55aaff, transparent: true, opacity: 0.13, side: THREE.BackSide }));
earth.add(atmosphere);
const moon = new THREE.Mesh(new THREE.SphereGeometry(0.27, 32, 24), new THREE.MeshStandardMaterial({ color: 0xbab9b4, roughness: 1 }));
scene.add(moon);

let selected = false, planetMode = false, paused = false, moonAngle = 0;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
function updateMoon(){ moon.position.set(earthGroup.position.x + Math.cos(moonAngle)*2.3, 0, earthGroup.position.z + Math.sin(moonAngle)*2.3); }
updateMoon();
function selectEarth(){ selected=true; enterBtn.disabled=false; earthData.hidden=false; hint.textContent='Tierra seleccionada. Pulsa Entrar a la Tierra.'; controls.target.copy(earthGroup.position); }
function enterEarth(){ if(!selected)return; planetMode=true; enterBtn.disabled=true; backBtn.disabled=false; mode.textContent='Explorando la Tierra'; hint.textContent='Rota y acerca la cámara para examinar la Tierra.'; camera.position.copy(earthGroup.position).add(new THREE.Vector3(0,1,4.2)); controls.target.copy(earthGroup.position); controls.maxDistance=14; }
function leaveEarth(){ planetMode=false; selected=false; backBtn.disabled=true; enterBtn.disabled=true; earthData.hidden=true; mode.textContent='Sistema Solar'; hint.textContent='Haz clic sobre la Tierra.'; camera.position.set(0,16,30); controls.target.set(0,0,0); controls.maxDistance=100; }
canvas.addEventListener('pointerdown', e=>{ if(planetMode)return; const r=canvas.getBoundingClientRect(); pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1); raycaster.setFromCamera(pointer,camera); if(raycaster.intersectObject(earth,false).length) selectEarth(); });
enterBtn.addEventListener('click',enterEarth);
backBtn.addEventListener('click',leaveEarth);
homeBtn.addEventListener('click',()=>{camera.position.set(0,16,30);controls.target.set(0,0,0);});
pauseBtn.addEventListener('click',()=>{paused=!paused;pauseBtn.textContent=paused?'▶ Reanudar':'⏸ Pausar';});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
let last=performance.now();
function frame(now){requestAnimationFrame(frame);const dt=Math.min(0.05,(now-last)/1000);last=now;if(!paused){earth.rotation.y+=dt*0.18;moonAngle+=dt*0.1;updateMoon();}controls.update();renderer.render(scene,camera);}
status.textContent='Listo · selecciona la Tierra';
frame(performance.now());
