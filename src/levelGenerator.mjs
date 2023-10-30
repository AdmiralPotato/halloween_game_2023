import seedrandom from 'seedrandom';
import {buildMapFromSeed} from './mapBuilder.mjs';

const DIRECTIONS = ['N','E','S','W'];
const getOppositeDir = (dir) => {
	return DIRECTIONS[(DIRECTIONS.indexOf(dir) + 2) % 4];
};

export const makeRoomsWithSeed = (seed) => {
	const mapInfo = buildMapFromSeed(seed);
	let rand = seedrandom(seed);

	/* -------------- UTILITY -------------- */

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
	const scrambleArray = (arr) => {
		const ret = [];
		let workingArr = arr.slice();
		while (workingArr.length) {
			let i = randomIndex(workingArr.length);
			ret.push(workingArr.splice(i, 1)[0]);
		}
		return ret;
	};
	const getRandomDir = () => DIRECTIONS[randomIndex(4)];
	const getRandomDiningTable = () => {
		return rand() < 0.5
			? { item: 'diningTable3', count: 1}
			: { item: 'diningTable4', count: 1};
	};

	const getRandomWithWeight = input => {
		const pickFrom = [];
		if (Array.isArray(input)) {
			// [{ item: itemName, weight: # }, {...}] version
			input.forEach(entry=>{
				for (let i = 0; i < entry.weight; i++) {
					pickFrom.push(entry.item);
				}
			});
		} else {
			// { propertyName: #, ... } version
			Object.entries(input).forEach(pair=>{
				const [key, value] = pair;
				for (let i = 0; i < value; i++) {
					pickFrom.push(key);
				}
			});
		}
		return pickFrom[randomIndex(pickFrom.length)];
	};

	// position = wallHanging, wallEdge, freeStanding,
	const shortWallStuff = [
		// wallHanging
		{ item: 'curtainShort', weight: 1},
		{ item: 'mirrorShort', weight: 1},
		{ item: 'paintingSml', weight: 1},
	];
	const tallWallStuff = [
		// wallHanging
		{ item: 'curtain', weight: 1},
		{ item: 'mirrorTall', weight: 1},
		{ item: 'paintingTall', weight: 1},
	];
	const everyRoomStuff = [
		{ item: 'cobwebEdge', weight: 4},
		{ item: 'pottedPlant', weight: 2},
		{ item: 'gargoyle', weight: 1},
		{ item: 'grandfatherClock', weight: 1},
		{ item: 'candelabra', weight: 2},
		{ item: 'endtable_primitive0', weight: 1},
		{ item: 'EMPTY', weight: 6},
	];
	const FURNISHINGS = {
		// THESE WERE 'wallHanging'
		// curtainShort: { position: 'wallEdge', size: { w:1, d:0, h:1 }, },
		curtain: { position: 'wallEdge', size: { w:2, d:0, h:2 }, },
		// mirrorShort: { position: 'wallEdge', size: { w:1, d:0, h:1 }, },
		// mirrorTall: { position: 'wallEdge', size: { w:1, d:0, h:2 }, },
		paintingSml: { position: 'wallEdge', size: { w:1, d:0, h:1 }, }, // todo: wide
		// paintingTall: { position: 'wallEdge', size: { w:1, d:0, h:2 }, }, // todo: narrow
		// door: { position: 'wallEdge', size: { w:1, d:0, h:2 }, },
		// END 'wallHanging'
		couch: {
			position: 'wallEdge',
			size: { w:2, d:1, h:1 },
			getChildren: () => {
				let weight = {
					'endtable_primitive0': 5,
					'candelabra': 1,
					'pottedPlant': 2,
					'EMPTY': 3
				};
				return [
					{ item: getRandomWithWeight(weight), pos: 'W' },
					{ item: getRandomWithWeight(weight), pos: 'E' },
				];
			}
		},
		armchair: {
			position: 'wallEdge',
			size: { w:1, d:1, h:1 },
			getChildren: () => {
				let weight = {
					'endtable_primitive0': 3,
					'candelabra': 1,
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
					{ item: 'endtable_primitive0', pos: [ roll > 0.5 ? 'W' : 'E' ] },
					{ item: rand() < 0.3 ? 'endtable_primitive0' : 'EMPTY', pos: [ roll <= 0.5 ? 'W' : 'E' ] },
				];
			},
		},
		cobwebEdgeEdge: { position: 'wallEdge', size: { w:1, d:1, h:1 } },
		wardrobe: { position: 'wallEdge', size: { w:2, d:1, h:2 } },
		fireplace: { position: 'wallEdge', size: { w:2, d:1, h:2 }, },
		bookcaseNarr: { position: 'wallEdge', size: { w:1, d:1, h:2 }, },
		bookcaseShNr: { position: 'wallEdge', size: { w:1, d:1, h:1 }, },
		bookcaseWide: { position: 'wallEdge', size: { w:2, d:1, h:2 }, },
		bookcaseShor: { position: 'wallEdge', size: { w:2, d:1, h:2 }, },
		// dresserShort: { position: 'wallEdge', size: { w:2, d:1, h:1 }, },
		// dresserTall: { position: 'wallEdge', size: { w:2, d:1, h:2 }, },
		chest: { position: 'wallEdge', size: { w:1, d:1, h:1 }, },
		pottedPlant: { position: 'wallEdge', size: { w:1, d:1, h:2 }, },
		candelabra: { position: 'wallEdge', size: { w:1, d:1, h:2 }, },
		gargoyle: { position: 'wallEdge', size: { w:1, d:1, h:2 }, },
		// grandfatherClock: { position: 'wallEdge', size: { w:1, d:1, h:2 }, },
		chair: { position: 'wallEdge', size: { w:1, d:1, h:1 }, },
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
			size: { w:2, d:2, h:1 },
			getChildren: () => {
				let dirs = scrambleArray(['n','e','s','w']);
				let ret = [{ item: 'chair', pos: dirs.pop() }];
				for (let i = 0; i < 3; i++) {
					if (rand() < 0.6) {
						ret.push({ item: 'chair', pos: dirs.pop() });
					}
				}
				return ret;
			},
		},
		diningTable3: {
			position: 'freeStanding',
			size: { w:4, d:1, h:1 },
			getChildren: () => {
				const missing = 0.05;
				return [ 'N1', 'N2', 'N3', 'S1', 'S2', 'S3', ].map(pos=>{
					return { item: rand() < missing ? 'EMPTY' :'chair', pos: pos };
				});
			},
		},
		diningTable4: {
			position: 'freeStanding',
			size: { w:3, d:1, h:1 },
			getChildren: () => {
				const missing = 0.05;
				return [ 'N1', 'N2', 'N3', 'N4', 'S1', 'S2', 'S3', 'S4', ].map(pos=>{
					return { item: rand() < missing ? 'EMPTY' :'chair', pos: pos };
				});
			},
		},
		endtable_primitive0: { position: 'freeStanding', size: { w:1, d:1, h:1 } },
	};

	const ROOMS = {
		livingRoom: [
			{ item: 'fireplace', count: 1},
			{ item: 'couchCenter', weight: 1},
			{ item: 'couch', weight: 1},
			{ item: 'armchair', weight: 2},
			{ item: 'squareTable', weight: 4},
			{ item: 'roundTable', weight: 4},
			{ item: 'bookcaseWide', weight: 1},
			{ item: 'bookcaseNarr', weight: 2},
		].concat(tallWallStuff).concat(everyRoomStuff),
		hallway: [
			{ item: 'chest', weight: 1},
			{ item: 'couch', weight: 1},
			{ item: 'armchair', weight: 2},
			{ item: 'bookcaseShor', weight: 3},
			{ item: 'bookcaseShNr', weight: 1},
			{ item: 'squareTable', weight: 4},
			{ item: 'roundTable', weight: 4},
			{ item: 'door', weight: 5},
		].concat(shortWallStuff).concat(everyRoomStuff),
		diningRoom: [
			getRandomDiningTable(),
			{ item: 'armchair', weight: 4},
		].concat(tallWallStuff).concat(everyRoomStuff),
		bedroom: [
			{ item: 'bed', count: 1},
			{ item: 'wardrobe', count: 1},
			{ item: 'fireplace', count: 1},
			{ item: 'chest', weight: 3},
			{ item: 'chair', weight: 2},
			{ item: 'armchair', weight: 1},
			{ item: 'squareTable', weight: 1},
			{ item: 'roundTable', weight: 1},
			{ item: 'bookcaseShNr', weight: 1},
			{ item: 'dresserShort', count: 1},
			{ item: 'dresserTall', count: 1},
			{ item: 'door', count: 1},
		].concat(shortWallStuff).concat(everyRoomStuff),
		library: [
			{ item: 'couchCenter', weight: 3},
			{ item: 'couch', weight: 1},
			{ item: 'armchair', weight: 2},
			{ item: 'squareTable', weight: 4},
			{ item: 'roundTable', weight: 4},
			{ item: 'bookcaseShor', weight: 3},
			{ item: 'bookcaseShNr', weight: 3},
			{ item: 'bookcaseWide', weight: 10},
			{ item: 'bookcaseNarr', weight: 3},
		].concat(shortWallStuff).concat(everyRoomStuff),
	};

	/* -------------- GET STUFF -------------- */

	const getFurnishings = roomName => {
		let furnishings = ROOMS[roomName];
		return {
			wallHanging: furnishings.filter(entry=>{
				return FURNISHINGS[entry.item]?.position === 'wallHanging';
			}),
			wallEdge: furnishings.filter(entry=>{
				return FURNISHINGS[entry.item]?.position === 'wallEdge';
			}),
			freeStanding: furnishings.filter(entry=>{
				return FURNISHINGS[entry.item]?.position === 'freeStanding';
			}),
		};
	};
	/*
	const getItemAndChildren = itemName => {
		let itemInfo = Object.assign({name: itemName}, FURNISHINGS[itemName]);
		if (!itemInfo.getChildren) {
			return {item: itemInfo};
		}
		let children = itemInfo.getChildren().filter(x=>x.item !== 'EMPTY');
		let coords = {};
		for (let y = 0; y < itemInfo.size.d; y++) {
			for (let x = 0; x < itemInfo.size.w; x++) {
				coords[`${x},${y}`] = 'A0';
			}
		}
		return {
			item: itemInfo,
			children
		};
	};
	*/

	const padWall = (wallArr) => {
		let ret = [];
		let prop = wallArr[0].y - wallArr[wallArr.length-1].y === 0 ? 'x' : 'y';
		wallArr.forEach(tile=>{
			[ -0.5, 0.5 ].forEach(margin=>{
				let insert = JSON.parse(JSON.stringify(tile));
				insert[prop] += margin;
				insert.name = insert.x+','+insert.y +':'+ insert.name.split(':')[1];
				ret.push(insert);
			});
		});
		return ret;
	};
	const getWalls = (floors) =>{
		let ret = {
			n: floors.filter(item=>item.name.includes('(w)')),
			w: floors.filter(item=>item.name.includes('(a)')),
			e: floors.filter(item=>item.name.includes('(d)')),
		};
		let q = floors.filter(item=>item.name.includes('(q)'));
		let e = floors.filter(item=>item.name.includes('(e)'));
		if (q.length) {
			ret[rand()<0.5?'n':'w'].push(q[0]);
		}
		if (e.length) {
			ret[rand()<0.5?'n':'e'].push(e[0]);
		}
		Object.keys(ret).forEach(wallDir=>{
			if (ret[wallDir] && ret[wallDir].length > 0) {
				ret[wallDir] = padWall(ret[wallDir]);
			}
			const adjustMap = {
				n: [0,-0.5],
				w: [-0.5,0],
				e: [0.5,0],
			};
			const adjust = adjustMap[wallDir];
			ret[wallDir].forEach(item=>{
				let rot = 0;
				if (wallDir === 'w') { rot = 3; }
				else if (wallDir === 'e') { rot = 1; }
				item.rot = rot;
				item.x+=adjust[0];
				item.y+=adjust[1];
			});
			ret[wallDir] = ret[wallDir].sort((a,b) => {
				return a.x - b.x; 
			}).sort((a,b) => {
				return a.y - b.y; 
			});
		});

		return ret;
	};
	
	////-----------------------------------------//
	/// ------- THE REST OF THE OWL???? ------- ///
	//-----------------------------------------////

	const insertItemIntoWall = (targetWall, insertWidth) => {
		if (insertWidth === targetWall.length) return { usedWall: targetWall, remainingWalls: [] };
		if (insertWidth > targetWall.length) return false;
		const targetWallIndex = randomIndex(targetWall.length);
		let wallIndices = [ targetWallIndex ];
		for (let i = 1; i < insertWidth; i++) {
			// grab a neighbor index
			let westHasGap = targetWall[wallIndices[0]-1];
			let eastHasGap = targetWall[wallIndices[wallIndices.length-1]+1];
			let go = null;
			if (!westHasGap) {
				go = 'east';
			} else if (!eastHasGap) {
				go = 'west';
			} else {
				go = rand() < 0.5 ? 'west' : 'east';
			}
			if (go==='west') {
				wallIndices.unshift(wallIndices[0]-1);
			} else if (go==='east') {
				wallIndices.push(wallIndices[wallIndices.length-1]+1);
			}
		}
		let workingWall = JSON.parse(JSON.stringify(targetWall));
		let splice = workingWall.splice(wallIndices[0], wallIndices.length);
		let remainingWalls = [];
		if (workingWall.length) {
			let right = workingWall.splice(0, wallIndices[0]);
			let left = workingWall;
			if (right.length > 0) { remainingWalls.push(right); }
			if (left.length > 0) { remainingWalls.push(left); }
		}
		return {
			usedWall: splice,
			remainingWalls,
		};
	};

	let rooms = mapInfo.rooms;
	Object.keys(rooms).forEach(roomName => {
		// getting room info for this room
		const roomType = rooms[roomName].name;
		const wallFurnishings = getFurnishings(roomType).wallEdge;
		let requiredWallFurnishings = wallFurnishings.filter(item=>item.count);
		const walls = getWalls(rooms[roomName].floors);
		let doodads = [];
		let remainingWalls = Object.values(walls);
		// while we can place more furniture...
		while (remainingWalls.length) {
			let insertName; // the type of object we want to place somewhere on the three walls
			if (requiredWallFurnishings.length) {
				let insertIndex = randomIndex(requiredWallFurnishings.length);
				let insertInfo = requiredWallFurnishings.splice(insertIndex,1);
				insertName = insertInfo[0].item;
				if (insertInfo.count > 1) {
					insertInfo.count -= 1;
					requiredWallFurnishings.push(JSON.parse(JSON.stringify(insertInfo)));
				}
			} else {
				insertName = getRandomWithWeight(wallFurnishings);
			}
			let compositeInsertInfo = Object.assign({name: insertName}, FURNISHINGS[insertName]);
			let insertWidth = compositeInsertInfo.size.w;
			let targetWallIndex = randomIndex(remainingWalls.length);
			let targetWall = remainingWalls.splice(targetWallIndex, 1)[0];
			let insertInfo = insertItemIntoWall(targetWall, insertWidth);
			if (!insertInfo) { continue; }
			doodads.push({
				wallTiles: insertInfo.usedWall,
				furniture: compositeInsertInfo,
			});
			remainingWalls = remainingWalls.concat(insertInfo.remainingWalls);
		}
		rooms[roomName].furnishings = doodads.map(doodad=> {
			const wallTiles = doodad.wallTiles;
			let x = wallTiles.reduce((acc,entry)=>acc+(entry?.x||0),0)/wallTiles.length;
			let y = wallTiles.reduce((acc,entry)=>acc+(entry?.y||0),0)/wallTiles.length;
			let wallType = wallTiles[0].name.split('(')[1][0];
			let rot = doodad.wallTiles[0].rot;
			if (rot === 0 && doodad.furniture.size.d === 2) { 
				y += 0.5;
			}
			if (rot === 1 && doodad.furniture.size.d === 2) { 
				x -= 0.5;
			}
			if (rot === 3 && doodad.furniture.size.d === 2) { 
				x += 0.5;
			}
			return {
				label: `${x},${y}:${doodad.furniture.name}-(${wallType})`,
				name: doodad.furniture.name,
				x,
				y,
				w: doodad.furniture.size.w,
				d: doodad.furniture.size.d,
				h: doodad.furniture.size.h,
				rot: rot,
				hasCandy: rand() < 0.3,
			};
		});
	});
	return Object.values(rooms);
};

// let seed = 1234;
// const mapWithRooms = makeRoomsWithSeed(seed);

// console.log(JSON.stringify(mapWithRooms, null, '\t'));
// console.log('breakme');