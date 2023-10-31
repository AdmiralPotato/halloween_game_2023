import { Furnishing } from "./LevelBuilder";
import { RandomWeight, XYCoord, XYRange, randomFromRange } from "./utilities";

export interface RoomInfo {
	name: string,
	exteriorWalls: string[],
	defaultSize: XYRange,
}
export interface RoomWorkingData {
	width: number;
	depth: number;
	cornerCoords: XYRange;
	x: number;
	y: number;
	doorCoords: XYCoord[];
	name: string;
	roomID: string;
	floorTiles: Tile[];
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
		cornerCoords: {
			x: { min: NaN, max: NaN },
			y: { min: NaN, max: NaN }
		},
		x: NaN,
		y: NaN,
		doorCoords: [],
		name: '',
		roomID: roomID,
		floorTiles: [],
		floors: [],
		doors: [],
		furnishings: [],
	};
};

const shortWallStuff: RandomWeight[] = [
	// wallHanging
	{ item: 'curtainShort', weight: 1 },
	{ item: 'mirrorShort', weight: 1 },
	{ item: 'paintingSml', weight: 1 },
];
const tallWallStuff: RandomWeight[] = [
	// wallHanging
	{ item: 'curtain', weight: 1 },
	{ item: 'mirrorTall', weight: 1 },
	{ item: 'paintingTall', weight: 1 },
];
const everyRoomStuff: RandomWeight[] = [
	{ item: 'cobwebEdge', weight: 4 },
	{ item: 'pottedPlant', weight: 2 },
	{ item: 'gargoyle', weight: 1 },
	{ item: 'grandfatherClock', weight: 1 },
	{ item: 'candelabra', weight: 2 },
	{ item: 'endtable_primitive0', weight: 1 },
	{ item: 'EMPTY', weight: 2 },
];

export const ROOM_CONTENTS: Record<string, RandomWeight[]> = {
	livingRoom: [
		{ item: 'fireplace', count: 1 },
		{ item: 'couchCenter', weight: 1 },
		{ item: 'couch', weight: 1 },
		{ item: 'armchair', weight: 2 },
		{ item: 'squareTable', weight: 4 },
		{ item: 'tableRound', weight: 4 },
		{ item: 'bookcaseWide', weight: 1 },
		{ item: 'bookcaseNarr', weight: 2 },
		...tallWallStuff,
		...everyRoomStuff
	],
	hallway: [
		{ item: 'chest', weight: 1 },
		{ item: 'couch', weight: 1 },
		{ item: 'armchair', weight: 2 },
		{ item: 'bookcaseShor', weight: 3 },
		{ item: 'bookcaseShNr', weight: 1 },
		{ item: 'squareTable', weight: 4 },
		{ item: 'tableRound', weight: 4 },
		{ item: 'door', weight: 5 },
		...shortWallStuff,
		...everyRoomStuff
	],
	diningRoom: [
		{ item: 'diningTable4', count: 1 },
		{ item: 'armchair', weight: 4 },
		...tallWallStuff,
		...everyRoomStuff,
	],
	bedroom: [
		{ item: 'bed', count: 1 },
		{ item: 'wardrobe', count: 1 },
		{ item: 'fireplace', count: 1 },
		{ item: 'chest', weight: 3 },
		{ item: 'chair', weight: 2 },
		{ item: 'armchair', weight: 1 },
		{ item: 'squareTable', weight: 1 },
		{ item: 'tableRound', weight: 1 },
		{ item: 'bookcaseShNr', weight: 1 },
		{ item: 'dresserShort', count: 1 },
		{ item: 'dresserTall', count: 1 },
		{ item: 'door', count: 1 },
		...shortWallStuff,
		...everyRoomStuff,
	],
	library: [
		{ item: 'couchCenter', weight: 3 },
		{ item: 'couch', weight: 1 },
		{ item: 'armchair', weight: 2 },
		{ item: 'squareTable', weight: 4 },
		{ item: 'tableRound', weight: 4 },
		{ item: 'bookcaseShor', weight: 3 },
		{ item: 'bookcaseShNr', weight: 3 },
		{ item: 'bookcaseWide', weight: 10 },
		{ item: 'bookcaseNarr', weight: 8 },
		...shortWallStuff,
		...everyRoomStuff,
	],
};
