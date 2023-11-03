import { type Scene } from '@babylonjs/core/scene';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { type InstancedMesh } from '@babylonjs/core/Meshes/instancedMesh';
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Texture, type TransformNode } from '@babylonjs/core';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';

interface CandyState {
	startPosition: Vector3;
	candyMesh: InstancedMesh;
	targetMesh: TransformNode;
	startTime: number;
	endTime: number;
}
const candyTweenTime = 2000;

export const initCandySpawner = (scene: Scene) => {
	const protoCandy = CreatePlane('protoCandy', {
		size: 0.25,
		sideOrientation: Mesh.DOUBLESIDE,
	});
	scene.removeMesh(protoCandy); // BAD! DO NOT attach to default scene!
	const candyMaterial = new StandardMaterial('actionIntersectMeshMaterial');
	const sparkTexture = new Texture('./assets/spark.png');
	candyMaterial.diffuseTexture = sparkTexture;
	protoCandy.material = candyMaterial;
	candyMaterial.alphaMode = Engine.ALPHA_ADD;
	candyMaterial.opacityTexture = sparkTexture;
	const candyOffsetMesh = new Mesh('candyOffsetMesh');

	let candyStates: CandyState[] = [];
	return {
		tickCandies: (now: number) => {
			let nextCandyStates: CandyState[] = [];
			candyStates.forEach((state) => {
				const targetPosition = state.targetMesh
					.getWorldMatrix()
					.getTranslationToRef(Vector3.Zero());
				let timeRemaining = state.endTime - now;
				const progress = 1 - timeRemaining / candyTweenTime;
				state.candyMesh.position = Vector3.Lerp(
					state.candyMesh.position,
					targetPosition,
					progress,
				);
				const expired = now > state.endTime;
				const distance = state.candyMesh.position.subtract(targetPosition);
				const closeEnough = distance.length() < 0.01;
				if (expired || closeEnough) {
					console.log('Candy removed', state, { expired, closeEnough });
					scene.removeMesh(state.candyMesh);
					state.candyMesh.dispose();
				} else {
					nextCandyStates.push(state);
				}
			});
			candyStates = nextCandyStates;
		},
		spawnCandy: (spawnPointMesh: Mesh, targetMesh: TransformNode) => {
			spawnPointMesh.addChild(candyOffsetMesh);
			candyOffsetMesh.position = new Vector3(0, 1.25, 0.5);
			// computeWorldMatrix() IS IMPORTANT!
			// Without running this, we don't get updated transforms this tick!
			candyOffsetMesh.computeWorldMatrix();
			console.log('targetObject.getWorldMatrix()', spawnPointMesh.getWorldMatrix());
			const candy = protoCandy.createInstance('candy-' + Math.random().toString());
			scene.addMesh(candy);
			candy.position = candyOffsetMesh.getWorldMatrix().getTranslationToRef(Vector3.Zero());
			// console.log('candy.position', candy.position);
			// candyOffsetMesh.addChild(candy);
			// candy.position = candyOffsetMesh.getWorldMatrix().getTranslationToRef(Vector3.Zero());
			const now = window.performance.now();
			candyStates.push({
				startPosition: candy.position.clone(),
				candyMesh: candy,
				targetMesh,
				startTime: now,
				endTime: now + candyTweenTime,
			});
		},
	};
};
