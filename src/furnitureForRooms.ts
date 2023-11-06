import { Tile } from './rooms';
import {
	getXYRangeFromXYCoords,
	translateXY,
	XYCoord,
	averageXYCoords,
	compareXY,
	XYRange,
	getCenterForXYRange,
} from './utilities';

const cNeighborMap: Record<string, Record<string, string>> = {
	q: { nw: 'q', ne: 'w', sw: 'a', se: 's' },
	w: { nw: 'w', ne: 'w', sw: 's', se: 's' },
	e: { nw: 'w', ne: 'e', sw: 's', se: 'd' },
	a: { nw: 'a', ne: 's', sw: 'a', se: 's' },
	s: { nw: 's', ne: 's', sw: 's', se: 's' },
	d: { nw: 's', ne: 'd', sw: 's', se: 'd' },
	z: { nw: 'a', ne: 's', sw: 'a', se: 's' },
	x: { nw: 's', ne: 's', sw: 's', se: 's' },
	c: { nw: 's', ne: 'd', sw: 's', se: 'd' },
};
const transformations: Record<string, XYCoord> = {
	nw: { x: -0.5, y: -0.5 },
	ne: { x: 0.5, y: -0.5 },
	sw: { x: -0.5, y: 0.5 },
	se: { x: 0.5, y: 0.5 },
};

export const padRoom = (tiles: Tile[]): Tile[] => {
	let ret: Tile[] = [];
	tiles.forEach((tile) => {
		Object.keys(transformations).forEach((dir: string) => {
			let clone: Tile = JSON.parse(JSON.stringify(tile));
			let newCoords = translateXY({ x: clone.x, y: clone.y }, transformations[dir]);
			clone.x = newCoords.x;
			clone.y = newCoords.y;
			let capital = /[A-Z]/.test(clone.compositeInfo);
			let compositeLookup = clone.compositeInfo.toLowerCase();
			let newC = cNeighborMap[compositeLookup][dir];
			clone.compositeInfo = capital ? newC.toUpperCase() : newC;
			ret.push(clone);
		});
	});
	return ret;
};

