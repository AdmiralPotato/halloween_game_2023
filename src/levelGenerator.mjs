import seedrandom from 'seedrandom';
import {buildMapFromSeed} from './mapBuilder.mjs';

let rand = seedrandom(1);

export const setSeed = (seed) => {
	rand = seedrandom(seed);
};

const randomIndex = (max) => {
	return Math.floor(rand() * max);
};
// const randomFromRange = (min, max) => {
// 	const variation = randomIndex(max - min + 1);
// 	return variation + min;
// };
// const randomFromArray = (array) => {
// 	if (array.length === 0) return null;
// 	const i = randomIndex(array.length);
// 	return array[i];
// };
const DIRECTIONS = ['N','E','S','W'];
const getRandomDir = () => DIRECTIONS[randomIndex(4)];
const getOppositeDir = (dir) => {
	return DIRECTIONS[(DIRECTIONS.indexOf(dir) + 2) % 4];
};

const shortWallStuff = [
	// wallHanging
	{ item: 'curtainsShort', weight: 1},
	{ item: 'mirrorShort', weight: 1},
	{ item: 'paintingShort', weight: 4},
];
const tallWallStuff = [
	// wallHanging
	{ item: 'curtainsTall', weight: 1},
	{ item: 'mirrorTall', weight: 1},
	{ item: 'paintingTall', weight: 4},
];
const everyRoomStuff = [
	{ item: 'cobweb', weight: 4},
	{ item: 'pottedPlant', weight: 2},
	{ item: 'statue', weight: 1},
	{ item: 'grandfatherClock', weight: 1},
];

const getRandomDiningTable = () => {
	return rand() < 0.5
		? { item: 'diningTable3', count: 1}
		: { item: 'diningTable4', count: 1};
};

export const ROOMS = {
	livingRoom: {
		height: [ 5, 7 ], // range
		width: [ 7, 11 ],
		doors: [
			{ door: 'hallway', directions: 'N' }
		],
		furnishings: [
			{ item: 'fireplace', count: 1},
			{ item: 'couchCenter', weight: 1},
			{ item: 'couchWall', weight: 1},
			{ item: 'armChair', weight: 2},
			{ item: 'squareTable', weight: 4},
			{ item: 'roundTable', weight: 4},
			{ item: 'bookcaseTallWide', weight: 1},
			{ item: 'bookcaseTallNarrow', weight: 2},
		].concat(tallWallStuff).concat(everyRoomStuff),
	},
	hallway: {
		height: [ 7, 20 ],
		width: [ 4, 5 ],
		doors: [
			// door: room type
			// directions: where it's allowed to spawn relative to default (door is S)
			// weight: the number of shares it is this
			// count: the range of how many is allowed; null means open bound on that side
			{ door: 'bedroom', directions: 'any', weight: 2, count: [1, null],},
			{ door: 'library', directions: 'any', weight: 1, count: [0, 1],},
			{ door: 'diningRoom', directions: 'any', weight: 1, count: [0, 1],},
		],
		furnishings: [
			{ item: 'chest', weight: 1},
			{ item: 'couchWall', weight: 1},
			{ item: 'armChair', weight: 2},
			{ item: 'bookcaseShortWide', weight: 3},
			{ item: 'bookcaseShortNarrow', weight: 1},
			{ item: 'squareTable', weight: 4},
			{ item: 'roundTable', weight: 4},
			{ item: 'door', weight: 5},
		].concat(shortWallStuff).concat(everyRoomStuff),
	},
	diningRoom: {
		height: null,
		width: null,
		doors: [],
		furnishings: [
			getRandomDiningTable(),
			{ item: 'armChair', weight: 4},
		].concat(tallWallStuff).concat(everyRoomStuff),
	},
	bedroom: {
		height: null,
		width: null,
		doors: [],
		furnishings: [
			{ item: 'bed', count: 1},
			{ item: 'wardrobe', count: 1},
			{ item: 'fireplace', count: 1},
			{ item: 'chest', weight: 3},
			{ item: 'armChair', weight: 1},
			{ item: 'squareTable', weight: 1},
			{ item: 'roundTable', weight: 1},
			{ item: 'bookcaseShortNarrow', weight: 1},
			{ item: 'dresserShort', count: 1},
			{ item: 'dresserWide', count: 1},
			{ item: 'door', count: 1},
		].concat(shortWallStuff).concat(everyRoomStuff),
	},
	library: {
		height: null,
		width: null,
		doors: [],
		furnishings: [
			{ item: 'couchCenter', weight: 3},
			{ item: 'couchWall', weight: 1},
			{ item: 'armChair', weight: 2},
			{ item: 'squareTable', weight: 4},
			{ item: 'roundTable', weight: 4},
			{ item: 'bookcaseShortWide', weight: 3},
			{ item: 'bookcaseShortNarrow', weight: 3},
			{ item: 'bookcaseTallWide', weight: 10},
			{ item: 'bookcaseTallNarrow', weight: 3},
		].concat(shortWallStuff).concat(everyRoomStuff),
	},
};

