import { type Scene } from '@babylonjs/core/scene';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { type TransformNode } from '@babylonjs/core';
import { Sprite } from '@babylonjs/core/Sprites/sprite';
import { SpriteManager } from '@babylonjs/core/Sprites/spriteManager';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';

interface CandyState {
	startPosition: Vector3;
	candyMesh: Sprite;
	targetMesh: TransformNode;
	startTime: number;
	endTime: number;
}
const candyTweenTime = 2000;

export const initCandySpawner = (scene: Scene) => {
	const candySpriteManager = new SpriteManager('candy', './assets/candy.png', 50, 256, scene);
	const candyOffsetMesh = new Mesh('candyOffsetMesh');
	candySpriteManager.renderingGroupId = 1;

	let candyStates: CandyState[] = [];
	return {
		tickCandies: (now: number) => {
			const nextCandyStates: CandyState[] = [];
			candyStates.forEach((state) => {
				const targetPosition = state.targetMesh
					.getWorldMatrix()
					.getTranslationToRef(Vector3.Zero());
				const timeRemaining = state.endTime - now;
				const progress = 1 - timeRemaining / candyTweenTime;
				state.candyMesh.position = Vector3.Lerp(
					state.candyMesh.position,
					targetPosition,
					progress,
				);
				state.candyMesh.size = Math.max(0, -progress * 4 + 1);
				const expired = now > state.endTime;
				const distance = state.candyMesh.position.subtract(targetPosition);
				const closeEnough = distance.length() < 0.01;
				if (expired || closeEnough) {
					console.log('Candy removed', state, { expired, closeEnough });
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
			const candy = new Sprite('candy-' + Math.random().toString(), candySpriteManager);
			candy.size = 0.5;
			candy.cellIndex = Math.floor(Math.random() * 9);
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
