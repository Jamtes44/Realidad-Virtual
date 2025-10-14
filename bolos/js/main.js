// ESCENA
const scene = new THREE.Scene();

// SKYBOX
const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
    'uv/Standard-Cube-Map/px.png',
    'uv/Standard-Cube-Map/nx.png',
    'uv/Standard-Cube-Map/py.png',
    'uv/Standard-Cube-Map/ny.png',
    'uv/Standard-Cube-Map/pz.png',
    'uv/Standard-Cube-Map/nz.png'
]);
scene.background = texture;

// CAMARA
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// LUCES
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// GEOMETRIAS
const pins = [];
const pinPositions = [
    { x: 3.5, z: -30 },
    { x: 2.8, z: -30 },
    { x: 2.3, z: -30 },
    { x: 1.8, z: -30 },
    { x: 3.2, z: -29.5 },
    { x: 2.6, z: -29.5 },
    { x: 2.1, z: -29.5 },
    { x: 2.3, z: -29 },
    { x: 2.8, z: -29 },
    { x: 2.5, z: -28.5 }
];

const ballGeometry = new THREE.SphereGeometry(0.2, 16, 16);
const ballMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.position.set(2.5, 0.2, 2);
scene.add(ball);

const direction = new THREE.Vector3(0, 0, -1);
const arrowLength = 0.8;
const arrowHelper = new THREE.ArrowHelper(direction.clone().normalize(), ball.position, arrowLength, 0x00ff00);
scene.add(arrowHelper);

// MODELOS
const loaderFBX = new THREE.FBXLoader();
let model;
loaderFBX.load('modelos/bolos.fbx', (fbx) => {
    model = fbx;
    model.scale.set(0.01, 0.01, 0.01);
    model.position.set(0, 0, 10);
    scene.add(model);
}, undefined, (error) => {
    console.error('Error al cargar el modelo FBX:', error);
});

loaderFBX.load('modelos/pin.fbx', (fbx) => {
    
    for (let i = 0; i < 10; i++) {
        const pin = fbx.clone();
        pin.scale.set(0.01, 0.01, 0.01);
        pin.position.set(pinPositions[i].x, 0.5, pinPositions[i].z);
        pin.isHit = false;
        pin.isFalling = false;
        pin.velocityY = 0;
        pin.velocityX = 0;
        pin.velocityZ = 0;
        pin.mass = 10;
        pins.push(pin);
        scene.add(pin);
    }
}, undefined, (error) => {
    console.error('Error al cargar el modelo FBX para pines:', error);
});

// VARIABLES
let rotationSpeed = 0.05;
let moveSpeed = 0.1;
let currentRotation = 0;
let impulseSpeed = 2;
let isMovingForward = false;
let velocityX = 0;
let velocityZ = 0;

xBounds = {
    min: 1.5,
    max: 3.5
};

window.addEventListener('keydown', (e) => {
    switch (e.key.toLowerCase()) {
        case 'a':
        case 'arrowleft':
            currentRotation += rotationSpeed;
            break;
        case 'd':
        case 'arrowright':
            currentRotation -= rotationSpeed;
            break;
        case 'w':
        case 'arrowup':
            ball.position.x -= Math.sin(currentRotation) * moveSpeed;
            ball.position.z -= Math.cos(currentRotation) * moveSpeed;
            break;
        case 's':
        case 'arrowdown':
            ball.position.x += Math.sin(currentRotation) * moveSpeed;
            ball.position.z += Math.cos(currentRotation) * moveSpeed;
            break;
        case 'z':
            ball.position.x -= moveSpeed;
            break;
        case 'c':
            ball.position.x += moveSpeed;
            break;
        case ' ':
            if (!isMovingForward) {
                isMovingForward = true;
                velocityX = -Math.sin(currentRotation) * impulseSpeed;
                velocityZ = -Math.cos(currentRotation) * impulseSpeed;
            }
            break;
    }
    if (ball.position.x < xBounds.min) ball.position.x = xBounds.min;
    if (ball.position.x > xBounds.max) ball.position.x = xBounds.max;
});

// COLISIONES
function checkCollisions() {
    for (let pin of pins) {
        const dist = ball.position.distanceTo(pin.position);
        if (dist < 0.4 && !pin.isHit) {
            pin.isHit = true;
            pin.isFalling = true;
            pin.velocityY = 0.2 / pin.mass;
            pin.velocityX = (ball.position.x - pin.position.x) * 0.1 / pin.mass;
            pin.velocityZ = (ball.position.z - pin.position.z) * 0.1 / pin.mass;
        }
    }
}

// FUNCIONES
function animate() {
    requestAnimationFrame(animate);

    const dir = new THREE.Vector3(
        -Math.sin(currentRotation),
        0,
        -Math.cos(currentRotation)
    );

    if (isMovingForward) {
        ball.position.x += velocityX;
        ball.position.z += velocityZ;

        if (ball.position.x <= xBounds.min || ball.position.x >= xBounds.max) {
            velocityX = -velocityX;
            ball.position.x = Math.max(xBounds.min, Math.min(xBounds.max, ball.position.x));
        }

        if (ball.position.z < -32) {
            isMovingForward = false;
            velocityX = 0;
            velocityZ = 0;
        }
    }

    checkCollisions();

    for (let pin of pins) {
        if (pin.isFalling) {
            pin.velocityY -= 0.008 / pin.mass;
            pin.velocityX *= 0.96;
            pin.velocityZ *= 0.96;
            pin.position.x += pin.velocityX;
            pin.position.y += pin.velocityY;
            pin.position.z += pin.velocityZ;
            pin.rotation.x += pin.velocityX * 3;
            pin.rotation.z += pin.velocityZ * 3;
            pin.rotation.y += pin.velocityX * 1.5;

            if (pin.position.y <= 0) {
                pin.position.y = 0;
                pin.velocityY = -pin.velocityY * 0.4;

                if (Math.abs(pin.velocityY) < 0.005) {
                    pin.isFalling = false;
                    pin.velocityY = 0;
                    pin.velocityX = 0;
                    pin.velocityZ = 0;
                }
            }

            if (pin.position.x <= xBounds.min || pin.position.x >= xBounds.max) {
                pin.velocityX = -pin.velocityX * 0.7;
                pin.position.x = Math.max(xBounds.min, Math.min(xBounds.max, pin.position.x));
            }
        }
    }

    arrowHelper.setDirection(dir.normalize());
    arrowHelper.position.copy(ball.position);

    controls.update();
    renderer.render(scene, camera);
}

animate();