export const printRoom = (tiles: Tile[], stuff: ItemWithContext[]): string => {
	let hitBoxed = (stuff || []).map((item) => item.collisionOffsetsCoords).flat();

	let modifiedTiles = padRoom(tiles.filter((item) => item.type === 'floor'));
	let drawRange: XYRange = getXYRangeFromXYCoords(modifiedTiles);
	let print = [];
	let roomCorners = getXYRangeFromXYCoords(
		tiles.map((tile) => {
			return { x: tile.x, y: tile.y };
		}),
	);
	for (let y = drawRange.y.min; y <= drawRange.y.max; y++) {
		let line = '';
		for (let x = drawRange.x.min; x <= drawRange.x.max; x++) {
			let thisSpot = modifiedTiles.filter((tile) => tile.x === x && tile.y === y);
			let value = '';
			if (thisSpot.length === 1) {
				value = thisSpot[0].compositeInfo;
			} else if (thisSpot.length < 1) {
				value = ' ';
			} else {
				value = '!';
			}
			let hit = hitBoxed.some((coord) => compareXY(coord, { x, y }));
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
	width: number;
	depth: number;
	height: number;
}
export interface FurnishingInfo {
	placement: string;
	placementContext: string;
	asset: string;
	dimensions: Dimensions;
	candyRate: number;
}
const defaultCandyRate = 0.3;
const highCandyRate = 0.6;
export const FURNISHINGS: Record<string, FurnishingInfo> = {
	EMPTY: {
		placement: 'free',
		placementContext: '',
		asset: '',
		dimensions: { width: 1, depth: 1, height: 2 },
		candyRate: 0,
	},
	curtains: {
		placement: 'wall',
		placementContext: 'exteriorWall',
		asset: 'curtain',
		dimensions: { width: 2, depth: 1, height: 2 },
		candyRate: defaultCandyRate,
	},
	painting: {
		placement: 'wall',
		placementContext: '',
		asset: 'paintingSml',
		dimensions: { width: 1, depth: 1, height: 1 },
		candyRate: 0,
	},
	couchWall: {
		placement: 'wall',
		placementContext: '',
		asset: 'couch',
		dimensions: { width: 2, depth: 1, height: 1 },
		candyRate: highCandyRate,
	},
	armChair: {
		placement: 'free',
		placementContext: '',
		asset: 'armchair',
		dimensions: { width: 1, depth: 1, height: 1 },
		candyRate: highCandyRate,
	},
	chair: {
		placement: 'free',
		placementContext: '',
		asset: 'chair',
		dimensions: { width: 1, depth: 1, height: 1 },
		candyRate: defaultCandyRate,
	},
	bed: {
		placement: 'wall',
		placementContext: '',
		asset: 'bed',
		dimensions: { width: 2, depth: 2, height: 2 },
		candyRate: highCandyRate,
	},
	endTable: {
		placement: 'free',
		placementContext: 'corner',
		asset: 'endtable',
		dimensions: { width: 1, depth: 1, height: 1 },
		candyRate: defaultCandyRate,
	},
	candelabra: {
		placement: 'free',
		placementContext: '',
		asset: 'candelabra',
		dimensions: { width: 1, depth: 1, height: 2 },
		candyRate: defaultCandyRate,
	},
	wardrobe: {
		placement: 'wall',
		placementContext: '',
		asset: 'wardrobe',
		dimensions: { width: 2, depth: 1, height: 2 },
		candyRate: highCandyRate,
	},
	fireplace: {
		placement: 'wall',
		placementContext: '',
		asset: 'fireplace',
		dimensions: { width: 2, depth: 1, height: 2 },
		candyRate: defaultCandyRate,
	},
	pottedPlant: {
		placement: 'free',
		placementContext: 'corner',
		asset: 'pottedPlant',
		dimensions: { width: 1, depth: 1, height: 1 },
		candyRate: highCandyRate,
	},
	gargoyle: {
		placement: 'wall',
		placementContext: '',
		asset: 'gargoyle',
		dimensions: { width: 1, depth: 1, height: 2 },
		candyRate: defaultCandyRate,
	},
	roundTable: {
		placement: 'center',
		placementContext: '',
		asset: 'tableRound',
		dimensions: { width: 2, depth: 2, height: 2 },
		candyRate: 0,
	},
	dresser: {
		placement: 'wall',
		placementContext: '',
		asset: 'dresser',
		dimensions: { width: 2, depth: 1, height: 1 },
		candyRate: highCandyRate,
	},
	chest: {
		placement: 'wall',
		placementContext: '',
		asset: 'chest',
		dimensions: { width: 1, depth: 1, height: 1 },
		candyRate: 1,
	},
	cobwebEdge: {
		placement: 'wall',
		placementContext: 'corner',
		asset: 'cobwebEdge',
		dimensions: { width: 1, depth: 1, height: 1 },
		candyRate: 0,
	},
	cobwebCorner: {
		placement: 'corner',
		placementContext: 'corner',
		asset: 'cobwebCrnr',
		dimensions: { width: 1, depth: 1, height: 1 },
		candyRate: 0,
	},
	bookcaseTallWide: {
		placement: 'wall',
		placementContext: '',
		asset: 'bookcaseWide',
		dimensions: { width: 2, depth: 1, height: 2 },
		candyRate: defaultCandyRate,
	},
	bookcaseTallNarrow: {
		placement: 'wall',
		placementContext: '',
		asset: 'bookcaseNarr',
		dimensions: { width: 1, depth: 1, height: 2 },
		candyRate: defaultCandyRate,
	},
	bookcaseShortWide: {
		placement: 'wall',
		placementContext: '',
		asset: 'bookcaseShor',
		dimensions: { width: 2, depth: 1, height: 1 },
		candyRate: defaultCandyRate,
	},
	bookcaseShortNarrow: {
		placement: 'wall',
		placementContext: '',
		asset: 'bookcaseShNr',
		dimensions: { width: 1, depth: 1, height: 1 },
		candyRate: defaultCandyRate,
	},
	doorframe: {
		placement: 'wall',
		placementContext: '',
		asset: 'doorframe',
		dimensions: { width: 2, depth: 2, height: 2 },
		candyRate: 0,
	},
	diningTableHalf: {
		placement: 'center',
		placementContext: '',
		asset: 'tableLongEnd',
		dimensions: { width: 2, depth: 2, height: 1 },
		candyRate: 0,
	},
	diningTableMid: {
		placement: 'center',
		placementContext: '',
		asset: 'tableLongMid',
		dimensions: { width: 2, depth: 2, height: 1 },
		candyRate: 0,
	},
	paintingWide: {
		placement: 'wall',
		placementContext: '',
		asset: 'paintingBig',
		dimensions: { width: 2, depth: 1, height: 1 },
		candyRate: 0,
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
	{ item: 'painting', weight: 1, count: NaN },
	{ item: 'paintingWide', weight: 1, count: NaN },
	{ item: 'cobwebEdge', weight: 4, count: NaN },
	{ item: 'cobwebCorner', weight: 4, count: NaN },
	{ item: 'candelabra', weight: 2, count: NaN },
	{ item: 'endTable', weight: 1, count: NaN },
	{ item: 'EMPTY', weight: 1, count: NaN },
];

export const ROOM_CONTENTS: Record<string, FurnitureWeight[]> = {
	livingRoom: [
		{ item: 'fireplace', weight: 0, count: 1 },
		{ item: 'curtains', weight: 2, count: NaN },
		{ item: 'couchWall', weight: 1, count: NaN },
		{ item: 'armChair', weight: 2, count: NaN },
		{ item: 'bookcaseTallWide', weight: 1, count: NaN },
		{ item: 'bookcaseTallNarrow', weight: 2, count: NaN },
		{ item: 'gargoyle', weight: 2, count: NaN },
		...commonStuff,
	],
	hallway: [
		{ item: 'couchWall', weight: 1, count: NaN },
		{ item: 'bookcaseShortWide', weight: 3, count: NaN },
		{ item: 'curtains', weight: 2, count: NaN },
		{ item: 'bookcaseShortNarrow', weight: 1, count: NaN },
		{ item: 'gargoyle', weight: 3, count: NaN },
		...commonStuff,
	],
	diningRoom: [
		{ item: 'curtains', weight: 1, count: NaN },
		{ item: 'armChair', weight: 4, count: NaN },
		{ item: 'endTable', weight: 4, count: NaN },
		{ item: 'gargoyle', weight: 1, count: NaN },
		{ item: 'bookcaseShortWide', weight: 1, count: NaN },
		...commonStuff,
	],
	bedroom: [
		{ item: 'bed', weight: 0, count: 1 },
		{ item: 'wardrobe', weight: 0, count: 1 },
		{ item: 'dresser', weight: 0, count: 1 },
		{ item: 'fireplace', weight: 0, count: 1 },
		{ item: 'curtains', weight: 1, count: NaN },
		{ item: 'chest', weight: 5, count: NaN },
		{ item: 'chair', weight: 2, count: NaN },
		{ item: 'armChair', weight: 1, count: NaN },
		{ item: 'bookcaseShortWide', weight: 1, count: NaN },
		{ item: 'bookcaseShortNarrow', weight: 1, count: NaN },
		...commonStuff,
	],
	library: [
		{ item: 'chair', weight: 5, count: NaN },
		{ item: 'curtains', weight: 2, count: NaN },
		{ item: 'armChair', weight: 5, count: NaN },
		{ item: 'bookcaseTallWide', weight: 10, count: NaN },
		{ item: 'bookcaseTallNarrow', weight: 8, count: NaN },
		{ item: 'bookcaseShortWide', weight: 3, count: NaN },
		{ item: 'bookcaseShortNarrow', weight: 3, count: NaN },
		{ item: 'gargoyle', weight: 3, count: NaN },
		{ item: 'candelabra', weight: 8, count: NaN }, // also in common stuff
		...commonStuff,
	],
};

export const spreadItemsOnAxis = (
	items: ItemWithContext[],
	axis: string,
): ItemWithContext[] => {
	if (axis !== 'x' && axis !== 'y') {
		throw new Error("ASSERT")
	}
	if (items.length < 1) {
		return items;
	}
	let spreadingItems: ItemWithContext[] = JSON.parse(JSON.stringify(items));
	let centerAtCoord = getCenterForXYRange(getXYRangeFromXYCoords(spreadingItems.map(item => item.centerCoord))); // NOTE This will mess things up for 2x wide things; TODO FIX
	spreadingItems = spreadingItems.map((item, i, array) => {
		if (i === 0) {
			item.centerCoord[axis] = centerAtCoord[axis];
		} else {
			// note: we're always using the width because we're only spacing on the item's local width (x) anyway
			item.centerCoord[axis] = array[i - 1].centerCoord[axis]
				+ item.dimensions.width / 2
				+ array[i - 1].dimensions.width / 2;
		}
		return item;
	})
	// centering items
	let firstX = spreadingItems[0].centerCoord[axis];
	let lastX = spreadingItems[spreadingItems.length - 1].centerCoord[axis];
	let spaceByHalf = (lastX - firstX) / 2;
	let translation = JSON.parse(JSON.stringify(centerAtCoord));
	translation[axis] -= spaceByHalf;
	spreadingItems = translateItems(spreadingItems, translation);
	// making adjustments based on the offsets
	spreadingItems = spreadingItems.map(item => {
		let actualCenter = averageXYCoords(item.collisionOffsetsCoords);
		item.centerCoord = translateXY(item.centerCoord, actualCenter);
		return item;
	})
	return spreadingItems;
};

export interface ItemWithContext {
	collisionOffsetsCoords: XYCoord[];
	dimensions: Dimensions;
	centerCoord: XYCoord;
	name: string;
	rot: number;
}

const translateItem = (item: ItemWithContext, translation: XYCoord): ItemWithContext => {
	item.centerCoord = translateXY(item.centerCoord, translation);
	// item.collisionOffsetsCoords = item.collisionOffsetsCoords.map((inner) =>
	// 	translateXY(inner, translation),
	// );
	return item;
};
export const translateItems = (
	items: ItemWithContext[],
	translation: XYCoord,
): ItemWithContext[] => {
	return items.map((item) => translateItem(item, translation));
};

// console.log(JSON.stringify(mapWithRooms, null, '\t'));
// console.log('breakme');
