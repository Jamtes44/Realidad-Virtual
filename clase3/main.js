import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';


/////////////Escena

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const loader = new THREE.CubeTextureLoader();
loader.setPath( './Uv/' );

const textureCube = loader.load( [
	'px.png', 'nx.png',
	'py.png', 'ny.png',
	'pz.png', 'nz.png'
] );

scene.background = textureCube

const manager = new THREE.LoadingManager();
const loaderFBX = new FBXLoader( manager );

////////////////////////////////////////////luz

const light = new THREE.PointLight( 0xffffff, 1, 100 );
light.position.set( 0, 5, 0 );
light.castShadow = true;
scene.add( light );
const light2 = new THREE.AmbientLight( 0x407040 ); 
scene.add( light2 );

////////////////////////////////////////////geometrias

const geometry = new THREE.BoxGeometry( 10, 0.1, 10 );
const material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
cube.receiveShadow = true;
scene.add( cube );

const geometry1 = new THREE.SphereGeometry( 1, 32, 16 ); 
const material1 = new THREE.MeshPhongMaterial( { color: 0xffff00, envMap:textureCube, reflectivity:0.1, shininess:0.5 } ); 
const sphere = new THREE.Mesh( geometry1, material1 );
sphere.castShadow = true;  
sphere.receiveShadow = false;
scene.add( sphere );

const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set( 0, 0, 0 );
controls.update();

let mixer;
const clock = new THREE.Clock();

loaderFBX.load('./models/fbx/Samba Dancing.fbx', function(object){
    object.traverse(function(child){
        if(child.isMesh){
            child.material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        }
    });

    object.scale.set(0.05, 0.05, 0.05); 

    mixer = new THREE.AnimationMixer( object );
    const action = mixer.clipAction( object.animations[ 0 ] );
    action.play();

    scene.add(object);
});





sphere.position.y = 1;

cube.position.y = -2;

camera.position.z = 10;
camera.position.y = 3; 

function animate() {

  renderer.render( scene, camera );

	const delta = clock.getDelta();

	if ( mixer ) mixer.update( delta );
}