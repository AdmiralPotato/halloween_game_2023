import { FurnitureWeight, ItemWithContext, ROOM_CONTENTS2, FURNISHINGS2, padRoom, spreadItemsOnAxis, translateItems } from './furnitureForRooms';
import { RoomWorkingData, Tile } from './rooms';
import { getXYRangeFromXYCoords, XYCoord, XYRange, rand, getScrambledDirs, scrambleArray, averageXYCoords, scaleXY, getNFromDir, getRandomWithWeight, getWidthFromItemsWithContext } from './utilities';

export const furnishCenter = (roomData: RoomWorkingData, roomName: string): ItemWithContext[] => {
	// previously called `populateRoomCenter3`
	let floors: Tile[] = roomData.floors;
	let floorCoords = padRoom(floors)
		.filter((tile: Tile) => {
			return tile.compositeInfo === 's';
		})
		.map((tile: Tile) => {
			return {
				x: tile.x, y: tile.y,
			}
		});
	let floorRange: XYRange = getXYRangeFromXYCoords(floorCoords);
	// let floorCenterCoord: XYCoord = getCenterForXYRange(floorRange);
	let paddingBetweenCenterAndWall = 1;
	let floorSize = {
		x: floorRange.x.max - floorRange.x.min - paddingBetweenCenterAndWall,
		y: floorRange.y.max - floorRange.y.min - paddingBetweenCenterAndWall,
	};
	let ret = getCenterFurniture[roomName](floorSize);
	ret = ret.filter((item: ItemWithContext) => (item.name !== "EMPTY"))
	return ret;
};

export const furnishCorners = (roomData: RoomWorkingData, roomName: string): ItemWithContext[] => {
	let floors: Tile[] = roomData.floors;
	let corners = ['q', 'e'];
	let floorTiles = padRoom(floors)
		.filter((tile: Tile) => {
			return corners.includes(tile.compositeInfo) && tile.asset.includes('floor');
		});

	let possibleFurniture: FurnitureWeight[] = ROOM_CONTENTS2[roomName]
		.filter(item => {
			return FURNISHINGS2[item.item].placementContext.includes('corner');
		});
	let ret: ItemWithContext[] = floorTiles.map((tile: Tile) => {
		let furnitureName = getRandomWithWeight(possibleFurniture);
		return {
			occupiedCoords: [{ x: tile.x, y: tile.y }],
			itemCenterCoord: { x: tile.x, y: tile.y },
			name: furnitureName,
			children: [],
			rot: furnitureName === 'cobwebCorner' && tile.compositeInfo === 'e' ? 1 : 0, // TODO fix this when you fix the rotation / x axis of everything
		};
	});
	return ret;
};

export const padImmediate = (baseItems: ItemWithContext[], padItems: ItemWithContext[], padUntil: number) => {
	let currentWidth = getWidthFromItemsWithContext(baseItems);
	if (padUntil < currentWidth) { return []; }
	let ret = JSON.parse(JSON.stringify(baseItems));
	const childrenSize = 1;
	let roll = rand();
	let method = roll < 0.5 ? 'push' : 'unshift';
	let antiMethod = roll >= 0.5 ? 'unshift' : 'push';
	if (padUntil >= currentWidth + childrenSize) {
		ret[method](padItems[0]);
	}
	if (padUntil >= currentWidth + 2 * childrenSize) {
		ret[antiMethod](padItems[1]);
	}
	return ret;
}
export const padToFill = (baseItems: ItemWithContext[], weights: FurnitureWeight[], padUntil: number) => {
	let ret = JSON.parse(JSON.stringify(baseItems));
	let currentWidth = getWidthFromItemsWithContext(ret);
	if (padUntil < currentWidth) { return []; }
	if (padUntil === currentWidth) { return baseItems; }
	do {
		ret[rand() ? 'push' : 'unshift']({
			occupiedCoords: [{ x: 0, y: 0 }],
			itemCenterCoord: { x: 0, y: 0 },
			name: getRandomWithWeight(weights),
			children: [], rot: 0,
		});
		ret = spreadItemsOnAxis(ret, 'x', 1) // TEMP item size should be done automatically!
	} while (getWidthFromItemsWithContext(ret) < padUntil)
	return ret;
}

const getTileLinearDiffOnAxis = (t1: Tile, t2: Tile) => {
	if (t2.y === t1.y) {
		return Math.abs(t2.x - t1.x);
	} else if (t2.x === t1.x) {
		return Math.abs(t2.y - t1.y);
	}
	return NaN; // they're not on the same plane
};

