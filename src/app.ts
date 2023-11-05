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

import { Room, LevelBuilder } from './LevelBuilder';
import { makeRoomsWithSeed } from './levelGenerator';
import { initCandySpawner } from './CandySpawner';

import './styles.css';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { type AnimationGroup, ShadowGenerator, Texture, TransformNode } from '@babylonjs/core';
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { setupUserInput } from './userInputState';
import {
	// angleLerp,
	// mapRange,
	PI,
} from './utilities';

const COLOR_HIGHLIGHTED = new Color3(0, 1, 0);
const COLOR_YES_CANDY = new Color3(1, 0, 0);
const COLOR_NO_CANDY = new Color3(0, 0, 1);

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
		// scene.clearColor.set(0.2, 0.0, 0.3, 1.0);
		scene.clearColor.set(0.0, 0.0, 0.0, 1.0);
		const material = scene.defaultMaterial as StandardMaterial;
		material.diffuseColor.set(0.2, 0.2, 0.2);
		material.specularColor.set(0, 0, 0);
		let level: Mesh | null = null;
		let currentRoom: Room | null = null;
		const playerCharacterHolder = new Mesh('playerCharacterHolder', scene);
		const cameraTarget = new Mesh('cameraTarget', scene);
		const actionIntersectMeshParent = new Mesh('actionIntersectMeshParent');
		const actionIntersectMesh = CreatePlane('actionIntersectMesh', {
			size: 0.5,
			sideOrientation: Mesh.DOUBLESIDE,
		});
		const snapTargetMesh = CreatePlane('snapTargetMesh', {
			size: 0.75,
			sideOrientation: Mesh.DOUBLESIDE,
		});
		let playerCharacterMesh: Mesh | null = null;
		let playerCharacterMaterial: StandardMaterial | null = null;
		const candyBucketTransformNode = new TransformNode('candyBucketTransformNode');
		actionIntersectMeshParent.addChild(actionIntersectMesh);
		actionIntersectMesh.billboardMode = 3;
		snapTargetMesh.billboardMode = 3;
		snapTargetMesh.renderingGroupId = 1;
		const actionTargetMaterial = new StandardMaterial('actionIntersectMeshMaterial');
		const sparkTexture = new Texture('./assets/spark.png');
		actionTargetMaterial.diffuseTexture = sparkTexture;
		actionTargetMaterial.alphaMode = Engine.ALPHA_ADD;
		actionTargetMaterial.opacityTexture = sparkTexture;
		// mat.diffuseColor = new Color3(0, 0.5, 0.9);
		actionIntersectMesh.material = actionTargetMaterial;
		const snapTargetMaterial = new StandardMaterial('actionIntersectMeshMaterial');
		snapTargetMaterial.diffuseColor = Color3.Purple();
		snapTargetMaterial.alphaMode = Engine.ALPHA_ADD;
		snapTargetMaterial.opacityTexture = sparkTexture;
		snapTargetMesh.material = snapTargetMaterial;
		actionIntersectMeshParent.position.set(0, 0.5, 0.75);

		const camera = new FollowCamera('Camera', Vector3.Zero(), scene, cameraTarget);
		let currentCameraStateIndex = 0;
		const cameraConfigurations = [
			{ radius: 4, heightOffset: 1.5, name: 'play' },
			{ radius: 8, heightOffset: 4, name: 'edit' },
			{ radius: 4, heightOffset: 9, name: 'mgs' },
		];
		const initCameraState = () => {
			Object.assign(camera, cameraConfigurations[currentCameraStateIndex]);
		};
		initCameraState();
		const toggleCameraMode = () => {
			currentCameraStateIndex += 1;
			currentCameraStateIndex %= cameraConfigurations.length;
			initCameraState();
		};
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
		const toggleDevTools = async () => {
			await pullInDevTools();
			if (scene.debugLayer.isVisible()) {
				scene.debugLayer.hide();
			} else {
				await scene.debugLayer.show();
			}
		};
		let mageHeadTransformNode: TransformNode | null = null;
		let characterAnimations: Record<string, AnimationGroup> | null = null;
		const magePromise = SceneLoader.ImportMeshAsync(null, './assets/', 'mage.glb', scene).then(
			(imported) => {
				const mage = imported.meshes[0];
				playerCharacterMesh = (scene.getMeshById('mage_mesh') as Mesh) || null;
				playerCharacterMaterial =
					(playerCharacterMesh?.material as StandardMaterial) || null;
				// console.log('What is a MAGE(imported)?!?', imported);
				const mageAnimationGroup = imported.animationGroups[0];
				mageAnimationGroup.stop();
				// console.log('What is a mageAnimationGroup?', mageAnimationGroup);
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
				// characterAnimations.idle.pause();
				// characterAnimations.run.pause();
				characterAnimations.run.weight = 0;
				// animations.run.loopAnimation = true;
				console.log('What is animations?', characterAnimations);
				const mageTransformNode = scene.getTransformNodeById('mage_bones');
				mageHeadTransformNode = scene.getTransformNodeById('head');
				const mageHandTransformNode = scene.getTransformNodeById('handItem_R');
				candyBucketTransformNode.parent = mageHandTransformNode;
				// move to the center of the pumpkin below the hand
				candyBucketTransformNode.position.z -= 0.25;
				console.log('What is a MAGE?!?', mageTransformNode);
				playerCharacterMesh.addChild(actionIntersectMeshParent);
				mageTransformNode?.position.set(0, 0, 0);
				mageTransformNode?.addRotation(0, -PI / 2, 0); // character was designed facing -y, but 0 deg is +x
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
			currentRoom = rooms[0];
			playerCharacterHolder.position.set(currentRoom.x + 1.5, 0, currentRoom.y);
			// pointing toward the camera
			playerCharacterHolder.rotation.set(0, -PI / 2, 0);
			level = LevelBuilder.build(rooms, meshMap, scene, shadowGenerator);
			scene.addMesh(level);
		};

		const initLevelFromSeed = (seedString: string) => {
			rooms = makeRoomsWithSeed(seedString);
			makeLevelFromRooms(rooms);
		};
		const respawnLevelFromStringSeed = () => {
			const seedString = window.prompt('GIVE SEED') || '';
			initLevelFromSeed(seedString);
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
		let rooms: Room[] | null;

		const { buttonStateMap, joystick } = setupUserInput();

		const isVectorInsideMesh = (point: Vector3, room: Mesh): boolean => {
			return room.getBoundingInfo().intersectsPoint(point);
		};
		const hideRoomsPlayerIsNotInside = () => {
			if (rooms) {
				rooms.forEach((room) => {
					const mesh = room.roomMesh;
					if (!mesh) {
						return; // can't intersect with mesh that's missing
					}
					const isEnabled = mesh.isEnabled();
					const isPlayerInRoom = isVectorInsideMesh(playerCharacterHolder.position, mesh);
					if (isEnabled && !isPlayerInRoom) {
						mesh.setEnabled(false);
						console.log();
					} else if (isPlayerInRoom) {
						if (!isEnabled) {
							mesh.setEnabled(true);
						}
						currentRoom = room;
						// console.log('currentRoom: ', currentRoom);
					}
				});
			}
		};

		interface DistanceAndDifference {
			distance: number;
			difference: Vector3;
			absolutePosition: Vector3;
		}
		const snapDistanceMax = 2;
		// const snapDistanceMin = 1;
		const snapPlayerTargetToNearestAvailableObject = () => {
			// const motionVectorAngle = Math.atan2(-motionVector.z, motionVector.x);
			// const rotation = playerCharacterHolder.rotation;
			const interactVector = playerCharacterHolder
				.getWorldMatrix()
				.getTranslationToRef(Vector3.Zero());
			if (currentRoom?.furnishingMeshes) {
				const distancesAndDifferences: DistanceAndDifference[] = [];
				currentRoom?.furnishingMeshes.forEach((doodad, index) => {
					const furnishing = currentRoom?.furnishings[index];
					if (!furnishing) {
						throw new Error('Somehow we dont have furnishing???');
					} else if (furnishing.checked) {
						return; // don't snap to furniture already checked
					}
					const absoluteFurniturePosition = doodad
						.getWorldMatrix()
						.getTranslationToRef(Vector3.Zero());
					absoluteFurniturePosition.y = 0.5;
					const difference = absoluteFurniturePosition.subtract(interactVector);
					const distance = difference.length();
					if (distance < snapDistanceMax) {
						distancesAndDifferences.push({
							distance,
							difference,
							absolutePosition: absoluteFurniturePosition,
						});
					}
				});
				distancesAndDifferences.sort((a, b) => a.distance - b.distance);
				if (distancesAndDifferences.length) {
					const {
						// distance,
						difference,
						absolutePosition,
					} = distancesAndDifferences[0];
					snapTargetMesh.position = absolutePosition;
					// const influence = mapRange(distance, snapDistanceMax, snapDistanceMin, 0, 1);
					const differenceAngle =
						Math.atan2(-difference.z, difference.x) - playerCharacterHolder.rotation.y;
					// const targetAngle = angleLerp(influence, motionVectorAngle, differenceAngle);
					// console.log('distancesAndDifferences', {
					// 	currentAngle: rotation.y,
					// 	distance,
					// 	difference,
					// 	influence,
					// 	differenceAngle,
					// 	targetAngle,
					// });
					if (!snapTargetMesh.isEnabled()) {
						snapTargetMesh.setEnabled(true);
					}
					if (mageHeadTransformNode?.rotationQuaternion) {
						// quaternion.rotate(), which is additive, only works here because:
						// 1: at the beginning of the tick, the bones control/reset the animation
						// 2: then this comes in and stacks on top of that
						// Without step 1, mage's head would just spin
						mageHeadTransformNode.rotate(Vector3.Up(), -differenceAngle);
						// mageSpineTransformNode.computeWorldMatrix();
					}
				}
			}
		};

		const { spawnCandy, tickCandies } = initCandySpawner(scene);

		const doActionIntersect = (didAction: boolean) => {
			const interactVector = actionIntersectMesh
				.getWorldMatrix()
				.getTranslationToRef(Vector3.Zero());
			if (currentRoom?.furnishingMeshes) {
				currentRoom?.furnishingMeshes.forEach((doodad, index) => {
					const furnishing = currentRoom?.furnishings[index];
					if (!furnishing) {
						throw new Error('Somehow we dont have furnishing???');
					}
					const intersects = isVectorInsideMesh(interactVector, doodad);
					if (intersects) {
						// console.log('doodad intersects!', doodad);
						doodad.renderOutline = true;
						doodad.outlineWidth = 0.05;
						if (!furnishing.checked) {
							doodad.outlineColor = COLOR_HIGHLIGHTED;
							if (didAction) {
								furnishing.checked = true;
								doodad.outlineColor = furnishing.hasCandy
									? COLOR_YES_CANDY
									: COLOR_NO_CANDY;
								snapTargetMesh.setEnabled(false);
								if (furnishing.hasCandy) {
									spawnCandy(doodad, candyBucketTransformNode);
								}
							}
						}
					} else {
						if (!furnishing.checked) {
							doodad.renderOutline = false;
						}
					}
				});
			}
		};

		let lastLogicTick = window.performance.now();
		const motionDrag = 0.85;
		const motionDragVector = new Vector3(motionDrag, motionDrag, motionDrag);
		const motionVector = Vector3.Zero();
		const gameLogicLoop = () => {
			const now = window.performance.now();
			// should be in the scale of seconds?
			const delta = (now - lastLogicTick) / 1000;
			let didAction = false;
			// console.log('buttonStateMap', buttonStateMap);
			const movementSpeed = delta * 0.8;
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
				buttonStateMap.action = false;
				didAction = true;
				if (playerCharacterMaterial) {
					playerCharacterMaterial.alpha = 0;
					console.log('What is playerCharacterMaterial?', playerCharacterMaterial);
				}
			}
			if (buttonStateMap.seed) {
				buttonStateMap.seed = false;
				respawnLevelFromStringSeed();
			}
			if (buttonStateMap.camera) {
				buttonStateMap.camera = false;
				toggleCameraMode();
			}
			if (buttonStateMap.devTools) {
				buttonStateMap.devTools = false;
				toggleDevTools();
			}
			if (joystick.distance !== 0) {
				motionVector.x += (-joystick.x / joystick.options.maxRange) * movementSpeed;
				motionVector.z += (-joystick.y / joystick.options.maxRange) * movementSpeed;
			}
			motionVector.multiplyInPlace(motionDragVector);
			const motionLength = motionVector.length();
			if (characterAnimations) {
				const ratio = Math.max(0, Math.min(1, motionLength / movementSpeed));
				characterAnimations.idle.weight = 1 - ratio;
				characterAnimations.run.weight = ratio;
			}
			if (motionLength > 0.005) {
				playerCharacterHolder.position.addInPlace(motionVector);
				const currentAngle = Math.atan2(-motionVector.z, motionVector.x);
				playerCharacterHolder.rotation.set(0, currentAngle, 0);
			}
			if (playerCharacterHolder.position.y > 0.05) {
				playerCharacterHolder.position.y *= 0.8;
			}
			if (playerCharacterMaterial && playerCharacterMaterial.alpha !== 1) {
				playerCharacterMaterial.alpha = Math.min(playerCharacterMaterial.alpha + 0.1, 1);
			}

			playerCharacterHolder.getWorldMatrix().getTranslationToRef(cameraTarget.position);
			cameraTarget.position.y += 0.5;
			hideRoomsPlayerIsNotInside();
			actionIntersectMesh.rotate(new Vector3(0, 0, 1), delta * 5);

			snapPlayerTargetToNearestAvailableObject();

			tickCandies(now);

			doActionIntersect(didAction);
			lastLogicTick = now;
		};
		engine.runRenderLoop(() => {
			engine.resize();
			scene.render();
		});

		Promise.all(assetLoadingPromises).then(() => {
			console.log('What is meshMap after all is loaded?', meshMap);
			initLevelFromSeed('bob');
			// Let's separate out a game state loop even if rendering is hitching.
			scene.registerBeforeRender(gameLogicLoop);
			// scene.createDefaultCamera(true, true, true);
		});
	}
}
new App();
