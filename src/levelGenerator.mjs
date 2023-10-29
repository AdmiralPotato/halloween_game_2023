import seedrandom from 'seedrandom';

let rand = seedrandom(1);

export const setSeed = (seed) => {
	rand = seedrandom(seed);
};

const randomIndex = (max) => {
	return Math.floor(rand() * max);
};
const randomFromRange = (min, max) => {
	const variation = randomIndex(max - min + 1);
	return variation + min;
};
const randomFromArray = (array) => {
	if (array.length === 0) return null;
	const i = randomIndex(array.length);
	return array[i];
};
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

//-----------------------------------------//
// ------- THE REST OF THE OWL???? ------- //
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

//------------------------------------//
// ------- BUILDING ASCII MAP ------- //
//------------------------------------//

/* ---------- GET SIZES ---------- */

let getRandomSize = (width, height) => { // width first
	return {
		width: randomFromRange(...width),
		height: randomFromRange(...height),
	};
};

// ROOM DEFAULT SIZES -> ranges; will roll one between min and max inclusive
// NOTE: all these things are going to be doubled eventually
const normalWidth = [ 2, 4 ];
const normalHeight = [ 2, 3 ];
const hallWidth = [ 2, 3 ];
const entranceWidth = [ 4, 6 ];
const entranceHeight = [ 2, 3 ];
const wallWidth = 0;

const mapFloorPlanInfo = {
	// four normal roomes
	e: getRandomSize(normalWidth, normalHeight),
	f: getRandomSize(normalWidth, normalHeight),
	c: getRandomSize(normalWidth, normalHeight),
	d: getRandomSize(normalWidth, normalHeight),
	// hallway
	b: { width: randomFromRange(...hallWidth), height: null, }, // will populate height later
	// entrance room (living room)
	a: getRandomSize(entranceWidth, entranceHeight),
};

/* ---------- HORIZONTAL ASCII ---------- */

// making the default ASCII row for each room
Object.entries(mapFloorPlanInfo).forEach(([key,entry])=>{
	mapFloorPlanInfo[key].line = key.repeat(entry.width);
});

// alight the leftmost rooms to the right, and the rightmost rooms to the left
const padRoomToAlignOn = (r1, r2, side) => {
	const room = mapFloorPlanInfo[r1];
	const padWidth = mapFloorPlanInfo[r2].width;
	const method = side === 'right' ? 'padStart' : 'padEnd';
	room.line = room.line[method](padWidth, ' ');
};
padRoomToAlignOn('e', 'd', 'right');
padRoomToAlignOn('d', 'e', 'right');
padRoomToAlignOn('c', 'f', 'left');
padRoomToAlignOn('f', 'c', 'left');

// padding the central room horizontally with the rest

const totalMapWidth = mapFloorPlanInfo.e.line.length // one of the leftmost rooms
	+ mapFloorPlanInfo.f.line.length // one of the rightmost rooms
	+ mapFloorPlanInfo.b.line.length // hallway
	+ wallWidth*2; // wall thickness, if a doorway is to take up a tile

const padLineToWidth = (r, width) => {
	const room = mapFloorPlanInfo[r];
	const diff = Math.max(width - room.width, 0);
	const padCount = Math.floor(diff/2);
	let ret = ' '.repeat(padCount) + room.line + ' '.repeat(padCount);
	const method = randomIndex(2) === 0 ? 'padEnd' : 'padStart';
	ret = ret[method](1, ' ');
	return ret;
};
mapFloorPlanInfo.a.line = padLineToWidth('a', totalMapWidth);

/* ---------- VERTICAL ASCII ---------- */

['e','f'].forEach((roomName, index, arr) => {
	const room = mapFloorPlanInfo[roomName];
	const padToHeight = Math.max(
		room.height,
		mapFloorPlanInfo[arr[(index+1)%2]].height
	);
	const ret = [];
	for (let i = 0; i < padToHeight; i++) {
		ret.push(
			padToHeight - room.height > i ? ' '.repeat(room.line.length) : room.line
		);
	}
	room.lines = ret;
});

['d','c'].forEach((roomName, index, arr) => {
	const room = mapFloorPlanInfo[roomName];
	const padToHeight = Math.max(
		room.height,
		mapFloorPlanInfo[arr[(index+1)%2]].height
	);
	const ret = [];
	const blank = ' '.repeat(room.line.length);
	// blank lines, equally on top or bottom (randomly)
	let diffCount = padToHeight - room.height;
	for (let i = 0; i < diffCount; i++) {
		const method = rand() < 0.5 ? 'push' : 'unshift';
		ret[method](blank);
	}
	// the actual lines
	for (let i = 0; i < room.height; i++) {
		ret.push(room.line);
	}
	room.lines = ret;
});

