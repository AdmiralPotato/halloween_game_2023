import { ItemWithContext, padRoom, spreadItemsOnAxis, translateItemAndChildren } from './furnitureForRooms';
import { RoomWorkingData, Tile } from './rooms';
import { getXYRangeFromXYCoords, XYCoord, XYRange, rand, DIRECTIONS, getScrambledDirs, scrambleArray, averageXYCoords, scaleXY, getNFromDir } from './utilities';

let testRoom: RoomWorkingData = {
	"width": 14,
	"depth": 10,
	"x": 12,
	"y": 20,
	"doorCoords": [],
	"name": "livingRoom",
	"roomID": "a",
	"floors": [
		{ "name": "a:6,16:floor(q)", "type": "floor", "asset": "floor", "x": -6, "y": -4, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "q", "roomID": "a" }, { "name": "a:8,16:floor(w)", "type": "floor", "asset": "floor", "x": -4, "y": -4, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "w", "roomID": "a" }, { "name": "a:10,16:floor(w)", "type": "floor", "asset": "floor", "x": -2, "y": -4, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "w", "roomID": "a" }, { "name": "a:12,16:floor(w)", "type": "floor", "asset": "floor", "x": 0, "y": -4, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "w", "roomID": "a" }, { "name": "a:14,16:floor(W)", "type": "floor", "asset": "floor", "x": 2, "y": -4, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "W", "roomID": "a" }, { "name": "a:16,16:floor(w)", "type": "floor", "asset": "floor", "x": 4, "y": -4, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "w", "roomID": "a" }, { "name": "a:18,16:floor(e)", "type": "floor", "asset": "floor", "x": 6, "y": -4, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "e", "roomID": "a" }, { "name": "a:6,18:floor(a)", "type": "floor", "asset": "floor", "x": -6, "y": -2, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "a", "roomID": "a" }, { "name": "a:8,18:floor(s)", "type": "floor", "asset": "floor", "x": -4, "y": -2, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "s", "roomID": "a" }, { "name": "a:10,18:floor(s)", "type": "floor", "asset": "floor", "x": -2, "y": -2, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "s", "roomID": "a" }, { "name": "a:12,18:floor(s)", "type": "floor", "asset": "floor", "x": 0, "y": -2, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "s", "roomID": "a" }, { "name": "a:14,18:floor(s)", "type": "floor", "asset": "floor", "x": 2, "y": -2, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "s", "roomID": "a" }, { "name": "a:16,18:floor(s)", "type": "floor", "asset": "floor", "x": 4, "y": -2, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "s", "roomID": "a" }, { "name": "a:18,18:floor(d)", "type": "floor", "asset": "floor", "x": 6, "y": -2, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "d", "roomID": "a" }, { "name": "a:6,20:floor(a)", "type": "floor", "asset": "floor", "x": -6, "y": 0, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "a", "roomID": "a" }, { "name": "a:8,20:floor(s)", "type": "floor", "asset": "floor", "x": -4, "y": 0, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "s", "roomID": "a" }, { "name": "a:10,20:floor(s)", "type": "floor", "asset": "floor", "x": -2, "y": 0, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "s", "roomID": "a" }, { "name": "a:12,20:floor(s)", "type": "floor", "asset": "floor", "x": 0, "y": 0, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "s", "roomID": "a" }, { "name": "a:14,20:floor(s)", "type": "floor", "asset": "floor", "x": 2, "y": 0, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "s", "roomID": "a" }, { "name": "a:16,20:floor(s)", "type": "floor", "asset": "floor", "x": 4, "y": 0, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "s", "roomID": "a" }, { "name": "a:18,20:floor(d)", "type": "floor", "asset": "floor", "x": 6, "y": 0, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "d", "roomID": "a" }, { "name": "a:6,22:floor(a)", "type": "floor", "asset": "floor", "x": -6, "y": 2, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "a", "roomID": "a" }, { "name": "a:8,22:floor(s)", "type": "floor", "asset": "floor", "x": -4, "y": 2, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "s", "roomID": "a" }, { "name": "a:10,22:floor(s)", "type": "floor", "asset": "floor", "x": -2, "y": 2, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "s", "roomID": "a" }, { "name": "a:12,22:floor(s)", "type": "floor", "asset": "floor", "x": 0, "y": 2, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "s", "roomID": "a" }, { "name": "a:14,22:floor(s)", "type": "floor", "asset": "floor", "x": 2, "y": 2, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "s", "roomID": "a" }, { "name": "a:16,22:floor(s)", "type": "floor", "asset": "floor", "x": 4, "y": 2, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "s", "roomID": "a" }, { "name": "a:18,22:floor(d)", "type": "floor", "asset": "floor", "x": 6, "y": 2, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "d", "roomID": "a" }, { "name": "a:6,24:floor(z)", "type": "floor", "asset": "floor", "x": -6, "y": 4, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "z", "roomID": "a" }, { "name": "a:8,24:floor(x)", "type": "floor", "asset": "floor", "x": -4, "y": 4, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "x", "roomID": "a" }, { "name": "a:10,24:floor(x)", "type": "floor", "asset": "floor", "x": -2, "y": 4, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "x", "roomID": "a" }, { "name": "a:12,24:floor(x)", "type": "floor", "asset": "floor", "x": 0, "y": 4, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "x", "roomID": "a" }, { "name": "a:14,24:floor(x)", "type": "floor", "asset": "floor", "x": 2, "y": 4, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "x", "roomID": "a" }, { "name": "a:16,24:floor(x)", "type": "floor", "asset": "floor", "x": 4, "y": 4, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "x", "roomID": "a" }, { "name": "a:18,24:floor(c)", "type": "floor", "asset": "floor", "x": 6, "y": 4, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "c", "roomID": "a" }, { "name": "a:6,16:wall-n(q)", "type": "wall", "asset": "wall", "x": -6, "y": -4, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "q", "roomID": "a" }, { "name": "a:6,16:wall-w(q)", "type": "wall", "asset": "wall", "x": -6, "y": -4, "rot": 3, "destination": "", "wallDir": "", "compositeInfo": "q", "roomID": "a" }, { "name": "a:8,16:wall-n(w)", "type": "wall", "asset": "wall", "x": -4, "y": -4, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "w", "roomID": "a" }, { "name": "a:10,16:wall-n(w)", "type": "wall", "asset": "wall", "x": -2, "y": -4, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "w", "roomID": "a" }, { "name": "a:12,16:wall-n(w)", "type": "wall", "asset": "wall", "x": 0, "y": -4, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "w", "roomID": "a" }, { "name": "a:16,16:wall-n(w)", "type": "wall", "asset": "wall", "x": 4, "y": -4, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "w", "roomID": "a" }, { "name": "a:18,16:wall-e(e)", "type": "wall", "asset": "wall", "x": 6, "y": -4, "rot": 1, "destination": "", "wallDir": "", "compositeInfo": "e", "roomID": "a" }, { "name": "a:18,16:wall-n(e)", "type": "wall", "asset": "wall", "x": 6, "y": -4, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "e", "roomID": "a" }, { "name": "a:6,18:wall-w(a)", "type": "wall", "asset": "wall", "x": -6, "y": -2, "rot": 3, "destination": "", "wallDir": "", "compositeInfo": "a", "roomID": "a" }, { "name": "a:18,18:wall-e(d)", "type": "wall", "asset": "wall", "x": 6, "y": -2, "rot": 1, "destination": "", "wallDir": "", "compositeInfo": "d", "roomID": "a" }, { "name": "a:6,20:wall-w(a)", "type": "wall", "asset": "wall", "x": -6, "y": 0, "rot": 3, "destination": "", "wallDir": "", "compositeInfo": "a", "roomID": "a" }, { "name": "a:18,20:wall-e(d)", "type": "wall", "asset": "wall", "x": 6, "y": 0, "rot": 1, "destination": "", "wallDir": "", "compositeInfo": "d", "roomID": "a" }, { "name": "a:6,22:wall-w(a)", "type": "wall", "asset": "wall", "x": -6, "y": 2, "rot": 3, "destination": "", "wallDir": "", "compositeInfo": "a", "roomID": "a" }, { "name": "a:18,22:wall-e(d)", "type": "wall", "asset": "wall", "x": 6, "y": 2, "rot": 1, "destination": "", "wallDir": "", "compositeInfo": "d", "roomID": "a" }, { "name": "a:6,24:wall-w(z)", "type": "wall", "asset": "wall", "x": -6, "y": 4, "rot": 3, "destination": "", "wallDir": "", "compositeInfo": "z", "roomID": "a" }, { "name": "a:18,24:wall-e(c)", "type": "wall", "asset": "wall", "x": 6, "y": 4, "rot": 1, "destination": "", "wallDir": "", "compositeInfo": "c", "roomID": "a" }, { "name": "a:14,14:wallForCornerDoor(C)", "type": "wall", "asset": "wall", "x": 2, "y": -6, "rot": 1, "destination": "", "wallDir": "", "compositeInfo": "C", "roomID": "a" }, { "name": "a:16,10:wallForCornerDoor(Q)", "type": "wall", "asset": "wall", "x": 4, "y": -10, "rot": 0, "destination": "", "wallDir": "", "compositeInfo": "Q", "roomID": "a" }
	],
	"doors": [
		{ "name": "a:14,16:door(W)", "asset": "", "type": "door", "x": 2, "y": -4, "rot": 0, "destination": "b", "wallDir": "", "compositeInfo": "W", "roomID": "a" }, { "name": "a:12,2:door(A)", "asset": "", "type": "door", "x": 0, "y": -18, "rot": 3, "destination": "e", "wallDir": "", "compositeInfo": "A", "roomID": "a" }, { "name": "a:14,4:door(D)", "asset": "", "type": "door", "x": 2, "y": -16, "rot": 1, "destination": "f", "wallDir": "", "compositeInfo": "D", "roomID": "a" }, { "name": "a:14,10:door(D)", "asset": "", "type": "door", "x": 2, "y": -10, "rot": 1, "destination": "c", "wallDir": "", "compositeInfo": "D", "roomID": "a" }, { "name": "a:12,12:door(A)", "asset": "", "type": "door", "x": 0, "y": -8, "rot": 3, "destination": "d", "wallDir": "", "compositeInfo": "A", "roomID": "a" }, { "name": "a:16,10:door(Q)", "asset": "", "type": "door", "x": 4, "y": -10, "rot": 3, "destination": "b", "wallDir": "", "compositeInfo": "Q", "roomID": "a" }, { "name": "a:10,12:door(D)", "asset": "", "type": "door", "x": -2, "y": -8, "rot": 1, "destination": "b", "wallDir": "", "compositeInfo": "D", "roomID": "a" }, { "name": "a:10,2:door(D)", "asset": "", "type": "door", "x": -2, "y": -18, "rot": 1, "destination": "b", "wallDir": "", "compositeInfo": "D", "roomID": "a" }, { "name": "a:16,4:door(A)", "asset": "", "type": "door", "x": 4, "y": -16, "rot": 3, "destination": "b", "wallDir": "", "compositeInfo": "A", "roomID": "a" }
	],
	"furnishings": []
};

