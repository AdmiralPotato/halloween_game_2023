// if you don't pull in packages piecemeal, bundle size go boom
import { ISceneLoaderAsyncResult, SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';

import '@babylonjs/core/Loading/loadingScreen';
import '@babylonjs/core/Helpers/sceneHelpers';
import '@babylonjs/loaders/glTF/2.0/glTFLoader';
import '@babylonjs/core/Rendering/outlineRenderer';

import * as UI from './UserInterface';
import { Room, LevelBuilder } from './LevelBuilder';
import { makeRoomsWithSeed } from './levelGenerator.mjs';

import './styles.css';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { Skeleton } from '@babylonjs/core';
// @ts-ignore // doesn't have a d.ts, is function that takes an ArrayBuffer and returns Number
import crc32 from 'crc32';

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
		const material = scene.defaultMaterial as StandardMaterial;
		material.diffuseColor.set(0.2, 0.2, 0.2);
		material.specularColor.set(0, 0, 0);
		let level: Mesh | null = null;
		let firstRoom: Room | null = null;
		const playerCharacterHolder = new Mesh('playerCharacterHolder', scene);

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

		console.log('Yo look at these things', { light1 });

		const pullInDevTools = async () => {
			await import('@babylonjs/core/Debug/debugLayer');
			await import('@babylonjs/inspector');
		};

		// hide/show the Inspector
		window.addEventListener('keydown', async (ev) => {
			// Shift+Ctrl+Alt+I
			if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.key === 'I') {
				await pullInDevTools();
				if (scene.debugLayer.isVisible()) {
					scene.debugLayer.hide();
				} else {
					await scene.debugLayer.show();
				}
			}
		});
		const magePromise = SceneLoader.ImportMeshAsync(null, '/assets/', 'mage.glb', scene).then(
			(imported) => {
				console.log('What is mage imported?', imported);
				const mage = imported.meshes[0];
				const mageTransformNode = scene.getTransformNodeById('mage_bones');
				mageTransformNode?.position.set(0, 0, 0);
				mageTransformNode?.scaling.set(4, 4, 4);
				playerCharacterHolder.addChild(mage);
				return mage;
			},
		);

		const meshMap: Record<string, Mesh> = {};
		const makeLevelFromRooms = (rooms: Room[]) => {
			if (level) {
				level.dispose();
			}
			firstRoom = rooms[5];
			playerCharacterHolder.position.set(firstRoom.x, 0, firstRoom.y);
			level = LevelBuilder.build(rooms, meshMap, scene);
			scene.addMesh(level);
		};
		const respawnLevelFromStringSeed = () => {
			const seedString = window.prompt('GIVE SEED') || '';
			const buffer = new TextEncoder().encode(seedString);
			const seed: number = crc32(buffer);
			const rooms = makeRoomsWithSeed(seed) as Room[];
			makeLevelFromRooms(rooms);
		};
		const addImportedToMeshMap = (imported: ISceneLoaderAsyncResult) => {
			imported.meshes.forEach((mesh, index) => {
				console.log(`What is meshes[${index}]?`, mesh);
				meshMap[mesh.name] = mesh as Mesh;
				// loader auto-attaches the meshes, but I don't want that, so I have to undo that
				scene.removeMesh(mesh);
			});
		};
		const environmentPromise = SceneLoader.ImportMeshAsync(
			null,
			'/assets/',
			'enviro.glb',
			scene,
		).then(addImportedToMeshMap);
		const doodadsPromise = SceneLoader.ImportMeshAsync(
			null,
			'/assets/',
			'doodads.glb',
			scene,
		).then(addImportedToMeshMap);

		const assetLoadingPromises = [magePromise, environmentPromise, doodadsPromise];
		Promise.all(assetLoadingPromises).then(() => {
			const rooms = makeRoomsWithSeed(1234) as Room[];
			makeLevelFromRooms(rooms);
			scene.createDefaultCameraOrLight(true, true, true);
		});

		const { seedButton } = UI.init();
		seedButton.onPointerUpObservable.add(respawnLevelFromStringSeed);
		engine.runRenderLoop(() => {
			engine.resize();
			scene.render();
		});
	}
}
new App();
