// 
// Importing Utilities 
// 
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';

//
// Assets 
//
const gltfLoader = new GLTFLoader();
const rgbeLoader = new RGBELoader();
const textureLoader = new THREE.TextureLoader();

let woodAOTexture = textureLoader.load('./static/textures/wood/wood_ao_2k.jpg');

let woodColorTexture = textureLoader.load('./static/textures/wood/wood_diff_2k.jpg');
woodColorTexture.colorSpace = THREE.SRGBColorSpace;
let woodDispTexture = textureLoader.load('./static/textures/wood/wood_disp_2k.png');
let woodNormalTexture = textureLoader.load('./static/textures/wood/wood_nor_gl_2k.png');
let woodRoughnessTexture = textureLoader.load('./static/textures/wood/wood_rough_2k.png');


let parkingEnvMap;
let carModel;
let woodenCarModel;

let clock = new THREE.Clock();
clock.start()
const delay = (time) => new Promise((resolve, reject) => setTimeout(resolve, time))

let loadAssetsSync = async () => {
    let envMap = await rgbeLoader.loadAsync('./static/envmaps/parking_garage_4k.hdr');
    await delay(1000)
    let gltf = await gltfLoader.loadAsync('./static/models/Car/mcLaren-car-model.glb');
    console.log('All assets loaded synchronously', clock.getElapsedTime());

    // onLoadAssets(envMap, gltf);
}

let loadAssets = async () => {
    let [hdr, gltf, woodenGltf] = await Promise.all(
        [
            rgbeLoader.loadAsync('./static/envmaps/parking_garage_4k.hdr'),
            gltfLoader.loadAsync('./static/models/Car/mcLaren-car-model.glb'),
            gltfLoader.loadAsync('./static/models/Car/mcLaren-car-model.glb')
        ]);


    console.log('All assets loaded asynchronously', clock.getElapsedTime());
    woodenCarModel = woodenGltf.scene;
    woodenCarModel.traverse((child) => {
        if (child.isMesh) {
            child.visible = false;
        }
    })

    scene.add(woodenCarModel);
    onLoadAssets(hdr, gltf);
}

let onLoadAssets = (hdr, gltf) => {
    carModel = gltf.scene;

    console.log(carModel.position, woodenCarModel.position)
    parkingEnvMap = hdr;

    parkingEnvMap.mapping = THREE.EquirectangularReflectionMapping;
    scene.backgroundBlurriness = 0.2;
    scene.backgroundIntensity = 0.5;
    scene.background = parkingEnvMap;


    scene.add(carModel);


    updateCarMaterials();
    console.log(clock.getElapsedTime())
}

let updateCarMaterials = () => {
    let currCarModel = carWoody ? woodenCarModel : carModel;
    currCarModel.traverse((child) => {
        if (child.isMesh) {
            child.visible = true;
            child.castShadow = true;

            carModel.receiveShadow = true;
            // apply custom material
            child.material.envMap = parkingEnvMap;

            // console.log(child.userData.name)
            if (child.userData.name.includes('Carpaint') && !child.userData.name.includes('Black') && !child.userData.name.includes('Wiper')) {
                child.material.color.set(objDebug.carColor)
                child.material.metalness = objDebug.carMetalness;
                child.material.roughness = objDebug.carRoughness;
                if (child.material instanceof THREE.MeshPhysicalMaterial) {
                    child.material.clearcoat = objDebug.carClearcoat;
                    child.material.clearcoatRoughness = objDebug.carClearcoatRoughness;
                }
            }
            if (child.userData.name.includes('Rim')) {
                child.material.color.set(objDebug.rimColor)
            }
            if (child.userData.name.includes('Caliper')) {
                child.material.color.set(objDebug.caliperColor)
            }
            if (child.userData.name.includes('Carbon')) {

            }
        }
    })
}

// loadAssetsSync();
loadAssets();

let carWoody = false;
let switchCarMaterials = () => {
    if (carWoody) {
        woodenCarModel.traverse((child) => {
            if (child.isMesh) {
                child.visible = false;
            }
        })
        console.log(scene.children.length, woodenCarModel, carModel)
        carWoody = !carWoody;
        updateCarMaterials();
        return;
    }

    carWoody = !carWoody;

    carModel.traverse((child) => {
        if (child.isMesh) {
            child.visible = false;
        }
    })

    woodenCarModel.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.visible = true;
            child.receiveShadow = true;
            // apply custom material
            child.material.envMap = parkingEnvMap;

            // console.log(child.userData.name)
            if (child.userData.name.includes('Carpaint') && !child.userData.name.includes('Black') && !child.userData.name.includes('Wiper')) {
                // child.material.color.set(objDebug.carColor)
                child.material.color.set('white');
                child.material.metalness = 0;
                child.material.roughness = 1;
                child.material.normalMap = woodNormalTexture;
                child.material.map = woodColorTexture;
                child.material.aoMap = woodAOTexture;
                child.material.aoMapIntensity = 1;
                child.material.displacementMap = woodDispTexture;
                child.material.roughnessMap = woodRoughnessTexture;
            }
        }
    })

}