const getRandomWithWeight = obj => {
	const pickFrom = [];
	Object.entries(obj).forEach(pair=>{
		const [key, value] = pair;
		for (let i = 0; i < value; i++) {
			pickFrom.push(key);
		}
	});
	return pickFrom[randomIndex(pickFrom.length)];
};

// position = wallHanging, wallEdge, freeStanding,
export const FURNISHINGS = {
	// wallHanging
	curtainsShort: { position: 'wallHanging', size: { w:1, d:0, h:1 }, },
	curtainsTall: { position: 'wallHanging', size: { w:2, d:0, h:2 }, },
	mirrorShort: { position: 'wallHanging', size: { w:1, d:0, h:1 }, },
	mirrorTall: { position: 'wallHanging', size: { w:1, d:0, h:2 }, },
	paintingShort: { position: 'wallHanging', size: { w:1, d:0, h:1 }, },
	paintingTall: { position: 'wallHanging', size: { w:1, d:0, h:2 }, },
	door: { position: 'wallHanging', size: { w:1, d:0, h:2 }, },
	// wallEdge
	couchWall: {
		position: 'wallEdge',
		size: { w:2, d:1, h:1 },
		getChildren: () => {
			let weight = {
				'endTable': 5,
				'lamp': 1,
				'pottedPlant': 2,
				'EMPTY': 3
			};
			return [
				{ item: getRandomWithWeight(weight), pos: 'W' },
				{ item: getRandomWithWeight(weight), pos: 'E' },
			];
		}
	},
	armChair: {
		position: 'wallEdge',
		size: { w:1, d:1, h:1 },
		getChildren: () => {
			let weight = {
				'endTable': 3,
				'lamp': 1,
				'pottedPlant': 2,
				'EMPTY': 2
			};
			return [
				{ item: getRandomWithWeight(weight), pos: 'W' },
				{ item: getRandomWithWeight(weight), pos: 'E' },
			];
		}
	},
	bed: {
		position: 'wallEdge',
		size: { w:2, d:2, h:1 },
		getChildren: () => {
			// 100% of the time, end table on W or E; 30% of the time, another end table on the other side
			let roll = rand();
			return [
				{ item: 'endTable', pos: [ roll > 0.5 ? 'W' : 'E' ] },
				{ item: rand() < 0.3 ? 'endTable' : 'EMPTY', pos: [ roll <= 0.5 ? 'W' : 'E' ] },
			];
		},
	},
	cobweb: { position: 'wallEdge', size: { w:1, d:1, h:1 } },
	wardrobe: { position: 'wallEdge', size: { w:2, d:1, h:2 } },
	fireplace: { position: 'wallEdge', size: { w:2, d:1, h:2 }, },
	bookcaseTallNarrow: { position: 'wallEdge', size: { w:1, d:1, h:2 }, },
	bookcaseShortNarrow: { position: 'wallEdge', size: { w:1, d:1, h:1 }, },
	bookcaseTallWide: { position: 'wallEdge', size: { w:2, d:1, h:2 }, },
	bookcaseShortWide: { position: 'wallEdge', size: { w:2, d:1, h:2 }, },
	dresserShort: { position: 'wallEdge', size: { w:2, d:1, h:1 }, },
	dresserTall: { position: 'wallEdge', size: { w:2, d:1, h:2 }, },
	chest: { position: 'wallEdge', size: { w:2, d:1, h:1 }, },
	pottedPlant: { position: 'wallEdge', size: { w:1, d:1, h:2 }, },
	lamp: { position: 'wallEdge', size: { w:1, d:1, h:2 }, },
	statue: { position: 'wallEdge', size: { w:1, d:1, h:2 }, },
	grandfatherClock: { position: 'wallEdge', size: { w:1, d:1, h:2 }, },
	chair: { position: 'wallEdge', size: { w:1, d:1, h:1 }, },
	// freeStanding
	couchCenter: {
		position: 'freeStanding',
		size: { w:2, d:1, h:1 }, // width first (in "default" top-down position)
		getChildren: () => {
			return rand() < 0.7 ? [] : [{ item: 'tableLong', pos: [ 'N' ] }];
		},
	},
	squareTable: {
		position: 'freeStanding',
		size: { w:1, d:1, h:1 },
		getChildren: () => {
			// 1 chair minimum; 2 chairs sometimes (edges chosen is random)
			const dir = getRandomDir();
			const ret = [{ item: 'chair', pos: dir }];
			if (rand() < 0.3) {
				const opposite = getOppositeDir(dir);
				ret.push({ item: 'chair', pos: opposite});
			}
			return ret;
		},
	},
	roundTable: {
		position: 'freeStanding',
		size: { w:1, d:1, h:1 },
		getChildren: () => {
			return [{ item: 'chair', pos: getRandomDir() }];
		},
	},
	diningTable3: {
		position: 'freeStanding',
		size: { w:1, d:4, h:1 },
		getChildren: () => {
			const missing = 0.05;
			return [ 'N', 'W1', 'W2', 'W3', 'S', 'E1', 'E2', 'E3', ].map(pos=>{
				return { item: rand() < missing ? 'EMPTY' :'chair', pos: pos };
			});
		},
	},
	diningTable4: {
		position: 'freeStanding',
		size: { w:1, d:3, h:1 },
		getChildren: () => {
			const missing = 0.05;
			return [ 'N', 'W1', 'W2', 'W3', 'W4', 'S', 'E1', 'E2', 'E3', 'E4', ].map(pos=>{
				return { item: rand() < missing ? 'EMPTY' :'chair', pos: pos };
			});
		},
	},
	endTable: { position: 'freeStanding', size: { w:1, d:1, h:1 } },
};

