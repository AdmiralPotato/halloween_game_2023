// if you don't pull in packages piecemeal, bundle size go boom
import { ISceneLoaderAsyncResult, SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { FollowCamera } from '@babylonjs/core/Cameras/followCamera';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';

import { type Point, useGameStore } from '../store';
import { LevelBuilder, type Furnishing, type Room } from './LevelBuilder';
import { makeRoomsWithSeed } from './levelGenerator';
import { initCandySpawner } from './CandySpawner';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import {
	type AnimationGroup,
	type Nullable,
	type PBRMaterial,
	ShadowGenerator,
	Texture,
	TransformNode,
} from '@babylonjs/core';
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import {
	// clamp,
	angleLerp,
	mapRange,
	PI,
} from './utilities';

import '@babylonjs/core/Loading/loadingScreen';
import '@babylonjs/core/Helpers/sceneHelpers';
import '@babylonjs/loaders/glTF/2.0/glTFLoader';
import '@babylonjs/core/Rendering/outlineRenderer';

const COLOR_HIGHLIGHTED = new Color3(0, 1, 0);
const COLOR_YES_CANDY = new Color3(1, 0, 0);
const COLOR_NO_CANDY = new Color3(0, 0, 1);

const canvas: HTMLCanvasElement = document.createElement('canvas');

// create the canvas html element and attach it to the webpage
// const canvas = document.createElement('canvas');
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.id = 'gameCanvas';
// still doing this at startup because if ownerDocument isn't present on scene,
// then the babylon inspector tools explode on import

// initialize babylon scene and engine
const engine = new Engine(canvas, true);
const scene = new Scene(engine);
let joystick: Nullable<Point>;
let buttonStateMap: Nullable<Record<string, boolean | undefined>>;
let addCandy: Nullable<(candyCount: number) => void>;
let pauseGame: Nullable<() => void>;
let currentSeed = 'bob';
// scene.clearColor.set(0.2, 0.0, 0.3, 1.0);
scene.clearColor.set(0.0, 0.0, 0.0, 1.0);
const material = scene.defaultMaterial as StandardMaterial;
material.diffuseColor.set(0.2, 0.2, 0.2);
material.specularColor.set(0, 0, 0);
let level: Mesh | null = null;
let currentRoom: Room | null = null;
const playerCharacterHolder = new Mesh('playerCharacterHolder', scene);
const cameraTarget = new Mesh('cameraTarget', scene);
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
actionIntersectMesh.billboardMode = 3;
actionIntersectMesh.renderingGroupId = 1;
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
		playerCharacterMaterial = (playerCharacterMesh?.material as StandardMaterial) || null;
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
	playerCharacterHolder.position.set(currentRoom.x, 0, currentRoom.y);
	// pointing toward the camera
	playerCharacterHolder.rotation.set(0, -PI / 2, 0);
	level = LevelBuilder.build(rooms, meshMap, scene, shadowGenerator);
	scene.addMesh(level);
};

const initLevelFromSeed = (seedString: string, previousSeed: string) => {
	console.log({ seedString, previousSeed });
	currentSeed = seedString;
	rooms = makeRoomsWithSeed(seedString);
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
const environmentPromise = SceneLoader.ImportMeshAsync(null, './assets/', 'enviro.glb', scene).then(
	addImportedToMeshMap,
);
const doodadsPromise = SceneLoader.ImportMeshAsync(null, './assets/', 'doodads.glb', scene).then(
	addImportedToMeshMap,
);

const assetLoadingPromises = [magePromise, environmentPromise, doodadsPromise];
let rooms: Room[] | null;

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
					snapTargetMesh.setEnabled(false);
					actionIntersectMesh.setEnabled(false);
				}
				currentRoom = room;
				// console.log('currentRoom: ', currentRoom);
			}
		});
	}
};

const { spawnCandy, tickCandies } = initCandySpawner(scene);

