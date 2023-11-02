import { Tile } from './rooms';
import { rand, scrambleArray, getRandomWithWeight, getXYRangeFromXYCoords, translateXY, XYCoord, getOppositeDir, DIRECTIONS, averageXYCoords, scaleXY, compareXY, XYRange, getCenterForXYRange } from './utilities';

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
	let hitBoxed = (stuff || []).map(item => item.occupiedCoords).flat();

	let modifiedTiles = padRoom(tiles.filter(item => item.type === 'floor'));
	let drawRange: XYRange = getXYRangeFromXYCoords(modifiedTiles);
	let print = [];
	let roomCorners = getXYRangeFromXYCoords(tiles.map(tile => { return { x: tile.x, y: tile.y } }));
	let roomCenter = getCenterForXYRange(roomCorners);
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



/* -----------------NEW ONE------------------*/

export interface Dimensions {
	width: number,
	depth: number,
	height: number,
}
export interface FurnishingInfo2 {
	placement: string,
	placementContext: string,
	asset: string,
	dimensions: Dimensions,
}
export const FURNISHINGS2: Record<string, FurnishingInfo2> = {
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
	couchCenter: {
		placement: 'center', placementContext: '',
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
	endTable0: {
		placement: 'free', placementContext: '',
		asset: 'endtable',
		dimensions: { width: 1, depth: 1, height: 1 },
	},
	endTable1: {
		placement: 'free', placementContext: '',
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
		placement: 'free', placementContext: '',
		asset: 'pottedPlant',
		dimensions: { width: 1, depth: 1, height: 1 },
	},
	gargoyle: {
		placement: 'wall', placementContext: '',
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
		placement: 'wall', placementContext: '',
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
		dimensions: { width: 2, depth: 1, height: 2 },
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
	paintingTall0: {
		placement: 'wall', placementContext: '',
		asset: 'paintingBig_primitive0',
		dimensions: { width: 1, depth: 1, height: 2 },
	},
	paintingTall1: {
		placement: 'wall', placementContext: '',
		asset: 'paintingBig_primitive1',
		dimensions: { width: 1, depth: 1, height: 2 },
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
	{ item: 'paintingTall0', weight: 1, count: NaN },
	{ item: 'paintingTall1', weight: 1, count: NaN },
	{ item: 'cobwebEdge', weight: 4, count: NaN },
	{ item: 'cobwebCorner', weight: 4, count: NaN },
	{ item: 'candelabra', weight: 2, count: NaN },
	{ item: 'endTable0', weight: 2, count: NaN },
	{ item: 'endTable1', weight: 2, count: NaN },
	{ item: 'EMPTY', weight: 1, count: NaN },
	{ item: 'gargoyle', weight: 1, count: NaN },
	{ item: 'painting', weight: 1, count: NaN },
]

export const ROOM_CONTENTS2: Record<string, FurnitureWeight[]> = {
	livingRoom: [
		{ item: 'fireplace', weight: 0, count: 1 },
		{ item: 'couchCenter', weight: 0, count: 1 },
		{ item: 'couchWall', weight: 1, count: NaN },
		{ item: 'armChair', weight: 2, count: NaN },
		{ item: 'bookcaseTallWide', weight: 1, count: NaN },
		{ item: 'bookcaseTallNarrow', weight: 2, count: NaN },
		{ item: 'curtains', weight: 0, count: 1 },
		...commonStuff,
	],
	hallway: [
		{ item: 'couchWall', weight: 1, count: NaN },
		{ item: 'bookcaseShortWide', weight: 3, count: NaN },
		{ item: 'bookcaseShortNarrow', weight: 1, count: NaN },
		...commonStuff,
	],
	diningRoom: [
		{ item: 'armChair', weight: 4, count: NaN },
		{ item: 'diningTableHalf', weight: 0, count: 1 },
		{ item: 'curtains', weight: 0, count: 1 },
		...commonStuff,
	],
	bedroom: [
		{ item: 'dresser', weight: 0, count: 1 },
		{ item: 'bed', weight: 0, count: 1 },
		{ item: 'wardrobe', weight: 0, count: 1 },
		{ item: 'fireplace', weight: 0, count: 1 },
		{ item: 'chest', weight: 3, count: NaN },
		{ item: 'chair', weight: 2, count: NaN },
		{ item: 'bookcaseShortWide', weight: 1, count: NaN },
		{ item: 'bookcaseShortNarrow', weight: 1, count: NaN },
		{ item: 'curtains', weight: 0, count: 1 },
		...commonStuff,
	],
	library: [
		{ item: 'chest', weight: 1, count: NaN },
		{ item: 'curtains', weight: 0, count: 2 },
		{ item: 'couchWall', weight: 1, count: NaN },
		{ item: 'couchCenter', weight: 0, count: 1 },
		{ item: 'armChair', weight: 2, count: NaN },
		{ item: 'bookcaseTallWide', weight: 10, count: NaN },
		{ item: 'bookcaseTallNarrow', weight: 8, count: NaN },
		{ item: 'bookcaseShortWide', weight: 3, count: NaN },
		{ item: 'bookcaseShortNarrow', weight: 3, count: NaN },
		...commonStuff,
	]
};

export interface ChildInfo {
	item: string;
	pos: string;
	rot: number;
};

const getChildren: Record<string, Function> = {
	couchWall: (): ChildInfo[] => {
		let weight = [
			{ item: 'endTable0', weight: 3 },
			{ item: 'endTable1', weight: 3 },
			{ item: 'candelabra', weight: 1 },
			{ item: 'pottedPlant', weight: 2 },
			{ item: 'EMPTY', weight: 3 }
		];
		return [
			{ item: getRandomWithWeight(weight), pos: 'w', rot: 0 },
			{ item: getRandomWithWeight(weight), pos: 'e', rot: 0 },
		];
	},
	armChair: (): ChildInfo[] => {
		let weight = [
			{ item: 'endTable0', weight: 2 },
			{ item: 'endTable1', weight: 2 },
			{ item: 'candelabra', weight: 1 },
			{ item: 'pottedPlant', weight: 2 },
			{ item: 'EMPTY', weight: 2 }
		];
		return [
			{ item: getRandomWithWeight(weight), pos: 'w', rot: 0 },
			{ item: getRandomWithWeight(weight), pos: 'e', rot: 0 },
		];
	},
	bed: (): ChildInfo[] => {
		// 100% of the time, end table on W or E; 30% of the time, another end table on the other side
		let roll = rand();
		let randomDir = roll > 0.5 ? 'e' : 'w';
		let oppositeDir = getOppositeDir(randomDir);
		return [
			{
				item: 'endTable0',
				pos: randomDir + '0',
				rot: 0
			},
			{
				item: rand() < 0.3 ? 'endTable0' : 'EMPTY',
				pos: oppositeDir + '1',
				rot: 0
			},
			{ item: 'EMPTY', pos: randomDir + '1', rot: 0 },
			{ item: 'EMPTY', pos: oppositeDir + '1', rot: 0 },
		];
	},
	couchCenter: (): ChildInfo[] => {
		return rand() < 0.3 ? [] : [{ item: 'dresser', pos: 'n', rot: 2 }];
	},
	roundTable: (): ChildInfo[] => {
		let dirs = scrambleArray(DIRECTIONS);
		if (dirs.length < 4) { throw new Error("DIRECTIONS doesn't have four elements???") }
		let ret: ChildInfo[] = [{ item: 'chair', pos: dirs[0], rot: DIRECTIONS.indexOf(dirs[0]) }];
		for (let i = 1; i <= 3; i++) {
			if (rand() < 0.6) {
				ret.push({ item: 'chair', pos: dirs[i], rot: DIRECTIONS.indexOf(dirs[i]) });
			}
		}
		return ret;
	},
	diningTableHalf: (): ChildInfo[] => {
		const missing = 0.05;
		let children: ChildInfo[] = [];
		['n0', 'n1', 'n2', 'n3', 's0', 's1', 's2', 's3',].forEach(pos => {
			let rot: number = pos.includes('n') ? 0 : 2;
			let insert = { item: rand() < missing ? 'EMPTY' : 'chair', pos, rot };
			children.push(insert);
		});
		['n4', 'n5', 's4', 's5',].forEach(pos => {
			children.push({ item: 'EMPTY', pos, rot: 0 })
		});
		children.push({ item: 'diningTableHalf', pos: 'w', rot: 2 });
		return children;
	},
	// squareTable: () => { // NOTE: OLD STYLE OF DATA
	// 	// 1 chair minimum; 2 chairs sometimes (edges chosen is random)
	// 	const dir = getRandomDir();
	// 	const ret = [{ item: 'chair', pos: dir }];
	// 	if (rand() < 0.3) {
	// 		const opposite = getOppositeDir(dir);
	// 		ret.push({ item: 'chair', pos: opposite });
	// 	}
	// 	return ret;
	// },
};

export const spreadItemsOnAxis = (items: ItemWithContext[], axis: string, itemSize: number): ItemWithContext[] => {
	if (items.length < 1) {
		return items;
	}
	let ret: ItemWithContext[] = JSON.parse(JSON.stringify(items));
	let translationSeries: XYCoord[] = [];
	let centerCoord = averageXYCoords(items.map(item => item.itemCenterCoord));
	let rawTranslation: XYCoord = { x: 0, y: 0 };
	let initial = (-itemSize * (items.length - 1)) / 2
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
			let occupiedCoords: XYCoord[] = [{ x: x, y: y }, { x: x, y: y }];
			if (axis !== 'x' && axis !== 'y') { throw new Error("ASSERT LOL"); }
			occupiedCoords[0][axis] += splitAmt;
			occupiedCoords[1][axis] -= splitAmt;
			item.occupiedCoords = occupiedCoords;
		} else {
			let occupiedCoords: XYCoord[] = [{ x: x, y: y }];
			item.occupiedCoords = occupiedCoords;
		}
		item.itemCenterCoord.x = x;
		item.itemCenterCoord.y = y;
		return item;
	});
};
const fillOutChildrenFromParent = (parent: ItemWithContext): ItemWithContext[] => {
	let childrenGet = getChildren[parent.itemName];
	if (!childrenGet) {
		return [];
	}
	let childrenInfo = childrenGet();
	let finalChildren: ItemWithContext[] = [];
	let parentDimensions: Record<string, number> = {
		x: FURNISHINGS2[parent.itemName].dimensions.width,
		y: FURNISHINGS2[parent.itemName].dimensions.depth,
	}
	let normalizedTransforms: Record<string, XYCoord> = {
		n: { x: 0, y: -1 },
		e: { x: 1, y: 0 },
		s: { x: 0, y: 1 },
		w: { x: -1, y: 0 },
	}
	DIRECTIONS.forEach(dir => {
		let filteredChildren = childrenInfo.filter((item: ChildInfo) => item.pos.includes(dir));
		if (filteredChildren.length > 0) {
			let axis: string = dir === 'n' || dir === 's' ? 'y' : 'x';
			let childInfo = filteredChildren[0]
			let childDimensions: Record<string, number> = {
				x: FURNISHINGS2[childInfo.item].dimensions.width,
				y: FURNISHINGS2[childInfo.item].dimensions.depth,
			};
			let margin = Math.abs(parentDimensions[axis] + childDimensions[axis]) / 2;
			let naiveTranslation = scaleXY(
				normalizedTransforms[dir],
				margin
			);
			let children: ItemWithContext[] = filteredChildren.map((child: ChildInfo) => {
				return {
					occupiedCoords: [],
					itemCenterCoord: {
						x: parent.itemCenterCoord.x + naiveTranslation.x,
						y: parent.itemCenterCoord.y + naiveTranslation.y,
					},
					itemName: child.item,
					children: [],
					rot: child.rot,
				};
			});
			let spreadAxis: string = axis === 'y' ? 'x' : 'y';
			let spreadJump = childDimensions[spreadAxis];
			let spreadChildren = spreadItemsOnAxis(children, spreadAxis, spreadJump);
			let pivotChildren = pivotItemsAroundPoint(spreadChildren, parent.itemCenterCoord, 0);
			finalChildren = finalChildren.concat(pivotChildren);
		}
	})
	return finalChildren.filter(item => !(item.itemName === "EMPTY"));
};

