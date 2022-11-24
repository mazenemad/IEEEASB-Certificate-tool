import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { DoubleSide, FrontSide, Light, Material, PointLight } from 'three'
import {FontLoader} from "three/examples/jsm/loaders/FontLoader.js"
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry.js"
import { createNoise3D } from 'simplex-noise';

/**
 * Base
 */
// Debug
// const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
const scene1 = new THREE.Scene()

//loaders
const textureloader = new THREE.TextureLoader()
const fontloader = new FontLoader()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 0.6
scene.add(camera)

// Controls
    // const controls = new OrbitControls(camera, canvas)
    // controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
// renderer.autoClear=false

// renderer.setClearColor('black')

/**
 * my tubes
 */

 const simplex3 = createNoise3D();

 function computeCurl(x, y, z){
    var eps = 0.0001;
  
    var curl = new THREE.Vector3();
  
    //Find rate of change in YZ plane
    var n1 = simplex3(x, y + eps, z); 
    var n2 = simplex3(x, y - eps, z); 
    //Average to find approximate derivative
    var a = (n1 - n2)/(2 * eps);
    var n1 = simplex3(x, y, z + eps); 
    var n2 = simplex3(x, y, z - eps); 
    //Average to find approximate derivative
    var b = (n1 - n2)/(2 * eps);
    curl.x = a - b;
  
    //Find rate of change in XZ plane
    n1 = simplex3(x, y, z + eps); 
    n2 = simplex3(x, y, z - eps); 
    a = (n1 - n2)/(2 * eps);
    n1 = simplex3(x + eps, y, z); 
    n2 = simplex3(x - eps, y, z); 
    b = (n1 - n2)/(2 * eps);
    curl.y = a - b;
  
    //Find rate of change in XY plane
    n1 = simplex3(x + eps, y, z); 
    n2 = simplex3(x - eps, y, z); 
    a = (n1 - n2)/(2 * eps);
    n1 = simplex3(x, y + eps, z); 
    n2 = simplex3(x, y - eps, z); 
    b = (n1 - n2)/(2 * eps);
    curl.z = a - b;
  
    return curl;
  }

    const material = new THREE.ShaderMaterial( {

    side:THREE.DoubleSide,

	uniforms: {
		time: { value: 0 },
		uLight: { value: new THREE.Vector3(0,0,0) },
		resolution: { value: new THREE.Vector4() },
		
	},

	vertexShader: `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 v_worldPosition;
    void main() {
        vUv = uv;
        vPosition = position;
        vNormal = normal;
        v_worldPosition = (modelMatrix * vec4(position,1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }    
    `,
	fragmentShader:`
    uniform float uTime;
    varying vec2 vUv;
    uniform vec3 uLight;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 v_worldPosition;
    float getScatter(vec3 cameraPos,vec3 dir,vec3 lightPos,float d){

        vec3 q = cameraPos - lightPos;
        
        float b= dot(dir, q);
        float c = dot(q, q);
        
        float t = c - b*b;
        float s = 1.0 / sqrt(max(0.0001, t));
        float l = s * (atan( (d + b) * s) - atan(b*s));
        
        return pow(max(0.0, l/150.), 0.4);
        }

void main() 
{
    vec3 cameraToWorld = v_worldPosition - cameraPosition;
    vec3 cameraToWorldDir = normalize(cameraToWorld);
    float cameraToWorldDist = length(cameraToWorld);

    vec3 lightDir = normalize(uLight - v_worldPosition);
    float diffusion = max(0.,dot(vNormal,lightDir));
    float dist = length(uLight - vPosition);

    float scatter = getScatter(cameraPosition,cameraToWorldDir,uLight,cameraToWorldDist);

    float final = scatter * diffusion;

    gl_FragColor = vec4(1. - dist, 0.0,0.0, 1.0);
    gl_FragColor = vec4(diffusion, 0.0,0.0, 1.0);
    gl_FragColor = vec4(scatter, 0.0,0.0, 1.0);
}
    `

} );

