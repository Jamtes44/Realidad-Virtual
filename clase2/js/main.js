const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const controls = new THREE.OrbitControls(camera, renderer.domElement);

const light = new THREE.PointLight(0xffffff, 2, 200);
light.position.set(0, 50, 50);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040, 1.5); // soft white ambient light
scene.add(ambientLight);

const geometry = new THREE.BoxGeometry(10, 0.1, 25 );
const material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

cube.position.set(0, 0, 0);

const geometryS = new THREE.SphereGeometry(1, 32, 16 );
const materialS = new THREE.MeshLambertMaterial( { color: 0x01f0 } );
const sphere = new THREE.Mesh( geometryS, materialS );
scene.add( sphere );

const geometryP1 = new THREE.BoxGeometry(100, 100, 1 );
const materialP1 = new THREE.MeshLambertMaterial( { color: 0xF54927 } );
const pared1 = new THREE.Mesh( geometryP1, materialP1 );
scene.add( pared1 );

const geometryP2 = new THREE.BoxGeometry(100, 100, 1 );
const materialP2 = new THREE.MeshLambertMaterial( { color: 0xF54927 } );
const pared2 = new THREE.Mesh( geometryP2, materialP2 );
scene.add( pared2 );

const geometryP3 = new THREE.BoxGeometry(100, 100, 1 );
const materialP3 = new THREE.MeshLambertMaterial( { color: 0xF54927 } );
const pared3 = new THREE.Mesh( geometryP3, materialP3 );
scene.add( pared3 );

const geometryBrown = new THREE.BoxGeometry(2, 1, 22);
const materialBrown = new THREE.MeshLambertMaterial( { color: 0x8B4513 } );
const brownSquare = new THREE.Mesh( geometryBrown, materialBrown );
scene.add( brownSquare );

const brownSquare2 = new THREE.Mesh( geometryBrown, materialBrown );
scene.add( brownSquare2 );

const geometryBrown3 = new THREE.BoxGeometry(8, 0.5, 2);
const materialBrown3 = new THREE.MeshLambertMaterial( { color: 0x8B4513 } );
const brownSquare3 = new THREE.Mesh( geometryBrown3, materialBrown3 );
scene.add( brownSquare3 );

const brownSquare4 = new THREE.Mesh( geometryBrown3, materialBrown3 );
scene.add( brownSquare4 );

const geometryCylinder = new THREE.CylinderGeometry( 1.5, 1.5, 2, 32 );
const materialCylinder = new THREE.MeshLambertMaterial( { color: 0x8B4513 } );

const cylinder1 = new THREE.Mesh( geometryCylinder, materialCylinder );
scene.add( cylinder1 );

const cueGeometry = new THREE.CylinderGeometry( 0.1, 0.1, 15, 16 );
const cueMaterial = new THREE.MeshLambertMaterial( { color: 0xdeb887 } ); // color madera clara
const cue = new THREE.Mesh( cueGeometry, cueMaterial );
scene.add( cue );

// Posicionar el taco cerca de la bola azul, apuntando hacia ella
cue.position.set(0, 1, 10);
cue.rotation.x = Math.PI / 2;

const cylinder2 = new THREE.Mesh( geometryCylinder, materialCylinder );
scene.add( cylinder2 );

const cylinder3 = new THREE.Mesh( geometryCylinder, materialCylinder );
scene.add( cylinder3 );

const cylinder4 = new THREE.Mesh( geometryCylinder, materialCylinder );
scene.add( cylinder4 );

sphere.position.y = 1;

pared1.position.y = 10;
pared1.position.z = -25;

camera.position.z = 10;
camera.position.y = 3;

pared2.position.y = 10;
pared2.position.x = -50;
pared2.rotation.y = Math.PI / 2;

pared3.position.y = 10;
pared3.position.x = 50;
pared3.rotation.y = Math.PI / 2;

brownSquare.position.set(5, 0.5, 0);
brownSquare2.position.set(-5, 0.5, 0);
brownSquare3.position.set(0, 0.5, -13);
brownSquare4.position.set(0, 0.5, 13);

cylinder1.position.set(5, 0, 12.5);
cylinder2.position.set(5, 0, -12.5);
cylinder3.position.set(-5, 0, 12.5);
cylinder4.position.set(-5, 0, -12.5);

const geometrySquare = new THREE.BoxGeometry(0.5, 5, 0.5);
const materialSquare = new THREE.MeshLambertMaterial( { color: 0x8B4513 } );

const square1 = new THREE.Mesh(geometrySquare, materialSquare);
scene.add(square1);
square1.position.set(5, -2.5, 12.5);

const square2 = new THREE.Mesh(geometrySquare, materialSquare);
scene.add(square2);
square2.position.set(5, -2.5, -12.5);

const square3 = new THREE.Mesh(geometrySquare, materialSquare);
scene.add(square3);
square3.position.set(-5, -2.5, 12.5);

const square4 = new THREE.Mesh(geometrySquare, materialSquare);
scene.add(square4);
square4.position.set(-5, -2.5, -12.5);

const geometryFloor = new THREE.BoxGeometry(50, 0.1, 50);
const materialFloor = new THREE.MeshLambertMaterial( { color: 0x752B1C } );
const floor = new THREE.Mesh(geometryFloor, materialFloor);
scene.add(floor);
floor.position.set(0, -5, 0);

const geometryCube = new THREE.BoxGeometry(12, 3, 27);
const materialCube = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // color café (saddle brown)
const cubeMesh = new THREE.Mesh(geometryCube, materialCube);
scene.add(cubeMesh);

cubeMesh.position.set(0, -1.5, 0);


function animate() {
    controls.update();
    renderer.render( scene, camera );

}