const splitByDoor = (array: Tile[]): Tile[][] => {
	let ret: Tile[][] = [];
	let working = JSON.parse(JSON.stringify(array))
		.sort((a: Tile, b: Tile) => {
			if (a.x === b.x) { return a.y - b.y; }
			return a.x - a.y;
		});
	let first = working.shift();
	if (!first) { throw new Error("ASSERT"); }
	let insert = [first];
	while (working.length) {
		let diff = getTileLinearDiffOnAxis(working[0], insert[insert.length - 1]);
		if (diff > 1) {
			ret.push(insert);
			let last = working.shift();
			if (!last) { throw new Error("ASSERT"); }
			insert = [last];
		} else {
			let last = working.shift();
			if (!last) { throw new Error("ASSERT"); }
			insert.push(last);
		}
	}
	ret.push(insert);
	return ret;
}

export const furnishEdges = (roomData: RoomWorkingData, roomName: string): ItemWithContext[] => {
	let ret: ItemWithContext[] = [];
	// get wall tile segments
	let floors: Tile[] = roomData.floors;
	let edgeIDs = ['a', 'w', 'd'];
	let wallTiles = padRoom(floors)
		.filter((tile: Tile) => {
			return edgeIDs.includes(tile.compositeInfo) && tile.asset.includes('wall');
		});
	let wallSegments = edgeIDs.map(wallID => {
		// separate segments by wall: end up with [[1,2,3,4],[5,6,7,8],[9,10]] type situation
		return wallTiles.filter(tile => tile.compositeInfo === wallID);
	})
	// split it by where the door was (using the margins between them to judge this)
	let splitVersions: Tile[][] = [];
	wallSegments.forEach((segment: Tile[]) => {
		let splitVersion = splitByDoor(segment)
		splitVersions = splitVersions.concat(splitVersion);
	})
	wallSegments = splitVersions;
	// best way to get rid of the corners
	wallSegments = wallSegments.map(item => {
		item.pop();
		item.shift();
		return item;
	})
		.filter(item => item.length > 0) // kill empty walls (it can happen)
		.sort((a, b) => b.length - a.length) // put the longest first; deal with largest to smallest
	// todo: split very long segments (8+) into pieces

	// find required furniture
	let requiredFurniture: string[] = [];
	ROOM_CONTENTS2[roomName]
		.filter(item => !Number.isNaN(item.count))
		.forEach(item => {
			for (let i = 0; i < item.count; i++) {
				requiredFurniture.push(item.item)
			}
		});
	// find large furniture
	let largeFurnitureWeights = ROOM_CONTENTS2[roomName].filter(item => {
		return FURNISHINGS2[item.item].dimensions.width > 1;
	});
	// find little furniture
	let smallFurnitureWeights = ROOM_CONTENTS2[roomName].filter(item => {
		return FURNISHINGS2[item.item].dimensions.width === 1;
	}).filter(item => FURNISHINGS2[item.item].placementContext !== 'corner');

	// while there is space on the walls
	while (wallSegments.length) {
		let bigInsertName = requiredFurniture.length // either grab a required cluster or a large piece of furniture
			? (requiredFurniture.shift() || '')
			: getRandomWithWeight(largeFurnitureWeights);
		let wall = wallSegments.shift() || []; // taking the wall off; we'll fill it completely
		let wallCenter = averageXYCoords(wall.map(tile => { return { x: tile.x, y: tile.y } }));
		let currentWallID = wall[0].compositeInfo;
		let itemsWIP: ItemWithContext[] = getWallCluster[bigInsertName]
			? getWallCluster[bigInsertName](wall.length)
			: [{
				occupiedCoords: FURNISHINGS2[bigInsertName].dimensions.depth === 1
					? twoByOneCoords
					: twoByTwoCoords,
				itemCenterCoord: FURNISHINGS2[bigInsertName].dimensions.depth === 1
					? { x: 0, y: 0 }
					: { x: 0, y: 1 },
				name: bigInsertName,
				children: [], rot: 0,
			}];
		itemsWIP = padToFill(itemsWIP, smallFurnitureWeights, wall.length);
		// todo: spread items

		// let normalizedTransforms: Record<string, XYCoord> = {
		// 	a: { x: -1, y: 0 },
		// 	w: { x: 0, y: -1 },
		// 	d: { x: 1, y: 0 },
		// }
		if (currentWallID === 'w') {
			itemsWIP = spreadItemsOnAxis(itemsWIP, 'x', 1); // spread along x
		} else {
			itemsWIP = spreadItemsOnAxis(itemsWIP, 'y', 1); // spread along y
		}
		itemsWIP = translateItems(itemsWIP, wallCenter);
		if (currentWallID === 'a') {
			itemsWIP = itemsWIP.map(item => { item.rot = 3; return item; })
		} else if (currentWallID === 'd') {
			itemsWIP = itemsWIP.map(item => { item.rot = 1; return item; })
		}
		ret = ret.concat(itemsWIP);
	}
	return ret;
};

