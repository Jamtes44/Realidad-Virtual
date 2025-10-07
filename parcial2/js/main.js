// ======================================================
// --- CONFIGURACIÓN E INICIALIZACIÓN ---
// ======================================================

// Escena y Renderer
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Constantes de la escena
const SCENE_BOUNDS_X = 30; // Límite para movimiento de bola y plataforma
const PLATFORM_SPEED = 1.2;
const GRAVITY = -0.01;
const BALL_VELOCITY_X = 0.2;

// Plataforma
const platformGeometry = new THREE.BoxGeometry(7, 0.5, 5);
const platformMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const platform = new THREE.Mesh(platformGeometry, platformMaterial);
platform.position.y = -8;
scene.add(platform);
// Pre-calculamos sus dimensiones para no hacerlo en cada fotograma
const platformHalfWidth = platformGeometry.parameters.width / 2;
const platformHalfDepth = platformGeometry.parameters.depth / 2;


// Bola
const ballGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.position.set(-SCENE_BOUNDS_X, 5, 0);
scene.add(ball);
let ballVelocityY = 0.1;


// Cámara y Controles
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 12, 25);
camera.lookAt(platform.position);
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.copy(platform.position);

// Input del teclado
const keys = {};
window.addEventListener('keydown', (event) => { keys[event.code] = true; });
window.addEventListener('keyup', (event) => { keys[event.code] = false; });


// ======================================================
// --- LÓGICA DE ACTUALIZACIÓN ---
// ======================================================

function updatePlatform() {
    if (keys['ArrowLeft']) {
        platform.position.x = Math.max(platform.position.x - PLATFORM_SPEED, -SCENE_BOUNDS_X);
    }
    if (keys['ArrowRight']) {
        platform.position.x = Math.min(platform.position.x + PLATFORM_SPEED, SCENE_BOUNDS_X);
    }
}

function updateBall() {
    // Aplicar física (gravedad y velocidad)
    ballVelocityY += GRAVITY;
    ball.position.y += ballVelocityY;
    ball.position.x += BALL_VELOCITY_X;

    // Reiniciar si se sale por la derecha
    if (ball.position.x - ballGeometry.parameters.radius > SCENE_BOUNDS_X) {
        ball.position.x = -SCENE_BOUNDS_X - ballGeometry.parameters.radius;
    }

    // Reiniciar si cae por debajo
    if (ball.position.y < -30) {
        ball.position.set(-SCENE_BOUNDS_X, 10, 0);
        ballVelocityY = 0;
    }

    // Detectar colisión con la plataforma
    const platformTop = platform.position.y + (platformGeometry.parameters.height / 2);
    const ballBottom = ball.position.y - ballGeometry.parameters.radius;

    const isColliding = ballBottom <= platformTop &&
        ball.position.y > platform.position.y && // Asegura que la colisión sea desde arriba
        ballVelocityY < 1 &&
        ball.position.x >= platform.position.x - platformHalfWidth &&
        ball.position.x <= platform.position.x + platformHalfWidth &&
        ball.position.z >= platform.position.z - platformHalfDepth &&
        ball.position.z <= platform.position.z + platformHalfDepth;

    if (isColliding) {
        ball.position.y = platformTop + ballGeometry.parameters.radius;
        ballVelocityY = 0.5; // Rebotar
    }
}

// ======================================================
// --- BUCLE PRINCIPAL Y RESIZE ---
// ======================================================

function animate() {
    requestAnimationFrame(animate);

    updatePlatform();
    updateBall();

    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Iniciar la animación
animate();