////-----------------------------------------//
/// ------- THE REST OF THE OWL???? ------- //
//-----------------------------------------//

// const getRoomInfo = (roomName) => {
// 	let roomInfo = ROOMS[roomName];
// 	roomInfo.wallHangingInfo = roomInfo.furnishings.filter(entry=>{
// 		return FURNISHINGS[entry.item].position === 'wallHanging';
// 	});
// 	roomInfo.wallEdgeInfo = roomInfo.furnishings.filter(entry=>{
// 		return FURNISHINGS[entry.item].position === 'wallEdge';
// 	});
// 	roomInfo.freeStandingInfo = roomInfo.furnishings.filter(entry=>{
// 		return FURNISHINGS[entry.item].position === 'freeStanding';
// 	});
// 	return roomInfo;
// };

// const getItemAndChildren = (itemName) => {
// 	let itemInfo = FURNISHINGS[itemName];
// 	let children = itemInfo.getChildren().filter(x=>x.item !== 'EMPTY');
// 	let coords = {};
// 	for (let y = 0; y < itemInfo.size.d; y++) {
// 		for (let x = 0; x < itemInfo.size.w; x++) {
// 			coords[`${x},${y}`] = 'A0';
// 		}
// 	}
// };

export const makeRoomsWithSeed = (seed) => {
	const info = buildMapFromSeed(seed);
	return Object.values(info.rooms);
};
