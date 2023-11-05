import { Tile } from './rooms';
import { rand, getRandomWithWeight, getXYRangeFromXYCoords, translateXY, XYCoord, getOppositeDir, DIRECTIONS, averageXYCoords, scaleXY, compareXY, XYRange, getCenterForXYRange, getNFromDir, getScrambledDirs } from './utilities';

const cNeighborMap: Record<string, Record<string, string>> = {
	q: { nw: 'q', ne: 'w', sw: 'a', se: 's', },
	w: { nw: 'w', ne: 'w', sw: 's', se: 's', },
	e: { nw: 'w', ne: 'e', sw: 's', se: 'd', },
	a: { nw: 'a', ne: 's', sw: 'a', se: 's', },
	s: { nw: 's', ne: 's', sw: 's', se: 's', },
	d: { nw: 's', ne: 'd', sw: 's', se: 'd', },
	z: { nw: 'a', ne: 's', sw: 'a', se: 's', },
	x: { nw: 's', ne: 's', sw: 's', se: 's', },
	c: { nw: 's', ne: 'd', sw: 's', se: 'd', },
};
const transformations: Record<string, XYCoord> = {
	nw: { x: -0.5, y: -0.5 },
	ne: { x: 0.5, y: -0.5 },
	sw: { x: -0.5, y: 0.5 },
	se: { x: 0.5, y: 0.5 },
};

export const padRoom = (tiles: Tile[]): Tile[] => {
	let ret: Tile[] = [];
	tiles.forEach(tile => {
		Object.keys(transformations).forEach((dir: string) => {
			let clone: Tile = JSON.parse(JSON.stringify(tile));
			let newCoords = translateXY(
				{ x: clone.x, y: clone.y },
				transformations[dir]
			)
			clone.x = newCoords.x;
			clone.y = newCoords.y;
			let capital = /[A-Z]/.test(clone.compositeInfo);
			let compositeLookup = clone.compositeInfo.toLowerCase();
			let newC = cNeighborMap[compositeLookup][dir];
			clone.compositeInfo = capital ? newC.toUpperCase() : newC;
			ret.push(clone);
		})
	})
	return ret;
};

export const printRoom = (tiles: Tile[], stuff: ItemWithContext[]): string => {
	let hitBoxed = (stuff || []).map(item => item.collisionOffsetsCoords).flat();

	let modifiedTiles = padRoom(tiles.filter(item => item.type === 'floor'));
	let drawRange: XYRange = getXYRangeFromXYCoords(modifiedTiles);
	let print = [];
	let roomCorners = getXYRangeFromXYCoords(tiles.map(tile => { return { x: tile.x, y: tile.y } }));
	for (let y = drawRange.y.min; y <= drawRange.y.max; y++) {
		let line = '';
		for (let x = drawRange.x.min; x <= drawRange.x.max; x++) {
			let thisSpot = modifiedTiles.filter(tile => tile.x === x && tile.y === y);
			let value = '';
			if (thisSpot.length === 1) { value = thisSpot[0].compositeInfo; }
			else if (thisSpot.length < 1) { value = ' '; }
			else {
				value = '!';
			}
			let hit = hitBoxed.some(coord => compareXY(coord, { x, y, }));
			if (hit) {
				value = '\u001B[31m' + value + '\u001B[0m';
			}
			line += value;
		}
		print.push(line);
	}
	// console.log(print.join('\n'));
	return print.join('\n');
};

