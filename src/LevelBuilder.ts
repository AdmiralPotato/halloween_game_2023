import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Scene } from '@babylonjs/core/scene';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { Color3 } from '@babylonjs/core/Maths/math.color';

interface Point {
	x: number;
	y: number;
}

interface Door {
	x: number;
	y: number;
	rot: number;
	destination: string;
}

interface Furnishing {
	name: string;
	x: number;
	y: number;
	w: number;
	d: number;
	h: number;
	rot: number;
	hasCandy: boolean;
}

interface Room {
	name: string;
	width: number;
	depth: number;
	center: Point;
	doors: Door[];
	furnishings: Furnishing[];
}

export const firstLevelRooms = [
	{
		name: 'livingRoom',
		width: 7,
		depth: 5,
		center: {
			x: 0,
			y: 0,
		}, // all other coords are relative to these ^^
		doors: [
			{ x: 0, y: -4, rot: 2, destination: 'frontDoor' },
			{ x: 0, y: 3, rot: 0, destination: 'hallway' },
		],
		furnishings: [
			{
				name: 'couch',
				x: 3,
				y: 3,
				w: 2,
				d: 1,
				h: 1,
				rot: 1,
				hasCandy: true,
			},
			{
				name: 'candelabra',
				x: 4,
				y: 3,
				w: 1,
				d: 1,
				h: 2,
				rot: 0,
				hasCandy: false,
			},
		],
	},
	{
		name: 'hallway',
		width: 7,
		depth: 1,
		center: {
			x: 0,
			y: 3,
		}, // all other coords are relative to these ^^
		doors: [{ x: 0, y: 1, rot: 2, destination: 'livingRoom' }],
		furnishings: [
			{
				name: 'candelabra',
				x: 3,
				y: 0,
				w: 1,
				d: 1,
				h: 2,
				rot: 0,
				hasCandy: true,
			},
		],
	},
] as Room[];

export class LevelBuilder {
	static build(rooms: Room[], scene: Scene): Mesh {
		const base = new Mesh('House', scene);
		rooms.forEach((room) => {
			const floor = CreateBox(
				'floor',
				{
					width: room.width,
					height: 0.01,
					depth: room.depth,
				},
				scene,
			);
			floor.position.x = room.center.x;
			floor.position.z = room.center.y;
			floor.renderOutline = true;
			floor.outlineColor = new Color3(0, 1, 0);
			floor.outlineWidth = 0.01;
			base.addChild(floor);
		});
		return base;
	}
}
