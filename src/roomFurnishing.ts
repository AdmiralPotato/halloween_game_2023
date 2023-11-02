import { ChildInfo, FURNISHINGS2, ItemWithContext, ROOM_CONTENTS2, getItemInfo, padRoom, printRoom, spreadItemsOnAxis, translateItemAndChildren } from './furnitureForRooms';
import { RoomWorkingData, Tile } from './rooms';
import { getXYRangeFromXYCoords, XYCoord, XYRange, getCenterForXYRange, rand } from './utilities';

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

export const populateRoomCenter3 = (roomData: RoomWorkingData, roomName: string) => {
	let floors: Tile[] = roomData.floors;
	let floorCoords = padRoom(floors)
		.filter((tile: Tile)=>{
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
		x: floorRange.x.max - floorRange.x.min + paddingBetweenCenterAndWall,
		y: floorRange.y.max - floorRange.y.min + paddingBetweenCenterAndWall,
	};
	let ret = generateCenterFurniture[roomName](floorSize);
	ret = ret.filter((item: ItemWithContext)=>(item.itemName !== "EMPTY"))
	return ret;
};

const generateCenterFurniture: Record<string, Function> = {
	diningRoom: (placementBounds: XYCoord): ItemWithContext[] =>  {
		let tables: ItemWithContext[] = [];
		let chairsN: ItemWithContext[] = [];
		let chairsS: ItemWithContext[] = [];
		if ( placementBounds.y < 2 || placementBounds.x < 4 ) { return []; }
		let tableCount = Math.floor(placementBounds.x / 2) - 1;
		for (let i = 1; i <= tableCount; i++) {
			let item = "diningTableMid";
			let rot = 0;i === 1 ? 0 : 2;
			if (i === 1) {
				rot = 2;
				item = "diningTableHalf";
			} else if (i === tableCount) {
				item = "diningTableHalf";
			}
			tables.push({
				occupiedCoords: [
					{ x: -0.5, y: -0.5 },
					{ x: 0.5, y: -0.5 },
					{ x: -0.5, y: 0.5 },
					{ x: 0.5, y: 0.5 },
				],
				itemCenterCoord: {x: 0, y: 0},
				itemName: item,
				children: [],
				rot,
			})
			
		}
		const chairRate = 0.95;
		for (let i = 1; i <= tableCount*2; i++) {
			chairsN.push({
				occupiedCoords: [{x: 0, y: -1}],
				itemCenterCoord: {x: 0, y: -1},
				itemName: rand() < chairRate ? 'chair' : 'EMPTY',
				children: [],
				rot: 0,
			})
			chairsS.push({
				occupiedCoords: [{x: 0, y: 1}],
				itemCenterCoord: {x: 0, y: 1},
				itemName: rand() < chairRate ? 'chair' : 'EMPTY',
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
		ret.forEach(item=>{
			console.log(
				item.itemCenterCoord.x+','
				+item.itemCenterCoord.y+': '
				+item.itemName
				+` (rot: ${item.rot})`
			);
		})
		return ret;
	}
}

export const populateCenterObjects = (roomData: RoomWorkingData, roomType: string) => {
	// todo: move wall stuff to here, where it'll work better
	let possibleStuff = ROOM_CONTENTS2[roomType];
	let decidedStuff: ItemWithContext[] = [];
	let requiredCenterStuff = possibleStuff.filter(item => item.count);
	let floors = roomData.floors;
	let floorCoords = floors.filter(floor=>floor.compositeInfo === 's').map(floor => {
		return {
			x: floor.x, y: floor.y,
		}
	})
	let floorRange: XYRange = getXYRangeFromXYCoords(floorCoords);
	let floorCenterCoord: XYCoord = getCenterForXYRange(floorRange);
	let paddingBetweenCenterAndWall = 1;
	let floorSize = {
		x: floorRange.x.max - floorRange.x.min + paddingBetweenCenterAndWall,
		y: floorRange.y.max - floorRange.y.min + paddingBetweenCenterAndWall,
	};

	// try center stuff
	let center = requiredCenterStuff.filter(item => {
		return FURNISHINGS2[item.item].placement === 'center'
	});// assuming only 1 required of each thing (TODO change it)
	center.forEach(item => {
		let thingInfo = getItemInfo(item.item);
		// let eligibleFloorRange: XYRange = getXYRangeFromXYCoords(
		// 	floors.filter(item => item.compositeInfo === 's'));
		let hitBoxCoords: XYCoord[] = thingInfo.occupiedCoords;
		let thingHitBox: XYRange = getXYRangeFromXYCoords(hitBoxCoords);
		let centerOfItem: XYCoord = getCenterForXYRange(thingHitBox);
		let translateBy = {
			x: Math.floor(centerOfItem.x) + 0.5,
			y: Math.floor(centerOfItem.y) + 0.5,
		}
		let normalizedItem = translateItemAndChildren(thingInfo, translateBy);
		decidedStuff.push(normalizedItem);
	});
	let print = printRoom(roomData.floors, decidedStuff);
	// console.log(print);
	return decidedStuff;
};

// let test = populateCenterObjects(testRoom, 'diningRoom');
// let test2 = populateRoomCenter3(testRoom, "diningRoom")

// console.log(test)
// console.log("BREAKME")