export const populateRoomCenter3 = (roomData: RoomWorkingData, roomName: string): ItemWithContext[] => {
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
	let ret = generateCenterFurniture[roomName](floorSize);
	ret = ret.filter((item: ItemWithContext) => (item.name !== "EMPTY"))
	return ret;
};

const twoByTwoCoords = [
	{ x: -0.5, y: -0.5 },
	{ x: 0.5, y: -0.5 },
	{ x: -0.5, y: 0.5 },
	{ x: 0.5, y: 0.5 },
];
const twoByOneCoords = [
	{ x: -0.5, y: 0 },
	{ x: 0.5, y: 0 },
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
			children: [],
			rot,
		})

	}
	const chairRate = 0.95;
	for (let i = 1; i <= tableCount * 2; i++) {
		chairsN.push({
			occupiedCoords: [{ x: 0, y: -.5 }],
			itemCenterCoord: { x: 0, y: -.5 },
			name: rand() < chairRate ? 'chair' : 'EMPTY',
			children: [],
			rot: 0,
		})
		chairsS.push({
			occupiedCoords: [{ x: 0, y: .5 }],
			itemCenterCoord: { x: 0, y: .5 },
			name: rand() < chairRate ? 'chair' : 'EMPTY',
			children: [],
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
			children: [], rot: 0,
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
		children: [], rot: getNFromDir(dir1) - 0.5,
	})
	// but up to four chairs:
	for (let i = 1; i < scrambledDirs.length; i++) {
		if (rand() < 0.6) {
			let dir = scrambledDirs[i];
			ret.push({
				occupiedCoords: [],
				itemCenterCoord: diagSpread[getNFromDir(dir)],
				name: 'chair',
				children: [],
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

const getBookcaseIsland = (length: number, axis: string) => {
	// const antiAxis: string = axis === 'x' ? 'y' : 'x';
	let bookcases1: ItemWithContext[] = getLineOfBookcases(length, axis);
	let bookcases2: ItemWithContext[] = getLineOfBookcases(length, axis)
	let translation: XYCoord = { x: 0, y: 0 };
	if (axis === 'x') {
		translation.y += 0.25;
	} else {
		translation.x += 0.25;
	}
	bookcases1 = bookcases1.map(item => {
		return translateItemAndChildren(item, translation);
	})
	translation = scaleXY(translation, -1);
	bookcases2 = bookcases2.map(item => {
		return translateItemAndChildren(item, translation);
	}).map(item => {
		item.rot = (item.rot + 2) % 4
		return translateItemAndChildren(item, translation);
	})
	return bookcases1.concat(bookcases2);
};

const generateCenterFurniture: Record<string, Function> = {
	diningRoom: spawnDiningTable,
	library: (placementBounds: XYCoord): ItemWithContext[] => {
		let ret: ItemWithContext[] = [];
		let depth = placementBounds.y - 2;
		let width = placementBounds.x - 3;
		// let blocksCount = Math.floor(width / depth);
		let blocksCount = 2; // temp
		let centers: XYCoord[] = [
			{ x: -width / 4, y: 0 },
			{ x: width / 4, y: 0 },
		]
		for (let i = 0; i < blocksCount; i++) {
			let axis = rand() < 0.5 ? 'x' : 'y';
			let length = axis === 'x' ? Math.floor(width / 2) : depth;
			let working: ItemWithContext[] = getBookcaseIsland(length, axis);
			let translated: ItemWithContext[] = working.map(item => translateItemAndChildren(item, centers[i]));
			ret = ret.concat(translated);
		}
		return ret;
	},
	hallway: () => { return []; },
	bedroom: () => { return [] },
	livingRoom: (): ItemWithContext[] => {
		let roundTable = spawnRoundTable();
		return roundTable;
	},
}

// let test2 = populateRoomCenter3(testRoom, "diningRoom")

// console.log(test)
// console.log("BREAKME")