interface DistanceAndDifference {
	furnishing: Furnishing;
	doodad: Mesh;
	distance: number;
	difference: Vector3;
	absolutePosition: Vector3;
}
const snapDistanceMax = 2;
const snapDistanceMin = 1;
const snapPlayerTargetToNearestAvailableObject = (didAction: boolean) => {
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
					furnishing,
					doodad,
					distance,
					difference,
					absolutePosition: absoluteFurniturePosition,
				});
			} else {
				doodad.renderOutline = false;
			}
		});
		distancesAndDifferences.sort((a, b) => a.distance - b.distance);
		if (distancesAndDifferences.length) {
			const { distance, difference, absolutePosition, doodad, furnishing } =
				distancesAndDifferences[0];
			snapTargetMesh.position = absolutePosition;
			actionIntersectMesh.position = absolutePosition;
			const influence = mapRange(distance, snapDistanceMax, snapDistanceMin, 0, 1);
			const differenceAngle =
				Math.atan2(-difference.z, difference.x) - playerCharacterHolder.rotation.y;
			const targetAngle = angleLerp(0, differenceAngle, influence);
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
				actionIntersectMesh.setEnabled(true);
			}
			if (mageHeadTransformNode?.rotationQuaternion) {
				// quaternion.rotate(), which is additive, only works here because:
				// 1: at the beginning of the tick, the bones control/reset the animation
				// 2: then this comes in and stacks on top of that
				// Without step 1, mage's head would just spin
				mageHeadTransformNode.rotate(Vector3.Up(), -targetAngle);
				// mageSpineTransformNode.computeWorldMatrix();
			}
			// console.log('doodad intersects!', doodad);
			doodad.renderOutline = true;
			doodad.outlineWidth = 0.05;
			doodad.outlineColor = COLOR_HIGHLIGHTED;
			if (didAction) {
				furnishing.checked = true;
				doodad.outlineColor = furnishing.hasCandy ? COLOR_YES_CANDY : COLOR_NO_CANDY;
				snapTargetMesh.setEnabled(false);
				actionIntersectMesh.setEnabled(false);
				if (furnishing.hasCandy) {
					spawnCandy(doodad, candyBucketTransformNode);
					if (addCandy) {
						addCandy(1);
					}
				}
			}
		}
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
	let movementSpeed = delta * 0.8;
	if (buttonStateMap?.shift) {
		movementSpeed *= 0.5;
	}
	if (buttonStateMap?.up) {
		motionVector.z -= movementSpeed;
	}
	if (buttonStateMap?.down) {
		motionVector.z += movementSpeed;
	}
	if (buttonStateMap?.left) {
		motionVector.x += movementSpeed;
	}
	if (buttonStateMap?.right) {
		motionVector.x -= movementSpeed;
	}
	if (buttonStateMap?.action) {
		buttonStateMap.action = false;
		didAction = true;
		if (playerCharacterMaterial) {
			playerCharacterMaterial.alpha = 0;
		}
	}
	if (buttonStateMap?.pause && pauseGame) {
		buttonStateMap.pause = false;
		pauseGame();
	}
	if (buttonStateMap?.camera) {
		buttonStateMap.camera = false;
		toggleCameraMode();
	}
	if (buttonStateMap?.devTools) {
		buttonStateMap.devTools = false;
		toggleDevTools();
	}
	if (joystick) {
		motionVector.x += joystick.x * movementSpeed;
		motionVector.z += joystick.y * movementSpeed;
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
		// create new rotation vector each change,
		// because if the inspector touches this,
		// the mage stops rotating forever ¯\_(ツ)_/¯
		playerCharacterHolder.rotation = new Vector3(0, currentAngle, 6);
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

	snapPlayerTargetToNearestAvailableObject(didAction);

	tickCandies(now);

	lastLogicTick = now;
};
let scaleMultiplier = 1;
engine.runRenderLoop(() => {
	const width = document.body.clientWidth * window.devicePixelRatio * scaleMultiplier;
	const height = document.body.clientHeight * window.devicePixelRatio * scaleMultiplier;
	engine.setSize(width, height, true);
	scene.render();
});
const setResolution = (value: number) => {
	scaleMultiplier = value;
};

Promise.all(assetLoadingPromises).then(() => {
	console.log('What is meshMap after all is loaded?', meshMap);

	const doorwayGlowMaterial: Nullable<PBRMaterial> = meshMap.doorwayGlow
		.material as Nullable<PBRMaterial>;
	if (doorwayGlowMaterial) {
		doorwayGlowMaterial.alpha = 0.99999999999999;
		doorwayGlowMaterial.alphaMode = 1;
		doorwayGlowMaterial.unlit = true;
		// console.log('What is doorwayGlow.material?', doorwayGlowMaterial);
	}

	initLevelFromSeed(currentSeed, '');
	// Let's separate out a game state loop even if rendering is hitching.
	scene.registerBeforeRender(gameLogicLoop);
	// scene.createDefaultCamera(true, true, true);
});

interface GameViewConfig {
	canvasHolder: HTMLDivElement;
	addCandy: (candyCount: number) => void;
	pauseGame: () => void;
	joystick: Point;
	buttonStateMap: Record<string, boolean | undefined>;
}
export const attachGameView = (config: GameViewConfig) => {
	const childrenButArray = Array.prototype.slice.apply(config.canvasHolder.children);
	childrenButArray.forEach((child) => config.canvasHolder.removeChild(child));
	config.canvasHolder.appendChild(canvas);

	addCandy = config.addCandy;
	pauseGame = config.pauseGame;
	buttonStateMap = config.buttonStateMap;
	joystick = config.joystick;
};

const seedSubscriber = useGameStore.subscribe((state) => state.seed, initLevelFromSeed, {
	fireImmediately: false,
});

const resolutionSubscriber = useGameStore.subscribe(
	(state) => state.resolutionScale,
	setResolution,
	{
		fireImmediately: true,
	},
);

console.log('Subscribers', {
	seedSubscriber,
	resolutionSubscriber,
});
