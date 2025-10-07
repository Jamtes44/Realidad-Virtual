// Escena, cámara, renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Cámara
camera.position.set(10, 5, 10);

// Plano suelo
const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// Cubo
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Posición inicial del cubo
const launchPoint = new THREE.Vector3(0, 1, 0);
cube.position.copy(launchPoint);

// Variables
let isDragging = false;
let velocity = new THREE.Vector3(0, 0, 0);
const gravity = 9.8;
let lastTime = 0;
let launched = false;

// Raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Plano para raycast (y=1)
const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1);

// UI
const info = document.getElementById('info');

// Función de animación
function animate(time) {
    requestAnimationFrame(animate);

    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;

    if (launched) {
        velocity.y -= gravity * deltaTime;
        cube.position.add(velocity.clone().multiplyScalar(deltaTime));
    }

    renderer.render(scene, camera);
}

// Mouse events
function onMouseDown(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(cube);

    if (intersects.length > 0 && !launched) {
        isDragging = true;
    }
}

function onMouseMove(event) {
    if (isDragging) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(dragPlane, intersection);

        cube.position.copy(intersection);
    }
}

function onMouseUp(event) {
    if (isDragging) {
        isDragging = false;
        // No lanzar aquí, esperar spacebar
    }
}

window.addEventListener('mousedown', onMouseDown);
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('mouseup', onMouseUp);

// Teclado
window.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !launched && !isDragging) {
        event.preventDefault();
        // Lanzar
        const direction = launchPoint.clone().sub(cube.position);
        const power = direction.length() * 5;
        direction.normalize();

        const angle = Math.atan2(direction.y, Math.sqrt(direction.x ** 2 + direction.z ** 2)) * 180 / Math.PI;
        if (angle >= 10 && angle <= 80) {
            velocity.copy(direction.multiplyScalar(power));
            launched = true;
        } else {
            cube.position.copy(launchPoint);
        }
    }
});

animate(0);


