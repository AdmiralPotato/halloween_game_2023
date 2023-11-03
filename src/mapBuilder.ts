import {
	rand,
	setSeed,
	randomIndex,
	randomFromArray,
	scrambleArray,
	XYRange,
	XYCoord,
	translateXY,
	compareXY,
	getCenterForXYRange,
	DIRECTIONS,
	scaleXY,
	getNFromDir
} from './utilities';
import {
	ROOMS,
	buildRoom,
	RoomWorkingData,
	Tile,
} from './rooms';

////---------------------------------------------------------//
///---------------------- THE OWL???? ----------------------///
//---------------------------------------------------------////

export const buildMapFromSeed = (seed: string) => {
	setSeed(seed);

	/* -------------- GET SIZES -------------- */

	const roomWorkingData: Record<string, RoomWorkingData> = {};

	Object.keys(ROOMS).forEach(roomID => {
		roomWorkingData[roomID] = buildRoom(roomID);
	});

	/* -------------- HORIZONTAL ASCII -------------- */

	const roomLineMap: Record<string, string> = {};

	// making the default ASCII row for each room
	Object.entries(roomWorkingData).forEach(([roomID, entry]) => {
		roomLineMap[roomID] = roomID.repeat(entry.width);
	});
	// align the leftmost rooms to the right, and the rightmost rooms to the left
	const padRoomToAlignOn = (leftRoomID: string, rightRoomID: string, alignmentDir: string) => {
		const padWidth = roomLineMap[rightRoomID].length;
		const method = alignmentDir === 'right' ? 'padStart' : 'padEnd';
		let line = roomLineMap[leftRoomID];
		roomLineMap[leftRoomID] = line[method](padWidth, ' ');
	};
	padRoomToAlignOn('e', 'd', 'right');
	padRoomToAlignOn('d', 'e', 'right');
	padRoomToAlignOn('c', 'f', 'left');
	padRoomToAlignOn('f', 'c', 'left');

	// padding the central room horizontally with the rest

	const totalMapWidth =
		roomLineMap.e.length + // one of the leftmost rooms
		roomLineMap.f.length + // one of the rightmost rooms
		roomLineMap.b.length; // hallway

	const padLineToWidth = (r: string, width: number) => {
		const room = roomLineMap[r];
		const diff = Math.max(width - room.length, 0);
		const padCount = Math.floor(diff / 2);
		let ret = ' '.repeat(padCount) + room + ' '.repeat(padCount);
		const method = randomIndex(2) === 0 ? 'padEnd' : 'padStart';
		ret = ret[method](1, ' ');
		return ret;
	};
	roomLineMap.a = padLineToWidth('a', totalMapWidth);

	/* -------------- VERTICAL ASCII -------------- */

	const roomLinesArrayMap: Record<string, string[]> = {};

	['e', 'f'].forEach((roomID, index, arr) => {
		const line = roomLineMap[roomID];
		const roomInfo = roomWorkingData[roomID]
		const maxSize = Math.max(roomInfo.depth, roomWorkingData[arr[(index + 1) % 2]].depth);
		const ret: string[] = [];
		for (let i = 0; i < maxSize; i++) {
			ret.push(maxSize - roomInfo.depth > i ? ' '.repeat(line.length) : line || '');
		}
		roomLinesArrayMap[roomID] = ret;
	});

	['d', 'c'].forEach((roomID, index, arr) => {
		const line = roomLineMap[roomID];
		const roomInfo = roomWorkingData[roomID];
		const maxSize = Math.max(roomInfo.depth, roomWorkingData[arr[(index + 1) % 2]].depth);
		const ret: string[] = [];
		const blank = ' '.repeat(line.length);
		// blank lines, equally on top or bottom (randomly)
		let diff = maxSize - roomInfo.depth;
		// the actual lines
		for (let i = 0; i < roomInfo.depth; i++) {
			ret.push(line);
		}
		for (let i = 0; i < diff; i++) {
			const method = rand() < 0.5 ? 'push' : 'unshift';
			ret[method](blank);
		}
		roomLinesArrayMap[roomID] = ret;
	});

	['a'].forEach((roomID) => {
		const line = roomLineMap[roomID];
		const roomInfo = roomWorkingData[roomID];
		const ret = [];
		for (let i = 0; i < roomInfo.depth; i++) {
			ret.push(line);
		}
		roomLinesArrayMap[roomID] = ret;
	});

	const mapASCII: string[] = [];

	for (let i = 0; i < roomLinesArrayMap.e.length; i++) {
		mapASCII.push(
			roomLinesArrayMap.e[i] + roomLineMap.b + roomLinesArrayMap.f[i],
		);
	}

	for (let i = 0; i < (roomLinesArrayMap.d || []).length; i++) {
		mapASCII.push(
			(roomLinesArrayMap.d || [])[i] +
			roomLineMap.b +
			(roomLinesArrayMap.c || [])[i],
		);
	}
	// quickie: make a door between hallway and living room (entrance)

	// find horiz coordinate
	let bottommostRow = mapASCII[mapASCII.length - 1].split('');
	let topOfLivingRoom = roomLineMap.a.split('');
	let potentialDoorIndices: number[] = [];
	bottommostRow.forEach((c, i) => {
		if (c == 'b' && topOfLivingRoom[i] !== ' ') {
			potentialDoorIndices.push(i);
		}
	});
	if (potentialDoorIndices.length > 3) {
		potentialDoorIndices.pop();
		potentialDoorIndices.shift();
	}
	let doorIndex = randomFromArray(potentialDoorIndices);

	// for later
	let bottomOfHallWayIndex = mapASCII.length - 1;

	// put in front room
	for (let i = 0; i < roomLinesArrayMap.a.length; i++) {
		mapASCII.push(roomLinesArrayMap.a[i]);
	}
	// it's later now
	mapASCII[bottomOfHallWayIndex] = mapASCII[bottomOfHallWayIndex]
		.split('')
		.map((c, i) => {
			return doorIndex === i ? 'B' : c;
		})
		.join('');
	mapASCII[bottomOfHallWayIndex + 1] = mapASCII[bottomOfHallWayIndex + 1]
		.split('')
		.map((c, i) => {
			return doorIndex === i ? 'A' : c;
		})
		.join('');

	/* -------------- ADD DOORS -------------- */

	const getRowsWithPotentialDoor = (r1: string, r2: string): number[] => {
		return mapASCII
			.map((line, i) => {
				return line.includes(r1 + r2) ? i : -Infinity; // ~null
			})
			.filter((i) => i !== -Infinity);
	};

	['ef', 'dc'].forEach((pair) => {
		const [left, right] = pair.split('');
		let indicesL = getRowsWithPotentialDoor(left, 'b');
		let indicesR = getRowsWithPotentialDoor('b', right);
		[indicesL, indicesR].forEach((list) => {
			if (list.length >= 3) {
				list.pop(), list.shift();
			}
		});
		if (indicesL.length <= indicesR.length) {
			let firstDoorIndex = randomFromArray(indicesL);
			if (!firstDoorIndex) {
				throw new Error('firstDoorIndex failed to be a valid value!');
			}
			mapASCII[firstDoorIndex] = mapASCII[firstDoorIndex].replace(left + 'b', left.toUpperCase() + 'B');
			indicesR = indicesR.filter((n) => n !== firstDoorIndex);
			let secondDoorIndex = indicesR.length > 0 ? randomFromArray(indicesR) : firstDoorIndex;
			if (!secondDoorIndex) {
				throw new Error('secondDoorIndex failed to be a valid value!');
			}
			mapASCII[secondDoorIndex] = mapASCII[secondDoorIndex].replace('b' + right, 'B' + right.toUpperCase());
		} else {
			let firstDoorIndex = randomFromArray(indicesR);
			if (!firstDoorIndex) {
				throw new Error('firstDoorIndex failed to be a valid value!');
			}
			mapASCII[firstDoorIndex] = mapASCII[firstDoorIndex].replace('b' + right, 'B' + right.toUpperCase());
			indicesL = indicesL.filter((n) => n !== firstDoorIndex);
			let secondDoorIndex = indicesL.length > 0 ? randomFromArray(indicesL) : firstDoorIndex;
			if (!secondDoorIndex) {
				throw new Error('secondDoorIndex failed to be a valid value!');
			}
			mapASCII[secondDoorIndex] = mapASCII[secondDoorIndex].replace(left + 'b', left.toUpperCase() + 'B');
		}
	});

	/* -------------- HALLWAY CLEANUP -------------- */

	// Trim hallway
	const topmostDoorIndex = mapASCII.findIndex((line) => /[A-Z]/.test(line));
	for (let i = 0; i < topmostDoorIndex - 1; i++) {
		mapASCII[i] = mapASCII[i].replace(/b/g, ' ');
	}

	// Get hallway depth
	roomWorkingData.b.depth = mapASCII.filter((line) => line.includes('b') || line.includes('B')).length;

	/* -------------- CONVERT ROOMS TO REAL COORDINATE SPACE -------------- */

	// get corners of each room
	const roomCorners: Record<string, XYRange> = {};
	Object.keys(ROOMS).forEach(roomID => {
		// only works for square rooms
		let topLeft: XYCoord = { x: NaN, y: NaN };
		let bottomRight: XYCoord = { x: NaN, y: NaN };
		y: for (let y = 0; y < mapASCII.length - 1; y++) {
			for (let x = 0; x < mapASCII[0].length - 1; x++) {
				if (mapASCII[y][x]?.toLowerCase() === roomID) {
					topLeft = { x, y };
					break y;
				}
			}
		}
		x: for (let y = mapASCII.length - 1; y >= 0; y--) {
			for (let x = mapASCII[0].length - 1; x >= 0; x--) {
				if (mapASCII[y][x]?.toLowerCase() === roomID) {
					bottomRight = { x, y };
					break x;
				}
			}
		}
		roomCorners[roomID] = {
			x: { min: topLeft.x, max: bottomRight.x },
			y: { min: topLeft.y, max: bottomRight.y },
		}
	});

	// wall vs floor information

	interface Edge {
		roomID: string,
		pos: XYCoord,
		wallDirs: string[],
		isDoor: boolean,
		compositeInfo: string,
	}
	const compositeInfoMap: Record<string, string> = {
		'nw': 'q',
		'w': 'a',
		'sw': 'z',
		's': 'x',
		'es': 'c',
		'e': 'd',
		'en': 'e',
		'n': 'w',
	}
	let roomTileEdges: Edge[] = []; // non doubled! not offset!
	Object.keys(roomCorners).forEach(roomID => {
		let tiles: Edge[] = [];
		let range = roomCorners[roomID];
		for (let y = range.y.min; y <= range.y.max; y++) {
			for (let x = range.x.min; x <= range.x.max; x++) {
				let isDoor = /[A-Z]/.test(mapASCII[y][x]);
				let edge: Edge = {
					roomID,
					pos: { x, y },
					wallDirs: [],
					isDoor: isDoor,
					compositeInfo: 's'
				}
				if (x === range.x.min) {
					edge.wallDirs.push('w');
				} else if (x === range.x.max) {
					edge.wallDirs.push('e');
				}
				if (y === range.y.min) {
					edge.wallDirs.push('n');
				} else if (y === range.y.max) {
					edge.wallDirs.push('s');
				}
				let char = compositeInfoMap[edge.wallDirs.sort().join('')] || 's';
				edge.compositeInfo = isDoor ? char.toUpperCase() : char;
				roomTileEdges.push(edge);
			}
			roomTileEdges = roomTileEdges.concat(tiles);
		}
	});

	const SCALE = 2;
	// doubling the coordinates now
	roomTileEdges = roomTileEdges.map(tile => {
		tile.pos.x *= SCALE;
		tile.pos.y *= SCALE;
		return tile;
	})
	Object.keys(roomWorkingData).forEach((roomID) => {
		roomWorkingData[roomID].width *= SCALE;
		roomWorkingData[roomID].depth *= SCALE;
	});
	Object.keys(roomCorners).forEach(roomID => {
		roomCorners[roomID].x.min *= SCALE;
		roomCorners[roomID].y.min *= SCALE;
		roomCorners[roomID].x.max *= SCALE;
		roomCorners[roomID].y.max *= SCALE;
	});

	// getting the door info
	const roomDoors: DoorInfo[] = [];
	interface DoorInfo {
		roomID: string,
		pos: XYCoord,
		doorDir: string,
		wallDirs: string[],
		destination: string,
		compositeInfo: string,
	}
	const mysteryDoors = roomTileEdges.filter(entry => entry.isDoor);
	mysteryDoors.forEach((mysteryDoor) => {
		let possibleCounterparts = roomTileEdges
			.filter(testTile => testTile.isDoor)
			.filter(testTile => testTile.roomID !== mysteryDoor.roomID);
		let translationMap: Record<string, XYCoord> = {
			n: { x: 0, y: -SCALE },
			e: { x: SCALE, y: 0 },
			s: { x: 0, y: SCALE },
			w: { x: -SCALE, y: 0 },
		}
		Object.keys(translationMap).forEach(dir => {
			let translation = translationMap[dir];
			let testCoords = translateXY(mysteryDoor.pos, translation);
			for (let i = 0; i < possibleCounterparts.length; i++) {
				if (compareXY(testCoords, possibleCounterparts[i].pos)) {
					let remainingWallDirs: string[] = [];
					mysteryDoor.wallDirs
						.filter(wallDir => wallDir !== dir)
						.forEach(remainingDir => {
							remainingWallDirs.push(remainingDir);
						})
					roomDoors.push({
						roomID: mysteryDoor.roomID,
						pos: mysteryDoor.pos,
						doorDir: dir,
						wallDirs: remainingWallDirs,
						destination: possibleCounterparts[i].roomID,
						compositeInfo: mysteryDoor.compositeInfo,
					});
					break;
				}
			}
		});
	});

	// getting it ready to hand off
	const tileAssets = {
		door: 'doorway',
		wall: 'wall',
		floor: 'floor',
	}
	Object.keys(roomWorkingData).forEach((roomID) => {
		let workingRoomTileEdges = roomTileEdges
			.filter(tile => tile.roomID === roomID);
		let floorTiles: Tile[] = [];
		let doorTiles: Tile[] = [];
		const calculateWallDir = (string: string) => {
			return getNFromDir(string);
		};
		//floors
		workingRoomTileEdges
			.forEach((tileInfo: Edge) => {
				let name = roomID + ':' + tileInfo.pos.x + ',' + tileInfo.pos.y + ':floor' + '(' + tileInfo.compositeInfo + ')'
				floorTiles.push({
					name,
					type: 'floor',
					asset: tileAssets.floor,
					x: tileInfo.pos.x,
					y: tileInfo.pos.y,
					rot: 0,
					destination: '',
					wallDir: '',
					compositeInfo: tileInfo.compositeInfo,
					roomID,
				});
			});
		// walls
		workingRoomTileEdges
			.filter(tile => !tile.isDoor)
			.forEach((tileInfo: Edge) => {
				tileInfo.wallDirs.forEach(dir => {
					let name = roomID + ':' + tileInfo.pos.x + ',' + tileInfo.pos.y + ':wall-' + dir + '(' + tileInfo.compositeInfo + ')'
					floorTiles.push({
						name,
						type: 'wall',
						asset: tileAssets.wall,
						x: tileInfo.pos.x,
						y: tileInfo.pos.y,
						rot: calculateWallDir(dir),
						destination: '',
						wallDir: '',
						compositeInfo: tileInfo.compositeInfo,
						roomID,
					});
				});
			});
		//doors
		roomDoors.forEach(tileInfo => {
			let name = roomID + ':' + tileInfo.pos.x + ',' + tileInfo.pos.y + ':door' + '(' + tileInfo.compositeInfo + ')'
			doorTiles.push({
				name,
				asset: '',
				type: 'door',
				x: tileInfo.pos.x,
				y: tileInfo.pos.y,
				rot: calculateWallDir(tileInfo.doorDir),
				destination: tileInfo.destination,
				wallDir: '',
				compositeInfo: tileInfo.compositeInfo,
				roomID,
			});
			tileInfo.wallDirs.forEach(dir => {
				let name = roomID + ':' + tileInfo.pos.x + ',' + tileInfo.pos.y + ':wallForCornerDoor' + '(' + tileInfo.compositeInfo + ')'
				floorTiles.push({
					name,
					type: 'wall',
					asset: tileAssets.wall,
					x: tileInfo.pos.x,
					y: tileInfo.pos.y,
					rot: calculateWallDir(dir),
					destination: '',
					wallDir: '',
					compositeInfo: tileInfo.compositeInfo,
					roomID,
				});
			});
		});
		roomWorkingData[roomID].floors = floorTiles;
		roomWorkingData[roomID].doors = doorTiles;
	});

	const arrayDoubler = <T>(arr: T[]): T[] => {
		let ret: T[] = [];
		arr.forEach((t) => {
			ret.push(t);
			ret.push(t);
		});
		return ret;
	};
	let doubledMap = arrayDoubler(
		mapASCII.map((line) => {
			return arrayDoubler(line.split('')).join('');
		}),
	);

	// make room coordinate space local to the room
	Object.keys(roomWorkingData).forEach((roomID) => {
		let room = roomWorkingData[roomID];
		let roomCenter = getCenterForXYRange(roomCorners[roomID]);
		room.x = roomCenter.x;
		room.y = roomCenter.y;
		room.floors = room.floors.map((item) => {
			item.x -= room.x;
			item.y -= room.y;
			// item.name = `${item.x},${item.y}:${item.name}`;
			return item;
		}).filter(item => !(item.rot === 2));
		room.doors = room.doors.map((item) => {
			item.x -= room.x;
			item.y -= room.y;
			// item.name = `${item.x},${item.y}:${item.name}`;
			return item;
		}).filter(item => !(item.rot === 2));

	});

	/* -------------- ASSIGN ROOMS THEIR PURPOSES -------------- */

	roomWorkingData.a.name = 'livingRoom';
	roomWorkingData.b.name = 'hallway';
	let remainder = scrambleArray(['bedroom', 'bedroom', 'library', 'diningRoom']);
	['c', 'd', 'e', 'f'].forEach((roomID, i) => {
		roomWorkingData[roomID].name = remainder[i];
	});

	return {
		rooms: roomWorkingData,
		printMap: doubledMap.map(line => line.split('').reverse().join('')).join('\n'),
	};
};

console.log(buildMapFromSeed('bob').printMap);
