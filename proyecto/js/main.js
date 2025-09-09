const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Añadir controles de órbita
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Añadir luces
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 1, 1);
scene.add(directionalLight);

const loader = new THREE.FBXLoader();
let model;

// Cargar cubemap
const cubeTextureLoader = new THREE.CubeTextureLoader();
const cubeTexture = cubeTextureLoader.load([
    'uv/px.png', // positive x
    'uv/nx.png', // negative x
    'uv/py.png', // positive y
    'uv/ny.png', // negative y
    'uv/pz.png', // positive z
    'uv/nz.png'  // negative z
]);
scene.background = cubeTexture;

loader.load('modelos/snowman.fbx', function (fbx) {
    model = fbx;
    model.rotation.z = Math.PI / 2; // Rotar 90 grados en el eje X
    scene.add(model);
}, undefined, function (error) {
    console.error(error);
});

// Cargar modelo de árbol
const treeLoader = new THREE.FBXLoader();
treeLoader.load('modelos/arboles/Todos.fbx', function (fbx) {
    // Escalar el modelo original
    fbx.scale.set(0.05, 0.05, 0.05);

    // Posiciones en forma de media luna (arco semicircular)
    const positions = [
        { x: -3, y: -1, z: 0 }, // Izquierda
        { x: 0, y: -1, z: 2 },  // Centro
        { x: 3, y: -1, z: 0 }   // Derecha
    ];

    // Crear 3 instancias clonadas y posicionarlas
    for (let i = 0; i < 3; i++) {
        const treeClone = fbx.clone();
        treeClone.position.set(positions[i].x, positions[i].y, positions[i].z);
        scene.add(treeClone);
    }
}, undefined, function (error) {
    console.error(error);
});

// Añadir cilindro rojo como piso
const cylinderGeometry = new THREE.CylinderGeometry(5, 5, 0.5, 32);
const cylinderMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
cylinder.position.y = -1;
scene.add(cylinder);

// Añadir esfera como cúpula alrededor del cilindro rojo
const sphereGeometry = new THREE.SphereGeometry(5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.y = -1 + 0.25; // Ajustar para que la cúpula esté justo encima del cilindro
scene.add(sphere);

camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);

    controls.update();

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});
