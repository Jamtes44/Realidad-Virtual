// Escena
const scene = new THREE.Scene();

// Skybox
const loaderTexture = new THREE.CubeTextureLoader();
const texture = loaderTexture.load([
    'uv/px.png',
    'uv/nx.png',
    'uv/py.png',
    'uv/ny.png',
    'uv/pz.png',
    'uv/nz.png'
]);
scene.background = texture;

// Camara
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Luces
const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

// Geometrias
const sphereGeometry = new THREE.SphereGeometry(0.1, 32, 32);
const cueGeometry = new THREE.CylinderGeometry(0.02, 0.02, 2, 32);

// Modelos
const loader = new THREE.FBXLoader();
let tableBounds = null;

loader.load('modelos/Billar.fbx', function (object) {
    object.scale.set(0.009, 0.009, 0.009);
    object.position.y = -2;
    scene.add(object);

    tableBounds = {
        minX: -3.25,
        maxX: 3.25,
        minZ: -1.65,
        maxZ: 1.65
    };
});

const ballColors = [0xffffff, 0xff0000, 0x0000ff, 0xffff00, 0x00ff00, 0x800080, 0xffa500];

const balls = [];

const rackPositions = [
    { x: -1, y: 0.1, z: 0 },
    { x: 1, y: 0.1, z: 0 },
    { x: 1.2, y: 0.1, z: -0.1 },
    { x: 1.2, y: 0.1, z: 0.1 },
    { x: 1.4, y: 0.1, z: 0 },
    { x: 1.4, y: 0.1, z: -0.2 },
    { x: 1.4, y: 0.1, z: 0.2 }
];

for (let i = 0; i < ballColors.length; i++) {
    const material = new THREE.MeshLambertMaterial({ color: ballColors[i] });
    const ball = new THREE.Mesh(sphereGeometry, material);
    ball.position.set(rackPositions[i].x, rackPositions[i].y, rackPositions[i].z);
    scene.add(ball);
    balls.push({
        mesh: ball,
        velocity: new THREE.Vector3(0, 0, 0)
    });
}

const whiteBall = balls[0];

const cueMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
const cue = new THREE.Mesh(cueGeometry, cueMaterial);

cue.rotation.z = Math.PI / 2;
cue.position.set(whiteBall.mesh.position.x - 1, whiteBall.mesh.position.y, whiteBall.mesh.position.z);
scene.add(cue);

// Variables
let cueAngle = 0;
const cueRadius = 1;
const friction = 0.98;
const ballRadius = 0.1;
let isStriking = false;
let strikePower = 0.3;
let strikeProgress = 0;

// Colisiones
function handleWallCollision(ball, velocity) {
    if (!tableBounds) return;

    const restitution = 0.9;
    const ballRadius = 0.1;

    if (ball.position.x - ballRadius < tableBounds.minX) {
        ball.position.x = tableBounds.minX + ballRadius;
        velocity.x *= -restitution;
    }

    if (ball.position.x + ballRadius > tableBounds.maxX) {
        ball.position.x = tableBounds.maxX - ballRadius;
        velocity.x *= -restitution;
    }

    if (ball.position.z - ballRadius < tableBounds.minZ) {
        ball.position.z = tableBounds.minZ + ballRadius;
        velocity.z *= -restitution;
    }

    if (ball.position.z + ballRadius > tableBounds.maxZ) {
        ball.position.z = tableBounds.maxZ - ballRadius;
        velocity.z *= -restitution;
    }
}

// Funciones
function updateCuePosition() {
    cue.position.x = whiteBall.mesh.position.x + Math.sin(cueAngle) * cueRadius;
    cue.position.z = whiteBall.mesh.position.z + Math.cos(cueAngle) * cueRadius;
    cue.position.y = whiteBall.mesh.position.y;

    cue.lookAt(whiteBall.mesh.position);
    cue.rotateX(Math.PI / 2);
}

function updatePhysics() {
    balls.forEach(ball => {
        ball.mesh.position.add(ball.velocity);
    });

    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            const ballA = balls[i];
            const ballB = balls[j];

            const dx = ballB.mesh.position.x - ballA.mesh.position.x;
            const dz = ballB.mesh.position.z - ballA.mesh.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);

            if (distance < ballRadius * 2) {
                const nx = dx / distance;
                const nz = dz / distance;

                const p =
                    2 *
                    (ballA.velocity.x * nx + ballA.velocity.z * nz -
                        ballB.velocity.x * nx - ballB.velocity.z * nz) /
                    2;

                ballA.velocity.x -= p * nx;
                ballA.velocity.z -= p * nz;
                ballB.velocity.x += p * nx;
                ballB.velocity.z += p * nz;

                const overlap = ballRadius * 2 - distance;
                ballA.mesh.position.x -= (overlap / 2) * nx;
                ballA.mesh.position.z -= (overlap / 2) * nz;
                ballB.mesh.position.x += (overlap / 2) * nx;
                ballB.mesh.position.z += (overlap / 2) * nz;
            }
        }
    }

    balls.forEach(ball => {
        handleWallCollision(ball.mesh, ball.velocity);
    });

    balls.forEach(ball => {
        ball.velocity.multiplyScalar(friction);
        if (ball.velocity.length() < 0.0005) ball.velocity.set(0, 0, 0);
    });
}

function updateStrike() {
    if (!isStriking) return;

    const strikeSpeed = 0.08;
    strikeProgress += strikeSpeed;

    const forward = Math.sin(strikeProgress * Math.PI);
    const offset = (1 - forward) * cueRadius;

    cue.position.x = whiteBall.mesh.position.x + Math.sin(cueAngle) * offset;
    cue.position.z = whiteBall.mesh.position.z + Math.cos(cueAngle) * offset;
    cue.lookAt(whiteBall.mesh.position);
    cue.rotateX(Math.PI / 2);

    if (strikeProgress >= 1) {
        isStriking = false;
        whiteBall.velocity.x = -Math.sin(cueAngle) * strikePower;
        whiteBall.velocity.z = -Math.cos(cueAngle) * strikePower;
    }
}

function animate() {
    requestAnimationFrame(animate);
    updatePhysics();
    updateStrike();
    updateCuePosition();
    controls.update();
    renderer.render(scene, camera);
}

animate();

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

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
