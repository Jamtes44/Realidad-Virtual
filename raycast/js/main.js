
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);


const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const geometry1 = new THREE.BoxGeometry(6, 1, 1);
const material1 = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const cube1 = new THREE.Mesh(geometry1, material1);
scene.add(cube1);
cube1.position.y=-5

const cube2 = new THREE.Mesh(geometry1, material1);
scene.add(cube2);
cube2.position.y=-5
cube2.position.x= 10

const geometry2 = new THREE.BoxGeometry(1, 6, 1);
const material2 = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const cube3 = new THREE.Mesh(geometry2, material2);
scene.add(cube3);
cube3.position.x=14
cube3.position.y=-2;


let ay=-0.01;
let vy=0;

const raycaster = new THREE.Raycaster();


let moveSpeed = 0.5;
function onKeyDown(event) {
    let direction = new THREE.Vector3(0, 0, 0);
    switch (event.key.toLowerCase()) {
        case 'a':
            direction.set(-1, 0, 0);
            break;
        case 'd':
            direction.set(1, 0, 0);
            break;
        default:
            return;
    }

    // Raycast para colisión en eje X con cube3
    raycaster.set(cube.position, direction);
    const intersects = raycaster.intersectObject(cube3);
    if (intersects.length > 0 && intersects[0].distance < moveSpeed) {
        return; // No mover si colisión
    }

    // Mover
    cube.position.x += direction.x * moveSpeed;
}


window.addEventListener('keydown', onKeyDown);

function animate() {
    const direccion = new THREE.Vector3(0,-1,0);
    raycaster.set(cube.position,direccion);
    const intersects = raycaster.intersectObjects( scene.children );
    vy+=ay;

    cube.position.y += vy
    if(intersects.length>0)
    {
        if(intersects[0].distance<1)
        {
            vy=-1*vy
            cube.position.y+=0.5
        }
    }


    renderer.render(scene, camera);
}


animate();


window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