// // Environment Map
// let envMap;
// rgbeLoader.load('./static/envmaps/parking_garage_4k.hdr', (hdr) => {
//     console.log('loaded envMap', clock.getElapsedTime());
//     hdr.mapping = THREE.EquirectangularReflectionMapping;
//     envMap = hdr;
//     scene.backgroundBlurriness = 0.2;
//     scene.backgroundIntensity = 0.5;
//     scene.background = hdr;

//     // scene.environment = hdr;
// })

// // 3D Models
// gltfLoader.load('./static/models/Car/mcLaren-car-model.glb', (gltf) => {
//     console.log('loaded GLTF', clock.getElapsedTime());
//     let model = gltf.scene;
//     scene.add(model);

//     model.traverse((child) => {
//         if (child.isMesh) {
//             child.material.envMap = envMap;
//         }
//     })

// })


// 
// Canvas
// 
let canvas = document.querySelector('.webgl');

// 
// Sizes 
//
let sizes = {
    height: window.innerHeight,
    width: window.innerWidth
}

//
// Scene
// 
let scene = new THREE.Scene();

//
// Object
//
let planeGeometry = new THREE.PlaneGeometry(10, 10);
let planeMaterial = new THREE.MeshStandardMaterial({ color: '#c2c2c2' });
planeMaterial.metalness = 0.7;
planeMaterial.roughness = 0.5;
let planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.rotation.x = -Math.PI / 2;
planeMesh.receiveShadow = true;
scene.add(planeMesh);

//
// Lights
//
// const ambientLight = new THREE.AmbientLight('white', 1);
// scene.add(ambientLight)

const pointLight = new THREE.PointLight('white', 6);
pointLight.position.y = 3;
pointLight.castShadow = true;
pointLight.shadow.radius = 9;
scene.add(pointLight);

let aspectRatio = sizes.width / sizes.height;
//
// Camera
//
let camera = new THREE.PerspectiveCamera(
    45, // 45 to 75
    aspectRatio, // aspectRatio
    0.1, // near => 10 cm
    100); // far => 100 m

camera.position.set(3.5, 2.8, 5);
scene.add(camera);
scene.add(camera);

//
// Renderer
//
let renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera);
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// ORBIT CONTROLS
let controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.01;

//
// DEBUG UI
//
let objDebug = {
    carColor: '#FF0000',
    rimColor: '#5e5e5e',
    caliperColor: '#FF0000',
    carRoughness: 0.5,
    carMetalness: 0.5,
    carClearcoat: 0.0,
    carClearcoatRoughness: 0.5,
    switchCarTexture: switchCarMaterials,
    enableShadows: true
}

const gui = new GUI();

gui
    .addColor(objDebug, 'carColor')
    .onChange(() => {
        updateCarMaterials();
    })

gui
    .add(objDebug, 'carMetalness')
    .min(0)
    .max(1)
    .step(0.001)
    .onChange(() => {
        updateCarMaterials();
    })

gui
    .add(objDebug, 'carRoughness')
    .min(0)
    .max(1)
    .step(0.001)
    .onChange(() => {
        updateCarMaterials();
    })

gui
    .add(objDebug, 'carClearcoat')
    .min(0)
    .max(1)
    .step(0.001)
    .onChange(() => {
        updateCarMaterials();
    })

gui
    .add(objDebug, 'carClearcoatRoughness')
    .min(0)
    .max(1)
    .step(0.001)
    .onChange(() => {
        updateCarMaterials();
    })

gui
    .addColor(objDebug, 'rimColor')
    .onChange(() => {
        updateCarMaterials();
    })

gui
    .addColor(objDebug, 'caliperColor')
    .onChange(() => {
        updateCarMaterials();
    })

gui.add(objDebug, 'switchCarTexture')
gui.add(objDebug, 'enableShadows').onChange(() => {
    if(objDebug.enableShadows){
        renderer.shadowMap.enabled = true;
    }
    else{
        renderer.shadowMap.enabled = false;
    }
})


// 
// RESIZE HANDLER
// 
window.addEventListener('resize', () => {
    sizes.height = window.innerHeight;
    sizes.width = window.innerWidth;

    renderer.setSize(sizes.width, sizes.height)

    aspectRatio = sizes.width / sizes.height;
    camera.aspect = aspectRatio;
    camera.updateProjectionMatrix();

    // Edge case
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    renderer.render(scene, camera);
});

const mouse = new THREE.Vector2()

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1
})

// 
// TIME BOUNDED ANIMATION METHOD 3
// 
let animation = () => {
    let elapsedTime = clock.getElapsedTime();

    pointLight.position.x = Math.sin(elapsedTime) * 1.5
    pointLight.position.z = Math.cos(elapsedTime) * 1.5
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animation);
}

animation();