export interface Dimensions {
	width: number,
	depth: number,
	height: number,
}
export interface FurnishingInfo {
	placement: string,
	placementContext: string,
	asset: string,
	dimensions: Dimensions,
}
// TODO: weigh candy likelihood per item; e.g. treasure chests = 100% chance
export const FURNISHINGS: Record<string, FurnishingInfo> = {
	EMPTY: {
		placement: 'free', placementContext: '',
		asset: '',
		dimensions: { width: 1, depth: 1, height: 2 },
	},
	curtains: {
		placement: 'wall', placementContext: 'exteriorWall',
		asset: 'curtain',
		dimensions: { width: 2, depth: 1, height: 2 },
	},
	painting: {
		placement: 'wall', placementContext: '',
		asset: 'paintingSml',
		dimensions: { width: 1, depth: 1, height: 1 },
	},
	couchWall: {
		placement: 'wall', placementContext: '',
		asset: 'couch',
		dimensions: { width: 2, depth: 1, height: 1 },
	},
	armChair: {
		placement: 'free', placementContext: '',
		asset: 'armchair',
		dimensions: { width: 1, depth: 1, height: 1 },
	},
	chair: {
		placement: 'free', placementContext: '',
		asset: 'chair',
		dimensions: { width: 1, depth: 1, height: 1 },
	},
	bed: {
		placement: 'wall', placementContext: '',
		asset: 'bed',
		dimensions: { width: 2, depth: 2, height: 2 },
	},
	endTable: {
		placement: 'free', placementContext: 'corner',
		asset: 'endtable',
		dimensions: { width: 1, depth: 1, height: 1 },
	},
	candelabra: {
		placement: 'free', placementContext: '',
		asset: 'candelabra',
		dimensions: { width: 1, depth: 1, height: 2 },
	},
	wardrobe: {
		placement: 'wall', placementContext: '',
		asset: 'wardrobe',
		dimensions: { width: 2, depth: 1, height: 2 },
	},
	fireplace: {
		placement: 'wall', placementContext: '',
		asset: 'fireplace',
		dimensions: { width: 2, depth: 1, height: 2 },
	},
	pottedPlant: {
		placement: 'free', placementContext: 'corner',
		asset: 'pottedPlant',
		dimensions: { width: 1, depth: 1, height: 1 },
	},
	gargoyle: {
		placement: 'wall', placementContext: 'corner',
		asset: 'gargoyle',
		dimensions: { width: 1, depth: 1, height: 2 },
	},
	roundTable: {
		placement: 'center', placementContext: '',
		asset: 'tableRound',
		dimensions: { width: 2, depth: 2, height: 2 },
	},
	dresser: {
		placement: 'wall', placementContext: '',
		asset: 'dresser',
		dimensions: { width: 2, depth: 1, height: 1 },
	},
	chest: {
		placement: 'wall', placementContext: 'corner',
		asset: 'chest',
		dimensions: { width: 1, depth: 1, height: 1 },
	},
	cobwebEdge: {
		placement: 'wall', placementContext: 'corner',
		asset: 'cobwebEdge',
		dimensions: { width: 1, depth: 1, height: 1 },
	},
	cobwebCorner: {
		placement: 'wall', placementContext: 'corner',
		asset: 'cobwebCrnr',
		dimensions: { width: 1, depth: 1, height: 1 },
	},
	bookcaseTallWide: {
		placement: 'wall', placementContext: '',
		asset: 'bookcaseWide',
		dimensions: { width: 2, depth: 1, height: 2 },
	},
	bookcaseTallNarrow: {
		placement: 'wall', placementContext: '',
		asset: 'bookcaseNarr',
		dimensions: { width: 1, depth: 1, height: 2 },
	},
	bookcaseShortWide: {
		placement: 'wall', placementContext: '',
		asset: 'bookcaseShor',
		dimensions: { width: 2, depth: 1, height: 1 },
	},
	bookcaseShortNarrow: {
		placement: 'wall', placementContext: '',
		asset: 'bookcaseShNr',
		dimensions: { width: 1, depth: 1, height: 1 },
	},
	doorframe: {
		placement: 'wall', placementContext: '',
		asset: 'doorframe',
		dimensions: { width: 2, depth: 2, height: 2 },
	},
	diningTableHalf: {
		placement: 'center', placementContext: '',
		asset: 'tableLongEnd',
		dimensions: { width: 2, depth: 2, height: 1 },
	},
	diningTableMid: {
		placement: 'center', placementContext: '',
		asset: 'tableLongMid',
		dimensions: { width: 2, depth: 2, height: 1 },
	},
	paintingTall: {
		placement: 'wall', placementContext: '',
		asset: 'paintingBig',
		dimensions: { width: 1, depth: 1, height: 2 },
	},
	doorFrame: {
		placement: 'special', placementContext: '',
		asset: 'doorframe',
		dimensions: { width: 2, depth: 1, height: 2 },
	},
};
/* WISHLIST
Grandfather clock
*/
export interface FurnitureWeight {
	weight: number;
	count: number;
	item: string;
}

const commonStuff: FurnitureWeight[] = [
	{ item: 'pottedPlant', weight: 2, count: NaN },
	{ item: 'paintingTall', weight: 1, count: NaN },
	{ item: 'cobwebEdge', weight: 4, count: NaN },
	{ item: 'cobwebCorner', weight: 4, count: NaN },
	{ item: 'candelabra', weight: 2, count: NaN },
	{ item: 'endTable', weight: 2, count: NaN },
	{ item: 'EMPTY', weight: 1, count: NaN },
	{ item: 'gargoyle', weight: 3, count: NaN },
	{ item: 'painting', weight: 1, count: NaN },
]

