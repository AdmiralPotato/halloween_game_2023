// if you don't pull in packages piecemeal, bundle size go boom
import { ISceneLoaderAsyncResult, SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { FollowCamera } from '@babylonjs/core/Cameras/followCamera';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';

import '@babylonjs/core/Loading/loadingScreen';
import '@babylonjs/core/Helpers/sceneHelpers';
import '@babylonjs/loaders/glTF/2.0/glTFLoader';
import '@babylonjs/core/Rendering/outlineRenderer';

import * as UI from './UserInterface';
import { Room, LevelBuilder } from './LevelBuilder';
import { makeRoomsWithSeed } from './levelGenerator';

import './styles.css';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { AnimationGroup, ShadowGenerator } from '@babylonjs/core';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { setupUserInput } from './userInputState';

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
		scene.clearColor.set(0.2, 0.0, 0.3, 1.0);
		const material = scene.defaultMaterial as StandardMaterial;
		material.diffuseColor.set(0.2, 0.2, 0.2);
		material.specularColor.set(0, 0, 0);
		let level: Mesh | null = null;
		let firstRoom: Room | null = null;
		const playerCharacterHolder = new Mesh('playerCharacterHolder', scene);
		const cameraTarget = new Mesh('cameraTarget', scene);

		const camera = new FollowCamera('Camera', Vector3.Zero(), scene, cameraTarget);
		camera.radius = 4;
		camera.heightOffset = 2;
		console.log('Camera', camera);
		const hemisphereLight: HemisphericLight = new HemisphericLight(
			'hemisphereLight',
			new Vector3(1, 1, 0),
			scene,
		);
		hemisphereLight.diffuse = new Color3(0.2, 0.0, 0.3);
		const directionalLight: DirectionalLight = new DirectionalLight(
			'directionalLight',
			new Vector3(1, -2, -1),
			scene,
		);
		directionalLight.shadowMinZ = -10;
		directionalLight.shadowMaxZ = 1000;
		const shadowGenerator = new ShadowGenerator(2048, directionalLight);
		shadowGenerator.usePercentageCloserFiltering = true;
		// shadowGenerator.blurScale = 5;
		// shadowGenerator.frustumEdgeFalloff = 0;
		// shadowGenerator.usePoissonSampling = true;
		console.log('Some lights, eh?', { hemisphereLight, directionalLight });
		const pullInDevTools = async () => {
			await import('@babylonjs/core/Debug/debugLayer');
			await import('@babylonjs/inspector');
		};

		let characterAnimations: Record<string, AnimationGroup> | null = null;
		const magePromise = SceneLoader.ImportMeshAsync(null, './assets/', 'mage.glb', scene).then(
			(imported) => {
				const mage = imported.meshes[0];
				// console.log('What is a MAGE(imported)?!?', imported);
				const mageAnimationGroup = imported.animationGroups[0];
				mageAnimationGroup.stop();
				// console.log('What is a mageAnimationGroup?', mageAnimationGroup);
				const mageSkeleton = imported.skeletons[0];
				characterAnimations = {
					idle: Object.assign(mageAnimationGroup.clone('Idle'), {
						_loopAnimation: true,
						_from: 0,
						_to: 374,
						_isAdditive: false,
					}) as AnimationGroup,
					run: Object.assign(mageAnimationGroup.clone('Idle'), {
						_loopAnimation: true,
						_from: 375,
						_to: 413,
						_isAdditive: false,
					}) as AnimationGroup,
				};
				characterAnimations.idle.start(true);
				characterAnimations.run.start(true);
				characterAnimations.run.weight = 0;
				// animations.run.loopAnimation = true;
				console.log('What is animations?', characterAnimations);
				const mageTransformNode = scene.getTransformNodeById('mage_bones');
				console.log('What is a MAGE?!?', mageTransformNode);
				mageTransformNode?.position.set(0, 0, 0);
				// mageTransformNode?.scaling.set(4, 4, 4);
				mage.receiveShadows = true;
				shadowGenerator.addShadowCaster(mage);
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
			level = LevelBuilder.build(rooms, meshMap, scene, shadowGenerator);
			scene.addMesh(level);
		};
		const respawnLevelFromStringSeed = () => {
			const seedString = window.prompt('GIVE SEED') || '';
			const rooms = makeRoomsWithSeed(seedString);
			makeLevelFromRooms(rooms);
		};
		const addImportedToMeshMap = (imported: ISceneLoaderAsyncResult) => {
			imported.meshes.forEach((mesh) => {
				// console.log(`What is meshes[${index}]?`, mesh);
				meshMap[mesh.name] = mesh as Mesh;
				// loader auto-attaches the meshes, but I don't want that, so I have to undo that
				scene.removeMesh(mesh);
				mesh.receiveShadows = true;
				shadowGenerator.addShadowCaster(mesh);
			});
		};
		const environmentPromise = SceneLoader.ImportMeshAsync(
			null,
			'./assets/',
			'enviro.glb',
			scene,
		).then(addImportedToMeshMap);
		const doodadsPromise = SceneLoader.ImportMeshAsync(
			null,
			'./assets/',
			'doodads.glb',
			scene,
		).then(addImportedToMeshMap);

		const assetLoadingPromises = [magePromise, environmentPromise, doodadsPromise];
		Promise.all(assetLoadingPromises).then(() => {
			console.log('What is meshMap after all is loaded?', meshMap);
			const rooms = makeRoomsWithSeed('1234') as Room[];
			makeLevelFromRooms(rooms);
			// scene.createDefaultCamera(true, true, true);
		});

		const { buttonStateMap, joystick } = setupUserInput({
			respawnLevelFromStringSeed,
			loadDevToolsCallback: async () => {
				await pullInDevTools();
				if (scene.debugLayer.isVisible()) {
					scene.debugLayer.hide();
				} else {
					await scene.debugLayer.show();
				}
			},
		});

		const isVectorInRoom = (point: Vector3, room: Mesh): boolean => {
			return room.getBoundingInfo().intersectsPoint(point);
		};
		const hideRoomsPlayerIsNotInside = () => {
			const rooms = level?.getChildren();
			if (rooms) {
				rooms.forEach((room) => {
					const isEnabled = room.isEnabled();
					const isPlayerInRoom = isVectorInRoom(
						playerCharacterHolder.position,
						room as Mesh,
					);
					if (isEnabled && !isPlayerInRoom) {
						room.setEnabled(false);
					} else if (!isEnabled && isPlayerInRoom) {
						room.setEnabled(true);
					}
				});
			}
		};

		let lastLogicTick = window.performance.now();
		const motionDrag = 0.85;
		const motionDragVector = new Vector3(motionDrag, motionDrag, motionDrag);
		let motionVector = Vector3.Zero();
		const gameLogicLoop = () => {
			const now = window.performance.now();
			// should be in the scale of seconds?
			const delta = (now - lastLogicTick) / 1000;

			// console.log('buttonStateMap', buttonStateMap);
			const movementSpeed = delta * 1.05;
			if (buttonStateMap.up) {
				motionVector.z -= movementSpeed;
			}
			if (buttonStateMap.down) {
				motionVector.z += movementSpeed;
			}
			if (buttonStateMap.left) {
				motionVector.x += movementSpeed;
			}
			if (buttonStateMap.right) {
				motionVector.x -= movementSpeed;
			}
			if (buttonStateMap.action) {
				motionVector.y += movementSpeed * 4;
			}
			if (joystick.distance !== 0) {
				motionVector.x += (-joystick.x / joystick.options.maxRange) * movementSpeed;
				motionVector.z += (-joystick.y / joystick.options.maxRange) * movementSpeed;
			}
			motionVector.multiplyInPlace(motionDragVector);
			const motionLength = motionVector.length();
			if (characterAnimations) {
				let ratio = Math.max(0, Math.min(1, motionLength / movementSpeed));
				characterAnimations.idle.weight = 1 - ratio;
				characterAnimations.run.weight = ratio;
			}
			if (motionLength > 0.005) {
				playerCharacterHolder.position.addInPlace(motionVector);
				let currentAngle = -Math.atan2(motionVector.z, motionVector.x) + Math.PI / 2;
				playerCharacterHolder.rotation.set(0, currentAngle, 0);
			}
			if (playerCharacterHolder.position.y > 0.05) {
				playerCharacterHolder.position.y *= 0.8;
			}

			playerCharacterHolder.getWorldMatrix().getTranslationToRef(cameraTarget.position);
			hideRoomsPlayerIsNotInside();

			lastLogicTick = now;
		};
		// Let's separate out a game state loop even if rendering is hitching.
		scene.registerBeforeRender(gameLogicLoop);
		engine.runRenderLoop(() => {
			engine.resize();
			scene.render();
		});
	}
}
new App();