['a'].forEach((roomName) => {
	const room = mapFloorPlanInfo[roomName];
	const ret = [];
	for (let i = 0; i < room.height; i++) {
		ret.push(room.line);
	}
	room.lines = ret;
});

const mapASCII = [];

for (let i = 0; i < mapFloorPlanInfo.e.lines.length; i++) {
	mapASCII.push(
		mapFloorPlanInfo.e.lines[i]
		+ ' '.repeat(wallWidth) + mapFloorPlanInfo.b.line
		+ ' '.repeat(wallWidth) + mapFloorPlanInfo.f.lines[i]
	);
}
for (let i = 0; i < wallWidth; i++) {
	mapASCII.push(padLineToWidth('b', totalMapWidth));
}

for (let i = 0; i < mapFloorPlanInfo.d.lines.length; i++) {
	mapASCII.push(
		mapFloorPlanInfo.d.lines[i]
		+ ' '.repeat(wallWidth) + mapFloorPlanInfo.b.line
		+ ' '.repeat(wallWidth) + mapFloorPlanInfo.c.lines[i]
	);
}
// quickie: make a door between hallway and entrance

// find horiz coordinate
let bottommostRow = mapASCII[mapASCII.length-1].split('');
let topOfLivingRoom = mapFloorPlanInfo.a.line.split('');
let potentialDoorIndices = [];
bottommostRow.forEach((c,i)=>{
	if (c=='b' && topOfLivingRoom[i]!==' ') { potentialDoorIndices.push(i); }
});
if (potentialDoorIndices.length > 3) {
	potentialDoorIndices.pop();
	potentialDoorIndices.shift();
}
let doorIndex = randomFromArray(potentialDoorIndices);

// for later
let bottomOfHallWayIndex = mapASCII.length-1;

// put in front room
for (let i = 0; i < mapFloorPlanInfo.a.lines.length; i++) {
	mapASCII.push(mapFloorPlanInfo.a.lines[i]);
}
// it's later now
[bottomOfHallWayIndex, bottomOfHallWayIndex+1].forEach(index=>{
	mapASCII[index] = mapASCII[index].split('').map((c,i)=>{
		return doorIndex === i ? '#' : c;
	}).join('');
});

/* ---------- ADD DOORS ---------- */

const getRowsWithPotentialDoor = (r1, r2) => {
	return mapASCII.map((line, i)=>{
		return line.includes(r1+r2) ? i : null;
	}).filter(i=>i!==null);
};

['ef','dc'].forEach(pair=>{
	const [left, right] = pair.split('');
	let indicesL = getRowsWithPotentialDoor(left, 'b');
	let indicesR = getRowsWithPotentialDoor('b', right);
	[indicesL, indicesR].forEach(list=> {
		if (list.length >= 3) { list.pop(), list.shift(); }
	});
	if (indicesL.length <= indicesR.length) {
		let firstDoorIndex = randomFromArray(indicesL);
		mapASCII[firstDoorIndex] = mapASCII[firstDoorIndex].replace(left+'b', '##');
		indicesR = indicesR.filter(n=>n!==firstDoorIndex);
		let secondDoorIndex = indicesR.length > 0 ? randomFromArray(indicesR) : firstDoorIndex;
		mapASCII[secondDoorIndex] = mapASCII[secondDoorIndex].replace('b'+right, '##');
	} else {
		let firstDoorIndex = randomFromArray(indicesR);
		mapASCII[firstDoorIndex] = mapASCII[firstDoorIndex].replace('b'+right, '##');
		indicesL = indicesL.filter(n=>n!==firstDoorIndex);
		let secondDoorIndex = indicesL.length > 0 ? randomFromArray(indicesL) : firstDoorIndex;
		mapASCII[secondDoorIndex] = mapASCII[secondDoorIndex].replace(left+'b', '##');
	}
});

/* ---------- TRIM HALLWAY ---------- */

const topmostDoorIndex = mapASCII.findIndex(line=>line.includes('#'));
for (let i = 0; i < topmostDoorIndex - 1; i++) {
	mapASCII[i] = mapASCII[i].replace(/b/g,' ');
}

/* ---------- ROOMS ARE DONE ---------- */
const doubleArray = arr =>{
	let ret = [];
	arr.forEach(item=>{ret.push(item); ret.push(item);});
	return ret;
};
let printMap = doubleArray(mapASCII.map(line=>{
	return doubleArray(line.split('')).join('');
})).join('\n');


console.log(printMap);

export const makeRoomsWithSeed = (seed) => {
	setSeed(seed);
	// now draw the rest of the owl
	return [
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
	];
};
