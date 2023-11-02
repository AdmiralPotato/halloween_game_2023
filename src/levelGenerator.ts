import { buildMapFromSeed } from './mapBuilder';
import { FURNISHINGS } from './furnishings';
import { ROOM_CONTENTS, ROOMS, Tile } from './rooms';
import { Furnishing } from './LevelBuilder';
import { rand, randomIndex, scrambleArray, getRandomWithWeight, RandomWeight } from './utilities';
import { Room } from './LevelBuilder';
import { populateCenterObjects, populateRoomCenter3 } from './roomFurnishing';
import { FURNISHINGS2, ItemWithContext } from './furnitureForRooms';

export const makeRoomsWithSeed = (seed: string): Room[] => {
	const mapInfo = buildMapFromSeed(seed);

	/* -------------- GET STUFF -------------- */

	const getFurnishings = (roomID: string): Record<string, RandomWeight[]> => {
		let furnishings = ROOM_CONTENTS[roomID];
		return {
			wallHanging: furnishings.filter((entry) => {
				return FURNISHINGS[entry.item]?.position === 'wallHanging';
			}),
			wallEdge: furnishings.filter((entry) => {
				return FURNISHINGS[entry.item]?.position === 'wallEdge';
			}),
			freeStanding: furnishings.filter((entry) => {
				return FURNISHINGS[entry.item]?.position === 'freeStanding';
			}),
		};
	};

	const padWall = (wallArr: Tile[]): Tile[] => {
		let ret: Tile[] = [];
		let prop = wallArr[0].y - wallArr[wallArr.length - 1].y === 0 ? 'x' : 'y';
		wallArr.forEach((tile) => {
			[-0.5, 0.5].forEach((margin) => {
				let insert = JSON.parse(JSON.stringify(tile));
				insert[prop] += margin;
				insert.name = insert.x + ',' + insert.y + ':' + insert.name.split(':')[1];
				ret.push(insert);
			});
		});
		return ret;
	};
	const getWalls = (inputFloors: Tile[]): Record<string, Tile[]> => {
		let floors = inputFloors.filter(item => item.name.includes('wall'));
		let ret: Record<string, Tile[]> = {
			e: floors.filter((item) => item.compositeInfo === 'd' || item.compositeInfo === 'c'),
			// ne: floors.filter((item) => item.compositeInfo === 'e'),
			n: floors.filter((item) => item.compositeInfo === 'w'),
			// nw: floors.filter((item) => item.compositeInfo === 'q'),
			w: floors.filter((item) => item.compositeInfo === 'a' || item.compositeInfo === 'z'),
		};
		Object.keys(ret).forEach((wallDir) => {
			// get rid of it if it's empty (i.e. if it's 100% door)
			if (!ret[wallDir].length) {
				delete ret[wallDir]
			}
		})
		Object.keys(ret).forEach((wallDir) => {
			ret[wallDir] = padWall(ret[wallDir]);
			const adjustMap: Record<string, number[]> = {
				n: [0, -0.5],
				w: [-0.5, 0],
				e: [0.5, 0],
			};
			const rotMap: Record<string, number> = {
				n: 0,
				w: 3,
				e: 1,
			};
			const adjust = adjustMap[wallDir];
			ret[wallDir].forEach((item) => {
				item.rot = rotMap[wallDir];
				item.x += adjust[0];
				item.y += adjust[1];
			});
			ret[wallDir] = ret[wallDir]
				.sort((a, b) => {
					return a.x - b.x;
				})
				.sort((a, b) => {
					return a.y - b.y;
				});
		});
		return ret;
	};

	////---------------------------------------------------//
	/// ------------ THE REST OF THE OWL???? ------------ ///
	//---------------------------------------------------////

	interface InsertedItemsIntoWall {
		usedWall: Tile[];
		remainingWalls: Tile[][];
	}
	const insertItemIntoWall = (targetWall: Tile[], insertWidth: number): InsertedItemsIntoWall => {
		if (insertWidth === targetWall.length) return { usedWall: targetWall, remainingWalls: [] };
		const targetWallIndex = randomIndex(targetWall.length);
		let wallIndices = [targetWallIndex];
		for (let i = 1; i < insertWidth; i++) {
			// grab a neighbor index
			let westHasGap = targetWall[wallIndices[0] - 1];
			let eastHasGap = targetWall[wallIndices[wallIndices.length - 1] + 1];
			let go = null;
			if (!westHasGap) {
				go = 'east';
			} else if (!eastHasGap) {
				go = 'west';
			} else {
				go = rand() < 0.5 ? 'west' : 'east';
			}
			if (go === 'west') {
				wallIndices.unshift(wallIndices[0] - 1);
			} else if (go === 'east') {
				wallIndices.push(wallIndices[wallIndices.length - 1] + 1);
			}
		}
		let workingWall = JSON.parse(JSON.stringify(targetWall));
		let splice = workingWall.splice(wallIndices[0], wallIndices.length);
		let remainingWalls = [];
		if (workingWall.length) {
			let right = workingWall.splice(0, wallIndices[0]);
			let left = workingWall;
			if (right.length > 0) {
				remainingWalls.push(right);
			}
			if (left.length > 0) {
				remainingWalls.push(left);
			}
		}
		return {
			usedWall: splice,
			remainingWalls,
		};
	};

	let rooms = mapInfo.rooms;
	Object.keys(rooms).forEach((roomID) => {
		// getting room info for this room
		const roomType = rooms[roomID].name;
		const itemPool = getFurnishings(roomType).wallEdge;
		// get required items first
		let requiredItems: string[] = [];
		itemPool
			.filter((item) => item.count)
			.forEach((item) => {
				if (item.count) {
					for (let i = 0; i < item.count; i++) {
						requiredItems.push(item.item);
					}
				}
			});
		requiredItems = scrambleArray(requiredItems);
		// get wall info for this room
		const walls = getWalls(rooms[roomID].floors);
		// state stuff
		let doodads = [];
		let remainingWalls = Object.entries(walls).map(([wallDir, arr]) => {
			return arr.map((item) => {
				return Object.assign({ wallDir }, item);
			});
		});
		// while we can place more wall furniture...
		while (remainingWalls.length) {
			// info for the furniture we want
			let insertName = requiredItems.length
				? requiredItems[0]
				: getRandomWithWeight(itemPool);
			// info for the walls we are working with
			let targetWallIndex = randomIndex(remainingWalls.length);
			let targetWall = remainingWalls.splice(targetWallIndex, 1)[0];
			let wallDir = targetWall[0].wallDir;
			let isExteriorWall = ROOMS[roomID].exteriorWalls.includes(wallDir);
			if (
				// if it can only go on an exterior wall, reroll (might infinite loop; TODO: FIX THIS)
				FURNISHINGS[insertName].placement === 'exteriorWall' &&
				!isExteriorWall
			) {
				remainingWalls.push(targetWall);
				// put furniture back at the bottom of the queue
				const queued = requiredItems.shift();
				if (queued) {
					requiredItems.push(queued);
				}
				continue;
			}
			requiredItems.shift();
			let compositeInsertInfo = Object.assign({ name: insertName }, FURNISHINGS[insertName]);
			let insertWidth = compositeInsertInfo.w;
			if (insertWidth > targetWall.length) {
				continue;
			}
			let insertInfo = insertItemIntoWall(targetWall, insertWidth);
			doodads.push({
				wallTiles: insertInfo.usedWall,
				furniture: compositeInsertInfo,
			});
			remainingWalls = [...remainingWalls, ...insertInfo.remainingWalls];
		}
		doodads = doodads.filter((doodad) => {
			return doodad.furniture.name !== 'EMPTY';
		});
		rooms[roomID].furnishings = doodads.map((doodad): Furnishing => {
			const wallTiles = doodad.wallTiles;
			let x = wallTiles.reduce((acc, entry) => acc + (entry?.x || 0), 0) / wallTiles.length;
			let y = wallTiles.reduce((acc, entry) => acc + (entry?.y || 0), 0) / wallTiles.length;
			let wallType = wallTiles[0].compositeInfo;
			let rot = doodad.wallTiles[0].rot;
			if (rot === 0 && doodad.furniture.d === 2) {
				y += 0.5;
			}
			if (rot === 1 && doodad.furniture.d === 2) {
				x -= 0.5;
			}
			if (rot === 3 && doodad.furniture.d === 2) {
				x += 0.5;
			}
			return {
				label: `${x},${y}:${doodad.furniture.name}-(${wallType})`,
				name: doodad.furniture.name,
				asset: doodad.furniture.name,
				x,
				y,
				w: doodad.furniture.w,
				d: doodad.furniture.d,
				h: doodad.furniture.h,
				rot: rot,
				hasCandy: rand() < 0.3,
			};
		});

		const convertNewThingToOld = (thing: ItemWithContext) => {
			if (!FURNISHINGS2[thing.itemName]) {
				throw new Error("Could not find furniture called " + thing.itemName)
			}
			let item = {
				label: '',
				asset: thing.itemName,
				name: FURNISHINGS2[thing.itemName].asset,
				x: thing.itemCenterCoord.x,
				y: thing.itemCenterCoord.y,
				w: FURNISHINGS2[thing.itemName].dimensions.width,
				d: FURNISHINGS2[thing.itemName].dimensions.depth,
				h: FURNISHINGS2[thing.itemName].dimensions.height,
				rot: thing.rot,
				hasCandy: rand() < 0.3,
			};
			if (item.asset !== 'EMPTY') {
				rooms[roomID].furnishings.push(item);
			}
		};
		if (roomType === 'diningRoom') {
			let newStuff = populateRoomCenter3(rooms[roomID], roomType);
			newStuff.forEach((item: ItemWithContext)=>{
					convertNewThingToOld(item);
				});
			// console.log("DINING ROOM TIME")
		} else {
			populateCenterObjects(rooms[roomID], roomType).map(newThing => {
				convertNewThingToOld(newThing);
				newThing.children.forEach(child => convertNewThingToOld(child));
			});
		}
	});
	return Object.values(rooms);
};

let seed = '1111';
const mapWithRooms = makeRoomsWithSeed(seed);

console.log(JSON.stringify(mapWithRooms, null, '\t'));
console.log('breakme');