const materialtube = new THREE.ShaderMaterial( {

    side:THREE.DoubleSide,

	uniforms: {
		time: { value: 0 },
		uLight: { value: new THREE.Vector3(0,0,0) },
		resolution: { value: new THREE.Vector4() },
		
	},

	vertexShader: `
    uniform float time;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 v_worldPosition;
    void main() {
        vUv = uv;
        vPosition = position;
        vNormal = normal;
        v_worldPosition = (modelMatrix * vec4(position,1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }    
    `,
	fragmentShader:`
    uniform float time;
    varying vec2 vUv;
    uniform vec3 uLight;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 v_worldPosition;
    float getScatter(vec3 cameraPos,vec3 dir,vec3 lightPos,float d){

        vec3 q = cameraPos - lightPos;
        
        float b= dot(dir, q);
        float c = dot(q, q);
        
        float t = c - b*b;
        float s = 1.0 / sqrt(max(0.0001, t));
        float l = s * (atan( (d + b) * s) - atan(b*s));
        
        return pow(max(0.0, l/15.), 0.4);
        }

void main() 
{

    float dash = sin(vUv.x*20.0 + time*0.5 );
    if(dash<0.3) discard;
    vec3 cameraToWorld = v_worldPosition - cameraPosition;
    vec3 cameraToWorldDir = normalize(cameraToWorld);
    float cameraToWorldDist = length(cameraToWorld);

    vec3 lightDir = normalize(uLight - v_worldPosition);
    float diffusion = max(0.,dot(vNormal,lightDir));
    float dist = length(uLight - vPosition);

    float scatter = getScatter(cameraPosition,cameraToWorldDir,uLight,cameraToWorldDist);

    float final = scatter * diffusion;

    gl_FragColor = vec4(1. - dist, 0.0,0.0, 1.0);
    gl_FragColor = vec4(diffusion, 0.0,0.0, 1.0);
    gl_FragColor = vec4(scatter, 0.0,0.0, 1.0);
}
    `

} );


// for(let i=0; i<300;i++){
//     let path = new THREE.CatmullRomCurve3(getCurve(
//         new THREE.Vector3(
//              Math.random() -0.5,
//              Math.random() -0.5,
//              Math.random() -0.5 
//         )
//     ))
//     const tube= new THREE.TubeBufferGeometry(path,600,0.005,8,false)
// const curve = new THREE.Mesh(tube,materialtube)
// scene.add(curve)
// }

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const emouse = new THREE.Vector2();
const elasticMouse = new THREE.Vector2(0,0);
const elasticMouseVel = new THREE.Vector2(0,0);
const temp = new THREE.Vector2(0,0);
let light,raycasterPlane;

function getCurve(start){
    let devider=3
    let points=[]
    points.push(start)
    let currentPoint=start.clone()
    for(let i=0; i<600;i++){
        let v = computeCurl(currentPoint.x/devider,currentPoint.y/devider,currentPoint.z/devider)
        currentPoint.addScaledVector(v,0.001)
        points.push(currentPoint.clone())
    }
        return points;
    }
    function raycast(){
    raycasterPlane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(10,10),
        // new THREE.MeshBasicMaterial({color:0xcb0d02})
        material
    )
     light = new THREE.Mesh(
        new THREE.SphereBufferGeometry(0.02,20,20),
        new THREE.MeshBasicMaterial({color:'white'})
    )
    scene.add(raycasterPlane)
    scene.add(light)
    raycasterPlane.position.z=-1
    light.position.z=-1
    }
    raycast()

/**
 * Animate
 */
 
document.addEventListener('mousemove',(event)=>{
   
mouse.x=(event.clientX/sizes.width)*2-1
mouse.y=-(event.clientY/sizes.height)*2+1
emouse.x=event.clientX
emouse.y=event.clientY
 //raycaster 
 raycaster.setFromCamera(mouse,camera)
 const intersects = raycaster.intersectObjects([raycasterPlane] );
 for (let i = 0; i < intersects.length; i ++ ) {
    let p=intersects[0].point;
 light.position.copy(p)
    emouse.x=p.x;
    emouse.y=p.y;
 }
}) 


const clock = new THREE.Clock()
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()    
    // Update controls
    // controls.update()
    
    //mouse pouncing
    temp.copy(emouse).sub(elasticMouse).multiplyScalar(0.15)
    elasticMouseVel.add(temp)
    elasticMouseVel.multiplyScalar(.8);
    elasticMouse.add(elasticMouseVel)
    light.position.x=elasticMouse.x
    light.position.y=elasticMouse.y
    material.uniforms.uLight.value = light.position
    materialtube.uniforms.uLight.value = light.position
    materialtube.uniforms.time.value = elapsedTime
    materialtube.uniforms.time.value = elapsedTime

     
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()



