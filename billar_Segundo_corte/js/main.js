// Crear escena
const scene = new THREE.Scene();

// Añadir iluminación
const ambientLight = new THREE.AmbientLight(0x404040, 0.6); // Luz ambiental suave
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

// Cargar el mapa de entorno (skybox)
const loaderTexture = new THREE.CubeTextureLoader();
const texture = loaderTexture.load([
    'uv/px.png', // positive x
    'uv/nx.png', // negative x
    'uv/py.png', // positive y
    'uv/ny.png', // negative y
    'uv/pz.png', // positive z
    'uv/nz.png'  // negative z
]);
scene.background = texture;

// Crear cámara
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Crear renderizador
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Crear controles de órbita
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Cargar el modelo FBX
const loader = new THREE.FBXLoader();
let tableBounds = null; // se calculará automáticamente

loader.load('modelos/Billar.fbx', function (object) {
    object.scale.set(0.009, 0.009, 0.009);
    object.position.y = -2;
    scene.add(object);

    // 🔧 Límites del área jugable del tapete verde (ajústalos si es necesario)
    tableBounds = {
        minX: -3.25, // izquierda
        maxX: 3.25,  // derecha
        minZ: -1.65, // fondo
        maxZ: 1.65   // frente
    };
    
});



// Añadir esfera blanca
const sphereGeometry = new THREE.SphereGeometry(0.1, 32, 32);
const whiteMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
const whiteSphere = new THREE.Mesh(sphereGeometry, whiteMaterial);
whiteSphere.position.set(-1, 0.1, 0);
scene.add(whiteSphere);

// Añadir esfera roja
const redMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
const redSphere = new THREE.Mesh(sphereGeometry, redMaterial);
redSphere.position.set(1, 0.1, 0);
scene.add(redSphere);

// Crear taco de billar (cilindro marrón)
const cueGeometry = new THREE.CylinderGeometry(0.02, 0.02, 2, 32);
const cueMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
const cue = new THREE.Mesh(cueGeometry, cueMaterial);

// El cilindro en Three.js se alinea en el eje Y, así que lo rotamos para que esté horizontal
cue.rotation.z = Math.PI / 2; 
cue.position.set(whiteSphere.position.x - 1, whiteSphere.position.y, whiteSphere.position.z);
scene.add(cue);

// Variables para rotación del taco
let cueAngle = 0;
const cueRadius = 1;

// Variables físicas
let whiteVelocity = new THREE.Vector3(0, 0, 0);
let redVelocity = new THREE.Vector3(0, 0, 0);
const friction = 0.98;
const ballRadius = 0.1;


// Variables del golpe
let isStriking = false;
let strikePower = 0.12;
let strikeProgress = 0;

// Control del taco
document.addEventListener("keydown", (event) => {
    const speed = 0.05;

    if (event.key === "a" || event.key === "A") {
        cueAngle += speed;
    } else if (event.key === "d" || event.key === "D") {
        cueAngle -= speed;
    } else if (event.code === "Space" && !isStriking) {
        isStriking = true;
        strikeProgress = 0;
    }

    updateCuePosition();
});

// Actualizar posición del taco
function updateCuePosition() {
    cue.position.x = whiteSphere.position.x + Math.sin(cueAngle) * cueRadius;
    cue.position.z = whiteSphere.position.z + Math.cos(cueAngle) * cueRadius;
    cue.position.y = whiteSphere.position.y;

    cue.lookAt(whiteSphere.position);
    cue.rotateX(Math.PI / 2);
}

// Física básica de bolas
function updatePhysics() {
    // Mover bolas
    whiteSphere.position.add(whiteVelocity);
    redSphere.position.add(redVelocity);

    // Colisión entre bolas
    const dx = redSphere.position.x - whiteSphere.position.x;
    const dz = redSphere.position.z - whiteSphere.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < ballRadius * 2) {
        const nx = dx / distance;
        const nz = dz / distance;

        const p =
            2 *
            (whiteVelocity.x * nx + whiteVelocity.z * nz -
                redVelocity.x * nx - redVelocity.z * nz) /
            2;

        whiteVelocity.x -= p * nx;
        whiteVelocity.z -= p * nz;
        redVelocity.x += p * nx;
        redVelocity.z += p * nz;

        const overlap = ballRadius * 2 - distance;
        whiteSphere.position.x -= (overlap / 2) * nx;
        whiteSphere.position.z -= (overlap / 2) * nz;
        redSphere.position.x += (overlap / 2) * nx;
        redSphere.position.z += (overlap / 2) * nz;
    }

    // Colisiones con las paredes (rebote)
    handleWallCollision(whiteSphere, whiteVelocity);
    handleWallCollision(redSphere, redVelocity);

    // Fricción
    whiteVelocity.multiplyScalar(friction);
    redVelocity.multiplyScalar(friction);

    if (whiteVelocity.length() < 0.0005) whiteVelocity.set(0, 0, 0);
    if (redVelocity.length() < 0.0005) redVelocity.set(0, 0, 0);
    
}

function handleWallCollision(ball, velocity) {
    if (!tableBounds) return;

    const restitution = 0.9; // rebote elástico (1 = perfecto, 0 = sin rebote)
    const ballRadius = 0.1;  // asegúrate de usar el mismo radio de tus esferas

    // Colisión con borde izquierdo
    if (ball.position.x - ballRadius < tableBounds.minX) {
        ball.position.x = tableBounds.minX + ballRadius;
        velocity.x *= -restitution;
    }

    // Colisión con borde derecho
    if (ball.position.x + ballRadius > tableBounds.maxX) {
        ball.position.x = tableBounds.maxX - ballRadius;
        velocity.x *= -restitution;
    }

    // Colisión con borde inferior
    if (ball.position.z - ballRadius < tableBounds.minZ) {
        ball.position.z = tableBounds.minZ + ballRadius;
        velocity.z *= -restitution;
    }

    // Colisión con borde superior
    if (ball.position.z + ballRadius > tableBounds.maxZ) {
        ball.position.z = tableBounds.maxZ - ballRadius;
        velocity.z *= -restitution;
    }
}



// Animación del golpe
function updateStrike() {
    if (!isStriking) return;

    const strikeSpeed = 0.08;
    strikeProgress += strikeSpeed;

    const forward = Math.sin(strikeProgress * Math.PI);
    const offset = (1 - forward) * cueRadius;

    cue.position.x = whiteSphere.position.x + Math.sin(cueAngle) * offset;
    cue.position.z = whiteSphere.position.z + Math.cos(cueAngle) * offset;
    cue.lookAt(whiteSphere.position);
    cue.rotateX(Math.PI / 2);

    // Momento del impacto
    if (strikeProgress >= 1) {
    isStriking = false;
    whiteVelocity.x = -Math.sin(cueAngle) * strikePower;
    whiteVelocity.z = -Math.cos(cueAngle) * strikePower;

}

}



// Animación general
function animate() {
    requestAnimationFrame(animate);
    updatePhysics();
    updateStrike();
    //TWEEN.update();

    updateCuePosition();


    controls.update();
    renderer.render(scene, camera);
}

animate();

// Ajustar ventana
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
