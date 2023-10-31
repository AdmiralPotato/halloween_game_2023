export const ROOMS = {
	'a': {
		name: "livingRoom",
		exteriorWalls: ['w', 'e'],
	},
	'b': {
		name: "hallway",
		exteriorWalls: [],
	},
	'c': {
		name: "RANDOM",
		exteriorWalls: ['e'],
	},
	'd': {
		name: "RANDOM",
		exteriorWalls: ['w'],
	},
	'e': {
		name: "RANDOM",
		exteriorWalls: ['w', 'n'],
	},
	'f': {
		name: "RANDOM",
		exteriorWalls: ['e', 'n'],
	},
};

const shortWallStuff = [
	// wallHanging
	{ item: 'curtainShort', weight: 1 },
	{ item: 'mirrorShort', weight: 1 },
	{ item: 'paintingSml', weight: 1 },
];
const tallWallStuff = [
	// wallHanging
	{ item: 'curtain', weight: 1 },
	{ item: 'mirrorTall', weight: 1 },
	{ item: 'paintingTall', weight: 1 },
];
const everyRoomStuff = [
	{ item: 'cobwebEdge', weight: 4 },
	{ item: 'pottedPlant', weight: 2 },
	{ item: 'gargoyle', weight: 1 },
	{ item: 'grandfatherClock', weight: 1 },
	{ item: 'candelabra', weight: 2 },
	{ item: 'endtable_primitive0', weight: 1 },
	{ item: 'EMPTY', weight: 2 },
];

export const ROOM_CONTENTS = {
	livingRoom: [
		{ item: 'fireplace', count: 1 },
		{ item: 'couchCenter', weight: 1 },
		{ item: 'couch', weight: 1 },
		{ item: 'armchair', weight: 2 },
		{ item: 'squareTable', weight: 4 },
		{ item: 'tableRound', weight: 4 },
		{ item: 'bookcaseWide', weight: 1 },
		{ item: 'bookcaseNarr', weight: 2 },
	].concat(tallWallStuff).concat(everyRoomStuff),
	hallway: [
		{ item: 'chest', weight: 1 },
		{ item: 'couch', weight: 1 },
		{ item: 'armchair', weight: 2 },
		{ item: 'bookcaseShor', weight: 3 },
		{ item: 'bookcaseShNr', weight: 1 },
		{ item: 'squareTable', weight: 4 },
		{ item: 'tableRound', weight: 4 },
		{ item: 'door', weight: 5 },
	].concat(shortWallStuff).concat(everyRoomStuff),
	diningRoom: [
		{ item: 'diningTable4', count: 1 },
		{ item: 'armchair', weight: 4 },
	].concat(tallWallStuff).concat(everyRoomStuff),
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
	].concat(shortWallStuff).concat(everyRoomStuff),
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
	].concat(shortWallStuff).concat(everyRoomStuff),
};
