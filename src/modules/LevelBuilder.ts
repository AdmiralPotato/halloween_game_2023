import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { type Scene } from '@babylonjs/core/scene';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { Axis } from '@babylonjs/core/Maths/math.axis';
import { type AbstractMesh, type ShadowGenerator } from '@babylonjs/core';
const RIGHT_ANGLE = Math.PI / 2;

interface Door {
	name: string;
	x: number;
	y: number;
	rot: number;
	destination: string;
}
interface Floor {
	name: string;
	asset: string;
	x: number;
	y: number;
	rot: number;
}

export interface Furnishing {
	label: string;
	name: string;
	asset: string;
	x: number;
	y: number;
	w: number;
	d: number;
	h: number;
	rot: number;
	hasCandy: boolean;
	checked?: boolean;
}

export interface Room {
	name: string;
	width: number;
	depth: number;
	x: number;
	y: number;
	doors: Door[];
	floors: Floor[];
	furnishings: Furnishing[];
	roomMesh?: Mesh;
	furnishingMeshes?: Mesh[];
}

export class LevelBuilder {
	static build(
		rooms: Room[],
		meshMap: Record<string, Mesh>,
		scene: Scene,
		shadowGenerator: ShadowGenerator,
	): Mesh {
		const base = new Mesh('House', scene);
		rooms.forEach((room) => {
			const floor = CreateBox(
				'floor-' + room.name,
				{
					width: room.width,
					height: 2,
					depth: room.depth,
				},
				scene,
			);
			floor.visibility = 0.5;
			floor.position.x = room.x;
			floor.position.z = room.y;
			floor.position.y = 0.95; // let the mesh sink a little below the player, for "isInRoom" check
			floor.receiveShadows = true;
			floor.visibility = 0;
			// floor.outlineColor = new Color3(0, 1, 1);
			// floor.outlineWidth = 0.01;
			room.roomMesh = floor;
			base.addChild(floor);
			const doTheDoodadShuffle = (
				furnishing: Furnishing | Door | Floor,
				doodad: AbstractMesh,
			) => {
				floor.addChild(doodad);
				doodad.position.x = furnishing.x;
				doodad.position.z = furnishing.y;
				doodad.rotate(Axis.Y, furnishing.rot * RIGHT_ANGLE);
				doodad.receiveShadows = true;
				shadowGenerator.addShadowCaster(doodad);
			};
			const furnishingMeshes: Mesh[] = [];
			room.furnishings.forEach((furnishing, index) => {
				const doodad = meshMap[furnishing.name].clone(
					`${room.name}-furnishing-${index}-${furnishing.name}`,
				);
				doTheDoodadShuffle(furnishing, doodad);
				if (furnishing.asset === 'doorframe') {
					const glow = meshMap['doorwayGlow'].clone(
						`${room.name}-furnishing-${index}-${furnishing.name}-doorwayGlow`,
					);
					doTheDoodadShuffle(furnishing, glow);
				} else {
					furnishingMeshes.push(doodad);
				}
				return doodad;
			});
			room.furnishingMeshes = furnishingMeshes;
			room.doors.forEach((door) => {
				const doodad = meshMap['doorway'].createInstance(door.name);
				floor.addChild(doodad);
				doTheDoodadShuffle(door, doodad);
			});
			room.floors.forEach((floorOrWallConfig) => {
				if (!floorOrWallConfig.asset) {
					console.log(
						'floorOrWallConfig is missing `asset` property!',
						floorOrWallConfig.asset,
					);
				}
				const doodad = meshMap[floorOrWallConfig.asset || 'wall'].createInstance(
					floorOrWallConfig.name || Math.random().toString(),
				);
				floor.addChild(doodad);
				doTheDoodadShuffle(floorOrWallConfig, doodad);
				shadowGenerator.addShadowCaster(doodad);
			});
		});
		return base;
	}
}
