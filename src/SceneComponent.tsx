import { useEffect } from 'react';

import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders';
import {
	// AxesViewer,
	Color3,
	CubeTexture,
	Engine,
	HemisphericLight,
	Matrix,
	MeshBuilder,
	PointerEventTypes,
	Scene,
	StandardMaterial,
	Texture,
	UniversalCamera,
	Vector3,
} from '@babylonjs/core';

var canvas: HTMLCanvasElement;
var engine: BABYLON.Engine;
var scene: BABYLON.Scene;
var universalCamera: BABYLON.UniversalCamera;
var isFPSCameraActive: boolean = true;

/****************************************
 * Functional React component representing a 3D scene using Babylon.js.
 ****************************************/
export default function SceneComponent() {
	const initialize = () => {
		console.clear();

		canvas = document.getElementById('canvas') as HTMLCanvasElement;
		console.log('Canvas created successfully');

		engine = new Engine(
			canvas,
			true,
			{
				doNotHandleContextLost: true,
			},
			true,
		);
		console.log('Engine initialized succesfully');

		// let axis = new AxesViewer(scene, 100);
		// console.log(axis);

		document.addEventListener('keydown', (event) => {
			keyDown(event);
		});

		document.addEventListener('keyup', (event) => {
			keyUp(event);
		});

		window.addEventListener('resize', () => {
			engine.resize(true);
		});

		createScene();
		renderLoop();
	};

	useEffect(() => {
		initialize();
	}, []);

	return (
		<div className='App'>
			<canvas id='canvas' />
		</div>
	);
}

/****************************************
 * Handles the keydown event for a specific functionality.
 * @param {KeyboardEvent} event - The KeyboardEvent object representing the keydown event.
 * @returns {void}
 ****************************************/
const keyDown = (event: KeyboardEvent): void => {
	switch (event.key) {
		case 'E':
		case 'e':
			break;

		case 'T':
		case 't':
			//Toggle between FPS and ArcRotate camera
			isFPSCameraActive = !isFPSCameraActive;
			if (isFPSCameraActive) {
				console.log('Using FPS Camera');
				setupFPSCamera();
			} else {
				setupArcRotateCamera();
				console.log('Using ArcRotate Camera');
			}
			break;

		default:
			break;
	}
};

/****************************************
 * Handles the keyup event for a specific functionality.
 * @param {KeyboardEvent} event - The KeyboardEvent object representing the keyup event.
 * @returns {void}
 ****************************************/
const keyUp = (event: KeyboardEvent): void => {
	switch (event.key) {
		case 'E':
		case 'e':
			break;
	}
};

/****************************************
 * Creates and initializes a 3D scene using the Babylon.js framework.
 * @returns {void}
 ****************************************/
const createScene = (): void => {
	scene = new Scene(engine);

	//Set the existing universalCamera instance
	universalCamera = new UniversalCamera(
		'Camera',
		new Vector3(0, 5, -10),
		scene,
	);

	if (isFPSCameraActive) {
		console.log('Using FPS Camera');
		setupFPSCamera();
	} else {
		console.log('Using ArcRotate Camera');
		setupArcRotateCamera();
	}

	//Setting up Basic lighting in scene
	setupLight();

	//Create babylon geometries in scene
	loadPrimitive();
};

/****************************************
 * Sets up and configures the camera for the Babylon.js 3D scene.
 * @returns {void}
 ****************************************/
const setupFPSCamera = () => {
	universalCamera.position = new Vector3(0.0, 5.0, 0.0);

	universalCamera.detachControl();

	universalCamera.checkCollisions = true;
	universalCamera.applyGravity = true;

	universalCamera.speed = 0.5;
	universalCamera.keysUp = [87, 38]; //W & upArrow Key
	universalCamera.keysLeft = [65, 37]; //A & leftArrow key
	universalCamera.keysDown = [83, 40]; //S & downArrow key
	universalCamera.keysRight = [68, 39]; //D & rightArrow Key

	universalCamera.minZ = 0.01;

	universalCamera.attachControl(canvas, true);
};

