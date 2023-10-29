/*
import '@babylonjs/core/Debug/debugLayer';
import '@babylonjs/inspector';
*/

// if you don't pull in packages piecemeal, bundle size go boom
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Mesh } from '@babylonjs/core/Meshes/mesh';

import '@babylonjs/core/Loading/loadingScreen';
import '@babylonjs/core/Helpers/sceneHelpers';
import '@babylonjs/loaders/glTF/2.0';

import './styles.css';

class App {
	constructor() {
		// create the canvas html element and attach it to the webpage
		const canvas = document.createElement('canvas');
		canvas.style.width = '100%';
		canvas.style.height = '100%';
		canvas.id = 'gameCanvas';
		document.body.appendChild(canvas);

		// initialize babylon scene and engine
		const engine = new Engine(canvas, true);
		const scene = new Scene(engine);

		const camera: ArcRotateCamera = new ArcRotateCamera(
			'Camera',
			Math.PI / 2,
			Math.PI / 2,
			2,
			Vector3.Zero(),
			scene,
		);
		camera.attachControl(canvas, true);
		const light1: HemisphericLight = new HemisphericLight(
			'light1',
			new Vector3(1, 1, 0),
			scene,
		);
		const sphere: Mesh = MeshBuilder.CreateSphere('sphere', { diameter: 1 }, scene);

		console.log('Yo look at these things', { light1, sphere });

		// hide/show the Inspector
		/*
		window.addEventListener('keydown', (ev) => {
			// Shift+Ctrl+Alt+I
			if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
				if (scene.debugLayer.isVisible()) {
					scene.debugLayer.hide();
				} else {
					scene.debugLayer.show();
				}
			}
		});
		*/

		SceneLoader.Append('/assets/', 'mage.glb', scene, function (scene) {
			// Create a default arc rotate camera and light.
			scene.createDefaultCameraOrLight(true, true, true);
		});

		// run the main render loop
		engine.runRenderLoop(() => {
			engine.resize();
			scene.render();
		});
	}
}
new App();