export const ROOM_CONTENTS: Record<string, FurnitureWeight[]> = {
	livingRoom: [
		{ item: 'fireplace', weight: 0, count: 1 },
		{ item: 'curtains', weight: 1, count: NaN },
		{ item: 'couchWall', weight: 1, count: NaN },
		{ item: 'armChair', weight: 2, count: NaN },
		{ item: 'bookcaseTallWide', weight: 1, count: NaN },
		{ item: 'bookcaseTallNarrow', weight: 2, count: NaN },
		...commonStuff,
	],
	hallway: [
		{ item: 'couchWall', weight: 1, count: NaN },
		{ item: 'bookcaseShortWide', weight: 3, count: NaN },
		{ item: 'bookcaseShortNarrow', weight: 1, count: NaN },
		...commonStuff,
	],
	diningRoom: [
		{ item: 'curtains', weight: 1, count: NaN },
		{ item: 'armChair', weight: 4, count: NaN },
		...commonStuff,
	],
	bedroom: [
		{ item: 'bed', weight: 0, count: 1 },
		{ item: 'wardrobe', weight: 0, count: 1 },
		{ item: 'dresser', weight: 0, count: 1 },
		{ item: 'fireplace', weight: 0, count: 1 },
		{ item: 'curtains', weight: 1, count: NaN },
		{ item: 'chest', weight: 3, count: NaN },
		{ item: 'chair', weight: 2, count: NaN },
		{ item: 'bookcaseShortWide', weight: 1, count: NaN },
		{ item: 'bookcaseShortNarrow', weight: 1, count: NaN },
		...commonStuff,
	],
	library: [
		{ item: 'chest', weight: 1, count: NaN },
		{ item: 'curtains', weight: 2, count: NaN },
		{ item: 'couchWall', weight: 1, count: NaN },
		{ item: 'armChair', weight: 2, count: NaN },
		{ item: 'bookcaseTallWide', weight: 10, count: NaN },
		{ item: 'bookcaseTallNarrow', weight: 8, count: NaN },
		{ item: 'bookcaseShortWide', weight: 3, count: NaN },
		{ item: 'bookcaseShortNarrow', weight: 3, count: NaN },
		{ item: 'candelabra', weight: 8, count: NaN }, // also in common stuff
		...commonStuff,
	]
};

export const spreadItemsOnAxis = (items: ItemWithContext[], axis: string, itemSize: number): ItemWithContext[] => {
	if (items.length < 1) {
		return items;
	}
	let ret: ItemWithContext[] = JSON.parse(JSON.stringify(items));
	let centerCoord = averageXYCoords(items.map(item => item.centerCoord));
	let rawTranslation: XYCoord = { x: 0, y: 0 };
	let initial = (-itemSize * (items.length - 1)) / 2
	let translationSeries: XYCoord[] = [];
	for (
		let i = initial;
		i < items.length;
		i += itemSize
	) {
		let thisTranslation = JSON.parse(JSON.stringify(rawTranslation));
		thisTranslation[axis] = i;
		translationSeries.push(thisTranslation);
	}
	let splitCollisions = items.length % 2 !== 0;
	return ret.map((item: ItemWithContext, i: number) => {
		let translation = translationSeries[i] || rawTranslation;
		let x: number = centerCoord.x + translation.x;
		let y: number = centerCoord.y + translation.y;
		if (splitCollisions) {
			let splitAmt = (itemSize - 1) / 2;
			let collisionOffsetsCoords: XYCoord[] = [{ x: x, y: y }, { x: x, y: y }];
			if (axis !== 'x' && axis !== 'y') { throw new Error("ASSERT LOL"); }
			collisionOffsetsCoords[0][axis] += splitAmt;
			collisionOffsetsCoords[1][axis] -= splitAmt;
			item.collisionOffsetsCoords = collisionOffsetsCoords;
		} else {
			let collisionOffsetsCoords: XYCoord[] = [{ x: x, y: y }];
			item.collisionOffsetsCoords = collisionOffsetsCoords;
		}
		item.centerCoord.x = x;
		item.centerCoord.y = y;
		return item;
	});
};

export interface ItemWithContext {
	collisionOffsetsCoords: XYCoord[];
	dimensions: Dimensions;
	centerCoord: XYCoord;
	name: string;
	rot: number;
};

const translateItem = (item: ItemWithContext, translation: XYCoord): ItemWithContext => {
	item.centerCoord = translateXY(item.centerCoord, translation);
	item.collisionOffsetsCoords = item.collisionOffsetsCoords.map(inner => translateXY(inner, translation));
	return item;
}
export const translateItems = (items: ItemWithContext[], translation: XYCoord): ItemWithContext[] => {
	return items.map(item => translateItem(item, translation));
}

// console.log(JSON.stringify(mapWithRooms, null, '\t'));
// console.log('breakme');