const setupArcRotateCamera = () => {
	universalCamera.position = new Vector3(0, 5, -10);

	universalCamera.minZ = 0.01;

	universalCamera.detachControl();

	universalCamera.setTarget(Vector3.Zero());

	var rotateStartX = 0;
	var rotateStartY = 0;
	var isRotating = false;
	var rotationSpeed = 0.01;

	var zoomSpeed = 0.1;

	//use input controls for rotation
	scene.onPointerObservable.add((pointerInfo) => {
		switch (pointerInfo.type) {
			case PointerEventTypes.POINTERDOWN:
				if (!isFPSCameraActive) {
					//Start rotation
					isRotating = true;
					rotateStartX = pointerInfo.event.clientX;
					rotateStartY = pointerInfo.event.clientY;
				}
				break;
			case PointerEventTypes.POINTERUP:
				if (!isFPSCameraActive) {
					//End rotation
					isRotating = false;
				}
				break;
			case PointerEventTypes.POINTERMOVE:
				if (!isFPSCameraActive) {
					if (isRotating) {
						var deltaX = pointerInfo.event.clientX - rotateStartX;
						var deltaY = pointerInfo.event.clientY - rotateStartY;

						//Convert mouse movement to rotation angles
						var rotationX = deltaX * rotationSpeed;
						var rotationY = deltaY * rotationSpeed;

						//Update camera rotation
						universalCamera.position = Vector3.TransformCoordinates(
							universalCamera.position.subtract(Vector3.Zero()),
							Matrix.RotationY(rotationX),
						);
						universalCamera.position = Vector3.TransformCoordinates(
							universalCamera.position.subtract(Vector3.Zero()),
							Matrix.RotationX(rotationY),
						);
						universalCamera.position = universalCamera.position.add(
							Vector3.Zero(),
						);

						rotateStartX = pointerInfo.event.clientX;
						rotateStartY = pointerInfo.event.clientY;
					}
				}
				break;
		}
	});

	//Use input controls for zoom
	canvas.addEventListener('wheel', function (event) {
		// Adjust camera distance for zoom
		var zoomDelta = event.deltaY * zoomSpeed;
		var distance = Vector3.Distance(
			universalCamera.position,
			Vector3.Zero(),
		);

		// Ensure zoom doesn't go negative or too close
		var newDistance = Math.max(distance - zoomDelta, 0.1);
		universalCamera.position = Vector3.Lerp(
			universalCamera.position,
			Vector3.Zero(),
			newDistance / distance,
		);
	});

	//Attach the camera to the scene
	scene.activeCamera = universalCamera;

	//Update camera target direction each frame
	scene.onBeforeRenderObservable.add(() => {
		if (!isFPSCameraActive) {
			universalCamera.setTarget(Vector3.Zero());
		}
	});

	universalCamera.attachControl(canvas, true);
};

/****************************************
 * Sets up and configures lighting for the Babylon.js 3D scene.
 * @returns {void}
 ****************************************/
const setupLight = () => {
	var hemiLight = new HemisphericLight(
		'hemiLight',
		new Vector3(-1, 1, 0),
		scene,
	);

	hemiLight.intensity = 1.0;
};

/****************************************
 * Creates and loads primitive shapes into the Babylon.js 3D scene.
 * @returns {void}
 ****************************************/
const loadPrimitive = () => {
	//Skybox
	var skybox = MeshBuilder.CreateBox('skyBox', { size: 5000.0 }, scene);
	var skyboxMaterial = new StandardMaterial('skyBox', scene);
	skyboxMaterial.backFaceCulling = false;
	skyboxMaterial.reflectionTexture = new CubeTexture(
		'/assets/TropicalSunnyDay',
		scene,
	);
	skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
	skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
	skyboxMaterial.specularColor = new Color3(0, 0, 0);
	skybox.material = skyboxMaterial;

	//Ground
	var ground = MeshBuilder.CreateGround(
		'ground',
		{ width: 25, height: 25 },
		scene,
	);
	ground.position = new Vector3(0, 0, 0);
	var groundMat = new StandardMaterial('groundMat', scene);
	groundMat.diffuseColor = new Color3(1, 1, 1);
	groundMat.backFaceCulling = false;
	var groundTex = new Texture('/assets/grass.png', scene);
	groundTex.uScale = 3;
	groundTex.vScale = 3;
	groundMat.diffuseTexture = groundTex;

	ground.checkCollisions = true;
	ground.material = groundMat;

	//Boxes
	var box = MeshBuilder.CreateBox('crate', { size: 2 }, scene);
	var boxMat = new StandardMaterial('Mat', scene);
	boxMat.diffuseTexture = new Texture('/assets/crate.png', scene);
	box.material = boxMat;
	box.checkCollisions = true;

	var boxNb = 15;
	var theta = 0;
	var radius = 7;
	box.position = new Vector3(
		(radius + randomNumber(-0.5 * radius, 0.5 * radius)) *
			Math.cos(theta + randomNumber(-0.1 * theta, 0.1 * theta)),
		1,
		(radius + randomNumber(-0.5 * radius, 0.5 * radius)) *
			Math.sin(theta + randomNumber(-0.1 * theta, 0.1 * theta)),
	);

	var boxes = [box];
	for (var i = 1; i < boxNb; i++) {
		theta += (2 * Math.PI) / boxNb;
		var newBox = box.clone('box' + i);
		boxes.push(newBox);
		newBox.position = new Vector3(
			(radius + randomNumber(-0.5 * radius, 0.5 * radius)) *
				Math.cos(theta + randomNumber(-0.1 * theta, 0.1 * theta)),
			1,
			(radius + randomNumber(-0.5 * radius, 0.5 * radius)) *
				Math.sin(theta + randomNumber(-0.1 * theta, 0.1 * theta)),
		);
	}
};

/****************************************
 * Generates the random number between given minimum & maximum range
 * @returns {void}
 ****************************************/
const randomNumber = (min: number, max: number) => {
	if (min == max) {
		return min;
	}
	var random = Math.random();
	return random * (max - min) + min;
};

/****************************************
 * Initiates the rendering loop for continuous updates and rendering of the Babylon.js scene.
 * @returns {void}
 ****************************************/
const renderLoop = () => {
	engine.runRenderLoop(() => {
		scene.render();
	});
};