export interface ItemWithContext {
	occupiedCoords: XYCoord[];
	itemCenterCoord: XYCoord;
	itemName: string;
	children: ItemWithContext[];
	rot: number;
};
export const getItemInfo = (itemName: string): ItemWithContext => {
	let info = FURNISHINGS2[itemName];
	let occupiedCoords: XYCoord[] = [];
	for (let y = 0; y < info.dimensions.depth; y++) {
		for (let x = 0; x < info.dimensions.width; x++) {
			occupiedCoords.push({ x, y });
		}
	}
	let parentInfo = {
		occupiedCoords,
		itemCenterCoord: averageXYCoords(occupiedCoords),
		itemName,
		children: [],
		rot: 0,
	};
	// children!
	let children = JSON.parse(JSON.stringify(fillOutChildrenFromParent(parentInfo)));
	parentInfo.children = children;
	children.forEach((child: ItemWithContext) => {
		if (child.occupiedCoords.length)
			parentInfo.occupiedCoords = parentInfo.occupiedCoords.concat(child.occupiedCoords);
	})
	return parentInfo;
};

const pivotItemAroundPoint = (item: ItemWithContext, coord: XYCoord, turns: number): ItemWithContext => {
	// normalize
	let translation = {
		x: item.itemCenterCoord.x - coord.x,
		y: item.itemCenterCoord.y - coord.y,
	}
	let rotatingItem = JSON.parse(JSON.stringify(item));
	rotatingItem.itemCenterCoord.x -= translation.x;
	rotatingItem.itemCenterCoord.y -= translation.y;
	// rotate
	for (let i = 0; i < turns; i++) {
		rotatingItem.itemCenterCoord.x = -rotatingItem.itemCenterCoord.y;
		rotatingItem.itemCenterCoord.y = rotatingItem.itemCenterCoord.x;
		rotatingItem.rot = (rotatingItem.rot + 1) % 4;
	}
	// unnormalize
	rotatingItem.itemCenterCoord.x += translation.x;
	rotatingItem.itemCenterCoord.y += translation.y;
	return rotatingItem;
}
const pivotItemsAroundPoint = (items: ItemWithContext[], coord: XYCoord, turns: number): ItemWithContext[] => {
	return items.map((item: ItemWithContext) => pivotItemAroundPoint(item, coord, turns));
}

export const translateItemAndChildren = (item: ItemWithContext, translation: XYCoord): ItemWithContext => {
	item.itemCenterCoord = translateXY(item.itemCenterCoord, translation);
	item.occupiedCoords = item.occupiedCoords.map(inner => translateXY(inner, translation));
	item.children = item.children.map(child => {
		child.itemCenterCoord = translateXY(child.itemCenterCoord, translation);
		child.occupiedCoords = child.occupiedCoords.map(inner => translateXY(inner, translation));
		return child;
	})
	return item;
}

// occupiedCoords: XYCoord[];
// 	children: ItemWithContext[];

// let test = getItemInfo("couchCenter");
// console.log(test);

// fillOutChildrenFromParent(test)

// console.log(JSON.stringify(mapWithRooms, null, '\t'));
// console.log('breakme');