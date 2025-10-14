// Crear escena
const scene = new THREE.Scene();

// Cargar skybox
const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
    'uv/Standard-Cube-Map/px.png', // positive x
    'uv/Standard-Cube-Map/nx.png', // negative x
    'uv/Standard-Cube-Map/py.png', // positive y
    'uv/Standard-Cube-Map/ny.png', // negative y
    'uv/Standard-Cube-Map/pz.png', // positive z
    'uv/Standard-Cube-Map/nz.png'  // negative z
]);
scene.background = texture;

// Crear cámara
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Crear renderizador
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Agregar OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Agregar iluminación
const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Luz ambiental suave
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Cargar modelo FBX
const loaderFBX = new THREE.FBXLoader();
let model;
loaderFBX.load('modelos/bolos.fbx', (fbx) => {
    model = fbx;
    model.scale.set(0.01, 0.01, 0.01);
    model.position.set(0, 0, 10); // Ajustar escala si es necesario
    scene.add(model);
}, undefined, (error) => {
    console.error('Error al cargar el modelo FBX:', error);
});


// Crear bolos (cilindros blancos)
const pinGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 16);
const pinMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });

const pins = [];
const pinPositions = [
    { x: 3.5, z: -30 }, // Fila trasera izquierda
    { x: 2.8, z: -30 },
    { x: 2.3, z: -30 },
    { x: 1.8, z: -30 }, // Fila trasera derecha
    { x: 3.2, z: -29.5 }, // Fila media izquierda
    { x: 2.6, z: -29.5 },
    { x: 2.1, z: -29.5 }, // Fila media derecha
    { x: 2.3, z: -29 }, // Fila delantera izquierda
    { x: 2.8, z: -29 }, // Fila delantera derecha
    { x: 2.5, z: -28.5 } // Punta
];

for (let i = 0; i < 10; i++) {
    const pin = new THREE.Mesh(pinGeometry, pinMaterial);
    pin.position.set(pinPositions[i].x, 0.5, pinPositions[i].z);
    pins.push(pin);
    scene.add(pin);
}



// Crear bola de bolos (esfera roja)
const ballGeometry = new THREE.SphereGeometry(0.2, 16, 16);
const ballMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.position.set(2.5, 0.2, 2); // Posición al frente
scene.add(ball);
// Flecha de dirección
const direction = new THREE.Vector3(0, 0, -1); // Apunta hacia -Z
const arrowLength = 0.8;
const arrowHelper = new THREE.ArrowHelper(direction.clone().normalize(), ball.position, arrowLength, 0x00ff00);
scene.add(arrowHelper);

// Variables de control
let rotationSpeed = 0.05; // Velocidad de rotación
let moveSpeed = 0.1; // Velocidad de movimiento
let currentRotation = 0; // Ángulo actual en radianes
let impulseSpeed = 0.3; // Velocidad del impulso hacia adelante
let isMovingForward = false; // Indica si la bola está en movimiento
let velocityZ = 0; // Velocidad actual en Z

// Límites del movimiento en X
xBounds = {
    min: 1.5,
    max: 3.5
};

// Escuchar teclas
window.addEventListener('keydown', (e) => {
    switch (e.key.toLowerCase()) {
        case 'a': // rotar izquierda
        case 'arrowleft':
            currentRotation += rotationSpeed;
            break;
        case 'd': // rotar derecha
        case 'arrowright':
            currentRotation -= rotationSpeed;
            break;
        case 'w': // avanzar
        case 'arrowup':
            ball.position.x -= Math.sin(currentRotation) * moveSpeed;
            ball.position.z -= Math.cos(currentRotation) * moveSpeed;
            break;
        case 's': // retroceder
        case 'arrowdown':
            ball.position.x += Math.sin(currentRotation) * moveSpeed;
            ball.position.z += Math.cos(currentRotation) * moveSpeed;
            break;
        case 'z': // mover izquierda
            ball.position.x -= moveSpeed;
            break;
        case 'c': // mover derecha
            ball.position.x += moveSpeed;
            break;
            case ' ': // espacio → impulsar hacia adelante
            if (!isMovingForward) {
                isMovingForward = true;
                velocityZ = -impulseSpeed; // movimiento hacia -Z
            }
            break;
    
    
    }
    if (ball.position.x < xBounds.min) ball.position.x = xBounds.min;
    if (ball.position.x > xBounds.max) ball.position.x = xBounds.max;
});

function checkCollisions() {
    for (let pin of pins) {
        const dist = ball.position.distanceTo(pin.position);
        if (dist < 0.3 && !pin.isHit) {
            pin.isHit = true; // marca que ya fue golpeado

            // Animación simple de caída
            const fallDirection = Math.random() > 0.5 ? 1 : -1;
            const tiltSpeed = 0.1;

            // Rotación y caída visual
            pin.rotation.x += tiltSpeed * fallDirection;
            pin.rotation.z += tiltSpeed * fallDirection;
            pin.position.y -= 0.02;
        }
    }
}

// Animación
function animate() {
    requestAnimationFrame(animate);

    // Actualizar dirección de la flecha
    const dir = new THREE.Vector3(
        -Math.sin(currentRotation),
        0,
        -Math.cos(currentRotation)
    );
    // Si la bola está impulsada, continúa moviéndose
    if (isMovingForward) {
        ball.position.z += velocityZ;

        // Detener la bola al final del camino
        if (ball.position.z < -32) {
            isMovingForward = false;
            velocityZ = 0;
        }
    }
    
    arrowHelper.setDirection(dir.normalize());
    arrowHelper.position.copy(ball.position);

    controls.update();
    renderer.render(scene, camera);
}

animate();