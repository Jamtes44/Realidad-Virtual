// Scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Camera position
camera.position.z = 5;

// OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Gravity and jump variables
let velocityY = 0;
const gravity = 9.8;
const jumpStrength = 5;
let lastTime = 0;

// Key event listener
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        velocityY += jumpStrength;
    }
});

// Animation loop
function animate(currentTime) {
    requestAnimationFrame(animate);

    const deltaTime = (currentTime - lastTime) / 1000; // in seconds
    lastTime = currentTime;

    // Apply gravity
    velocityY -= gravity * deltaTime;

    // Update position
    cube.position.y += velocityY * deltaTime;

    // Ground collision
    if (cube.position.y <= 0) {
        cube.position.y = 0;
        velocityY = 0;
    }

    controls.update();
    renderer.render(scene, camera);
}

animate(0);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