const twoByTwoCoords = [
	{ x: 0, y: 0 },
	{ x: 1, y: 0 },
	{ x: 0, y: 1 },
	{ x: 1, y: 1 },
];
const twoByOneCoords = [
	{ x: 0, y: 0 },
	{ x: 1, y: 0 },
];
const oneByOneCoords = [
	{ x: 0, y: 0 },
];

const spawnDiningTable = (placementBounds: XYCoord): ItemWithContext[] => {
	let tables: ItemWithContext[] = [];
	let chairsN: ItemWithContext[] = [];
	let chairsS: ItemWithContext[] = [];
	if (placementBounds.y < 2 || placementBounds.x < 4) { return []; }
	let tableCount = Math.floor(placementBounds.x / 2) - 1;
	for (let i = 1; i <= tableCount; i++) {
		let item = "diningTableMid";
		let rot = 0; i === 1 ? 0 : 2;
		if (i === 1) {
			rot = 2;
			item = "diningTableHalf";
		} else if (i === tableCount) {
			item = "diningTableHalf";
		}
		tables.push({
			occupiedCoords: twoByOneCoords,
			itemCenterCoord: { x: 0, y: 0 },
			name: item,
			rot,
		})

	}
	const chairRate = 0.95;
	for (let i = 1; i <= tableCount * 2; i++) {
		chairsN.push({
			occupiedCoords: [{ x: 0, y: -.5 }],
			itemCenterCoord: { x: 0, y: -.5 },
			name: rand() < chairRate ? 'chair' : 'EMPTY',
			rot: 0,
		})
		chairsS.push({
			occupiedCoords: [{ x: 0, y: .5 }],
			itemCenterCoord: { x: 0, y: .5 },
			name: rand() < chairRate ? 'chair' : 'EMPTY',
			rot: 2,
		})
	}
	tables = spreadItemsOnAxis(tables, 'x', 2);
	chairsN = spreadItemsOnAxis(chairsN, 'x', 1);
	chairsS = spreadItemsOnAxis(chairsS, 'x', 1);
	let ret = tables.concat(chairsN);
	if (placementBounds.x > 2) {
		ret = ret.concat(chairsS);
	}
	return ret;
};

const spawnRoundTable = (): ItemWithContext[] => {
	let ret: ItemWithContext[] = [
		{
			occupiedCoords: twoByTwoCoords,
			itemCenterCoord: { x: 0, y: 0 },
			name: 'roundTable',
			rot: 0,
		},
	];
	const dist = 0.6
	const diagSpread = [
		{ x: -dist, y: -dist },
		{ x: dist, y: -dist },
		{ x: dist, y: dist },
		{ x: -dist, y: dist },
	]
	let scrambledDirs = getScrambledDirs();
	if (scrambledDirs.length < 4) { throw new Error("ASSERT LOL") }

	// always at least one chair
	let dir1 = scrambledDirs[0];
	ret.push({
		occupiedCoords: [], // covered by the table itself, since the chairs are scooted
		itemCenterCoord: diagSpread[getNFromDir(dir1)],
		name: 'chair',
		rot: getNFromDir(dir1) - 0.5,
	})
	// but up to four chairs:
	for (let i = 1; i < scrambledDirs.length; i++) {
		if (rand() < 0.6) {
			let dir = scrambledDirs[i];
			ret.push({
				occupiedCoords: [],
				itemCenterCoord: diagSpread[getNFromDir(dir)],
				name: 'chair',
				rot: getNFromDir(dir) - 0.5,
			});
		}
	}
	return ret;
};

const getBookcasesSizes = (length: number) => {
	const remainder = (length / 2) % 2;
	const wideCount = Math.floor(length / 2);
	const bookcaseSizes = new Array(wideCount);
	bookcaseSizes.fill(2);
	if (remainder) { bookcaseSizes.push(1); }
	return scrambleArray(bookcaseSizes);
}
const getLineOfBookcases = (length: number, axis: string) => {
	const sizes = getBookcasesSizes(length);
	let ret = [];
	let dummyItems = new Array(length) // to get occupied coords
	dummyItems.fill({
		occupiedCoords: { x: 0, y: 0 },
		itemCenterCoord: { x: 0, y: 0 },
		name: '',
		children: [],
		rot: 0,
	})
	let spreadItems: ItemWithContext[] = spreadItemsOnAxis(dummyItems, axis, 1);
	ret = sizes.map(size => {
		let dummies = spreadItems.splice(0, size);
		let occupiedCoords = dummies.map(item => item.itemCenterCoord);
		return {
			occupiedCoords,
			itemCenterCoord: averageXYCoords(occupiedCoords),
			name: size === 1 ? 'bookcaseTallNarrow' : 'bookcaseTallWide',
			children: [],
			rot: axis === 'x' ? 0 : 3,
		}
	})
	return ret;
}
const spawnBookcaseIsland = (length: number, axis: string) => {
	let bookcases1: ItemWithContext[] = getLineOfBookcases(length, axis);
	let bookcases2: ItemWithContext[] = getLineOfBookcases(length, axis)
	let translation: XYCoord = { x: 0, y: 0 };
	if (axis === 'x') {
		translation.y += 0.25;
	} else {
		translation.x += 0.25;
	}
	bookcases1 = translateItems(bookcases1, translation);
	translation = scaleXY(translation, -1);
	bookcases2 = translateItems(bookcases2, translation)
		.map(item => {
			item.rot = (item.rot + 2) % 4
			return item;
		});
	return bookcases1.concat(bookcases2);
};

