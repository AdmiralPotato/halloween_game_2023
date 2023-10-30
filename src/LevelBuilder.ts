import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Scene } from '@babylonjs/core/scene';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';

interface Door {
	name: string;
	x: number;
	y: number;
	rot: number;
	destination: string;
}
interface Floor {
	name: string;
	x: number;
	y: number;
	rot: number;
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

export interface Room {
	name: string;
	width: number;
	depth: number;
	x: number;
	y: number;
	doors: Door[];
	floors: Floor[];
	furnishings: Furnishing[];
}

export class LevelBuilder {
	static build(rooms: Room[], meshMap: Record<string, Mesh>, scene: Scene): Mesh {
		const base = new Mesh('House', scene);
		rooms.forEach((room) => {
			const floor = CreateBox(
				'floor-' + room.name,
				{
					width: room.width,
					height: 0.01,
					depth: room.depth,
				},
				scene,
			);
			floor.position.x = room.x;
			floor.position.z = room.y;
			floor.renderOutline = true;
			floor.outlineColor = new Color3(0, 1, 0);
			floor.outlineWidth = 0.01;
			base.addChild(floor);
			const furnishings = [
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
					x: 5,
					y: 3,
					w: 1,
					d: 1,
					h: 2,
					rot: 0,
					hasCandy: false,
				},
			] as Furnishing[];
			furnishings.forEach((furnishing) => {
				const doodad = CreateBox(
					room.name + '-floor-' + furnishing.name,
					{
						width: furnishing.w,
						height: furnishing.h,
						depth: furnishing.d,
					},
					scene,
				);
				floor.addChild(doodad);
				doodad.position.x = furnishing.x;
				doodad.position.z = furnishing.y;
				doodad.position.y = furnishing.h / 2;
				doodad.renderOutline = true;
				doodad.outlineColor = furnishing.hasCandy
					? new Color3(1, 0, 0)
					: new Color3(0, 0, 1);
				doodad.outlineWidth = 0.01;
			});
			const doors = [
				{
					x: 0,
					y: -room.depth / 2,
					rot: 0,
				},
			] as Door[];
			doors.forEach((door) => {
				const doodad = meshMap['doorway_00'].createInstance(Math.random().toString());
				floor.addChild(doodad);
				doodad.position.x = door.x;
				doodad.position.z = door.y;
				doodad.renderOutline = true;
				doodad.outlineColor = new Color3(0, 1, 1);
				doodad.outlineWidth = 0.01;
			});
		});
		return base;
	}
}
