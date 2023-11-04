import { Furnishing } from "./LevelBuilder";
import { XYCoord, XYRange, randomFromRange } from "./utilities";

export interface RoomInfo {
	name: string,
	exteriorWalls: string[],
	defaultSize: XYRange,
}
export interface RoomWorkingData {
	width: number;
	depth: number;
	x: number;
	y: number;
	doorCoords: XYCoord[];
	name: string;
	roomID: string;
	doors: Tile[];
	floors: Tile[];
	furnishings: Furnishing[];
}

const normalRoomSize: XYRange = {
	x: { min: 4, max: 7 },
	y: { min: 3, max: 4 },
};
export const ROOMS: Record<string, RoomInfo> = {
	'a': {
		name: "livingRoom",
		exteriorWalls: ['w', 'e'],
		defaultSize: {
			x: { min: 6, max: 9 },
			y: { min: 4, max: 6 },
		},
	},
	'b': {
		name: "hallway",
		exteriorWalls: [],
		defaultSize: {
			x: { min: 2, max: 2 },
			y: { min: NaN, max: NaN },
		},
	},
	'c': {
		name: "RANDOM",
		exteriorWalls: ['e'],
		defaultSize: normalRoomSize,
	},
	'd': {
		name: "RANDOM",
		exteriorWalls: ['w'],
		defaultSize: normalRoomSize,
	},
	'e': {
		name: "RANDOM",
		exteriorWalls: ['w', 'n'],
		defaultSize: normalRoomSize,
	},
	'f': {
		name: "RANDOM",
		exteriorWalls: ['e', 'n'],
		defaultSize: normalRoomSize,
	},
};
export interface Tile {
	asset: string;
	compositeInfo: string;
	name: string;
	type: string;
	x: number;
	y: number;
	rot: number;
	destination: string;
	wallDir: string;
	roomID: string;
}
export const buildRoom = (roomID: string): RoomWorkingData => {
	// width first
	return {
		width: randomFromRange(ROOMS[roomID].defaultSize.x),
		depth: randomFromRange(ROOMS[roomID].defaultSize.y),
		x: NaN,
		y: NaN,
		doorCoords: [],
		name: '',
		roomID: roomID,
		floors: [],
		doors: [],
		furnishings: [],
	};
};