const getCenterFurniture: Record<string, Function> = {
	diningRoom: spawnDiningTable,
	library: (placementBounds: XYCoord): ItemWithContext[] => {
		let ret: ItemWithContext[] = [];
		let depth = placementBounds.y - 2;
		let width = placementBounds.x - 3;
		// let blocksCount = Math.floor(width / depth);
		let blocksCount = 2; // temp bodge (TODO: make it actually spaced smartly)
		let centers: XYCoord[] = [
			{ x: -width / 4, y: 0 },
			{ x: width / 4, y: 0 },
		]
		for (let i = 0; i < blocksCount; i++) {
			let axis = rand() < 0.5 ? 'x' : 'y';
			let length = axis === 'x' ? Math.floor(width / 2) : depth;
			let working: ItemWithContext[] = spawnBookcaseIsland(length, axis);
			let translated: ItemWithContext[] = translateItems(working, centers[i]);
			ret = ret.concat(translated);
		}
		return ret;
	},
	hallway: () => { return []; },
	bedroom: () => { return []; },
	livingRoom: (): ItemWithContext[] => {
		let translations = [ // offset for the pair of round tables in the center
			{ x: 3, y: 0 },
			{ x: -3, y: 0 },
		]
		let roundTable1 = translateItems(spawnRoundTable(), translations[0]);
		let roundTable2 = translateItems(spawnRoundTable(), translations[1]);
		return roundTable1.concat(roundTable2);
	},
}

const getEndTablePadding = (
	itemName: string,
	rootItemOccupiedCoords: XYCoord[],
	padUntil: number
) => {
	let weight = [
		{ item: 'endTable', weight: 5 },
		{ item: 'candelabra', weight: 1 },
		{ item: 'pottedPlant', weight: 2 },
		{ item: 'EMPTY', weight: 3 }
	];
	return padImmediate(
		[{ // baseItems
			occupiedCoords: rootItemOccupiedCoords,
			itemCenterCoord: averageXYCoords(rootItemOccupiedCoords),
			name: itemName, rot: 0,
		}], // padItems
		[
			{
				occupiedCoords: oneByOneCoords,
				itemCenterCoord: averageXYCoords(oneByOneCoords),
				name: getRandomWithWeight(weight),
				rot: 0,
			},
			{
				occupiedCoords: oneByOneCoords,
				itemCenterCoord: averageXYCoords(oneByOneCoords),
				name: getRandomWithWeight(weight),
				rot: 0,
			}
		],
		padUntil,
	);
};
const getWallCluster: Record<string, Function> = {
	couch: (padUntil: number) => {
		return getEndTablePadding('couch', twoByOneCoords, padUntil);
	},
	armChair: (padUntil: number) => {
		return getEndTablePadding('armChair', oneByOneCoords, padUntil);
	},
	bed: (padUntil: number) => {
		// 100% of the time, end table on W or E; 30% of the time, another end table on the other side (empty space otherwise)
		return padImmediate(
			[{ // baseItems
				occupiedCoords: twoByTwoCoords,
				itemCenterCoord: averageXYCoords(twoByTwoCoords),
				name: 'bed',
				rot: 0,
			}],
			[ // padItems
				{
					occupiedCoords: oneByOneCoords,
					itemCenterCoord: averageXYCoords(oneByOneCoords),
					name: 'endTable',
					rot: 0,
				},
				{
					occupiedCoords: oneByOneCoords,
					itemCenterCoord: averageXYCoords(oneByOneCoords),
					name: rand() < 0.3 ? 'endTable' : 'EMPTY',
					rot: 0,
				}
			],
			padUntil,
		)
	},
}

// let test2 = populateRoomCenter3(testRoom, "diningRoom")

// console.log(test)
// console.log("BREAKME")
