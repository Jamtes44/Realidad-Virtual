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
loader.setPath( './uv/' );

const textureCube = loader.load( [
	'px.png', 'nx.png',
	'py.png', 'ny.png',
	'pz.png', 'nz.png'
] );

scene.background = textureCube

const manager = new THREE.LoadingManager();
manager.onError = function(url) { console.error('Error loading:', url); };
const loaderFBX = new FBXLoader( manager );

////////////////////////////////////////////luz

const light = new THREE.PointLight( 0xD60000, 1, 100 );
light.position.set( 0, 1, 0 );
light.castShadow = true;
scene.add( light );


const light3 = new THREE.PointLight( 0xFFAA00, 1, 100 );
light3.position.set(2.9, 3.5 , -5);
light3.castShadow = true;
scene.add( light3 );

const light4 = new THREE.PointLight( 0xfffaff, 0.3, 100 );
light4.position.set( 0, 5, 5 );
light4.castShadow = true;
scene.add( light4 );

////////////////////////////////////////////geometrias

const geometry = new THREE.BoxGeometry( 10, 0.1, 10 );
const material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
cube.receiveShadow = true;
scene.add( cube );



let mixer;
const clock = new THREE.Clock();

loaderFBX.load('./modelos/HauntedHouse.fbx', function(object){
    object.traverse(function(child){
        if(child.isMesh){
            child.material = new THREE.MeshPhongMaterial({ color: 0x808000 });
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    object.scale.set(0.5, 0.5, 0.5);


    scene.add(object);
});

loaderFBX.load('./modelos/11.fbx', function(object){
    object.traverse(function(child){
        if(child.isMesh){
            child.material = new THREE.MeshPhongMaterial({ color: 0x808080 });
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    object.scale.set(0.01, 0.01, 0.01);
    object.position.set(1, 0, 3);
    object.rotation.y = 90;

    if (object.animations && object.animations.length > 0) {
        mixer = new THREE.AnimationMixer( object );
        const action = mixer.clipAction( object.animations[ 0 ] );
        action.play();
    }

    scene.add(object);
});

const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set( 0, 0, 0 );
controls.enableDamping = true;
controls.dampingFactor = 0.05;



cube.position.y = -2;



camera.position.z = 10;
camera.position.y = 3; 

function animate() {

  renderer.render( scene, camera );

  controls.update();

	const delta = clock.getDelta();

}
