
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

let W =10;
let H = 10;

const geometry = new THREE.BoxGeometry( W, H, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add(cube);
cube.position.z=-1

camera.position.z = 10;

function createball(radio,px,py,vx,vy,m,f){
    const geometry = new THREE.SphereGeometry( radio, 10, 10 ); 
    const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } ); 
    const sphere = new THREE.Mesh( geometry, material ); 
    scene.add( sphere );
    sphere.position.set(px,py, 0);
    const MyObject=
    {
      rad: radio,
      Mesh:sphere,
      Position: new THREE.Vector3(px.py,0),
      Velocity: new THREE.Vector3(vx,vy,0,),
      mass: m,
      fr: f
    }
    return MyObject
}

function updateBall(Ball){
  let deltaTime = 0.5;
  Ball.Velocity.multiplyScalar(Ball.fr);

  Ball.Position.add(Ball.Velocity.clone().multiplyScalar(deltaTime))
  Ball.Mesh.position.copy(Ball.Position)

  if(Math.abs(Ball.Position.y)>H/2)
  {
    Ball.Velocity.y=-1*Ball.Velocity.y
  }
  if(Math.abs(Ball.Position.x)>W/2)
  {
    Ball.Velocity.x=-1*Ball.Velocity.x
  }
}
function BallsColision(Ball1,Ball2){

  let d=Ball1.Position.distanceTo(Ball2.Position)
  
  if (d< Ball1.rad + Ball2.rad)
  {
    console.log("hi")
    let NormalVector=Ball1.Position.clone().sub(Ball2.Position).normalize()
    let RelativeVel=Ball1.Velocity.clone().sub(Ball2.Velocity)
    let ProjectVector=RelativeVel.clone().dot(NormalVector)
    if(ProjectVector>0){
      return
    }
    let impulso=-(2.5*ProjectVector)/(Ball1.mass+Ball2.mass)
    Ball1.Velocity.add(NormalVector.clone().multiplyScalar(impulso*Ball1.mass))
    Ball2.Velocity.sub(NormalVector.clone().multiplyScalar(impulso*Ball2.mass))
  }
}

const Balls=[
createball(0.2,1,1,0.1,0.3,0.5,0.99),
createball(0.2,1,-2,0.2,0.1,0.5,0.99),
createball(0.2,-2,-2,0.1,0.2,0.5,0.99)
]
function animate() {

  for(let i=0;i<Balls.length;i++)
  {
    updateBall(Balls[i])
  }
  for(let i=0; i < Balls.length;i++){
    for (let j= i+1; j < Balls.length; j++){
      BallsColision(Balls[i],Balls[j])
    }
  }
  
  renderer.render( scene, camera );

}