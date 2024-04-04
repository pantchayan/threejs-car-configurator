// 
// Importing Utilities 
// 
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';

//
// Loading Manager
//
const progressText = document.querySelector('label.progress-bar');
const progressContainer = document.querySelector('div.progress-bar-container');
const progressBar = document.querySelector('progress#progress-bar');
let loadingManager = new THREE.LoadingManager();
let startTime = Date.now();
loadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
    // console.log('Start time : ', startTime);
    // console.log('Started loading files.');
    setTimeout(() => {
        progressText.innerText = 'Loading Assets...';
    }, 100);
};

loadingManager.onLoad = function () {

    // console.log('End time : ', Date.now());
    // console.log('Total time : ' + (Date.now() - startTime) + ' ms');
    // console.log('Loading complete!');
    progressText.innerText = 'Constructing Experience...';
    setTimeout(() => {
        progressContainer.style.display = 'none';
        setTimeout(() => {
            document.querySelector('.model-credit').style.display = 'none';
        }, 2000);
    }, 50);
};

loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
    // console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    let progressPercentage = Math.round(itemsLoaded / itemsTotal * 100);
    progressBar.value = progressPercentage / 100 - 0.02;
    // console.log(progressPercentage, progressBar.value);
};

loadingManager.onError = function (url) {
    console.log('There was an error loading ' + url);
};


//
// Assets 
//
const gltfLoader = new GLTFLoader(loadingManager);
const rgbeLoader = new RGBELoader(loadingManager);
const textureLoader = new THREE.TextureLoader(loadingManager);

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
    // console.log('All assets loaded synchronously', clock.getElapsedTime());

    // onLoadAssets(envMap, gltf);
}

let loadAssets = async () => {
    let [hdr, gltf, woodenGltf] = await Promise.all(
        [
            rgbeLoader.loadAsync('./static/envmaps/parking_garage_4k.hdr'),
            gltfLoader.loadAsync('./static/models/Car/mcLaren-car-model.glb'),
            gltfLoader.loadAsync('./static/models/Car/mcLaren-car-model.glb')
        ]);


    // console.log('All assets loaded asynchronously', clock.getElapsedTime());
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

    // console.log(carModel.position, woodenCarModel.position)
    parkingEnvMap = hdr;

    parkingEnvMap.mapping = THREE.EquirectangularReflectionMapping;
    scene.backgroundBlurriness = 0.2;
    scene.backgroundIntensity = 0.05;
    scene.background = parkingEnvMap;


    scene.add(carModel);


    updateCarMaterials();
    // console.log(clock.getElapsedTime())
}

let updateCarMaterials = () => {
    let currCarModel = carWoody ? woodenCarModel : carModel;
    currCarModel.traverse((child) => {
        if (child.isMesh) {
            child.visible = true;
            child.castShadow = true;

            carModel.receiveShadow = true;

            if (objDebug.toggleCarEnvMap) {
                child.material.envMap = parkingEnvMap;
                child.material.envMapIntensity = objDebug.envMapIntensity;
            }
            else {
                child.material.envMap = null;
            }
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
        // console.log(scene.children.length, woodenCarModel, carModel)
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
            if (objDebug.toggleCarEnvMap) {
                child.material.envMap = parkingEnvMap;
                child.material.envMapIntensity = objDebug.envMapIntensity;
            }
            else {
                child.material.envMap = null;
            }

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
let planeGeometry = new THREE.PlaneGeometry(100, 100);
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
let renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera);
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// ORBIT CONTROLS
let controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.01;
controls.maxPolarAngle = Math.PI / 2 - 0.02;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.8;

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
    toggleShadows: true,
    toggleCarEnvMap: true,
    envMapIntensity: 0.1,
    sceneBackgroundIntensity: 0.05,
    downloadScreenshot: () => {
        const image = canvas.toDataURL('image/png')
        const a = document.createElement('a')
        a.setAttribute('download', 'my-image.png')
        a.setAttribute('href', image)
        a.click()
    },
    cameraRotationSpeed: 0.8
}

const gui = new GUI();
const carMaterialFolder = gui.addFolder('Modify Car Materials');
const lightControlFolder = gui.addFolder('Change Lighting');

carMaterialFolder.close();
lightControlFolder.close();

carMaterialFolder
    .addColor(objDebug, 'carColor')
    .name('Color')
    .onChange(() => {
        updateCarMaterials();
    })

carMaterialFolder
    .add(objDebug, 'carMetalness')
    .name('Metalness')
    .min(0)
    .max(1)
    .step(0.001)
    .onChange(() => {
        updateCarMaterials();
    })

carMaterialFolder
    .add(objDebug, 'carRoughness')
    .name('Roughness')
    .min(0)
    .max(1)
    .step(0.001)
    .onChange(() => {
        updateCarMaterials();
    })

carMaterialFolder
    .add(objDebug, 'carClearcoat')
    .name('Clearcoat')
    .min(0)
    .max(1)
    .step(0.001)
    .onChange(() => {
        updateCarMaterials();
    })

carMaterialFolder
    .add(objDebug, 'carClearcoatRoughness')
    .name('Clearcoat Roughness')
    .min(0)
    .max(1)
    .step(0.001)
    .onChange(() => {
        updateCarMaterials();
    })

carMaterialFolder
    .addColor(objDebug, 'rimColor')
    .name('Rim Color')
    .onChange(() => {
        updateCarMaterials();
    })

carMaterialFolder
    .addColor(objDebug, 'caliperColor')
    .name('Caliper Color')
    .onChange(() => {
        updateCarMaterials();
    })

carMaterialFolder.add(objDebug, 'switchCarTexture').name("Toggle car's texture")

lightControlFolder
    .add(objDebug, 'toggleShadows')
    .name('Toggle Shadow')
    .onChange(() => {
        if (objDebug.toggleShadows) {
            renderer.shadowMap.enabled = true;
        }
        else {
            renderer.shadowMap.enabled = false;
        }
    })

lightControlFolder
    .add(objDebug, 'toggleCarEnvMap')
    .name('Environment Lighting')
    .onChange(updateCarMaterials)


lightControlFolder
    .add(objDebug, 'envMapIntensity')
    .name('Environment Lighting Intensity')
    .min(0)
    .max(1)
    .step(0.001)
    .onChange(updateCarMaterials)

gui
    .add(objDebug, 'sceneBackgroundIntensity')
    .name('Scene Background Intensity')
    .min(0)
    .max(1)
    .step(0.001)
    .onChange(() => {
        scene.backgroundIntensity = objDebug.sceneBackgroundIntensity;
    })

gui
    .add(objDebug, 'downloadScreenshot')
    .name('Download as Image');

gui
    .add(objDebug, 'cameraRotationSpeed')
    .name('Camera rotation speed')
    .min(0)
    .max(4)
    .step(0.01)
    .onChange(() => {
        controls.autoRotateSpeed = objDebug.cameraRotationSpeed;
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

    pointLight.position.x = Math.sin(elapsedTime * 0.3) * 1.5
    pointLight.position.z = - Math.cos(elapsedTime * 0.3) * 1.5
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animation);
}

animation();