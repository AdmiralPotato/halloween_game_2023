import {
	rand,
	setSeed,
	randomIndex,
	randomFromArray,
	scrambleArray,
	XYRange,
	XYPair,
} from './utilities';
import {
	rotMap,
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
		let room = roomLineMap[leftRoomID];
		room = room[method](padWidth, ' ');
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
		const roomLine = roomLineMap[roomID];
		const roomInfo = roomWorkingData[roomID]
		const padToDepth = Math.max(roomInfo.depth, roomWorkingData[arr[(index + 1) % 2]].depth);
		const ret: string[] = [];
		for (let i = 0; i < padToDepth; i++) {
			ret.push(padToDepth - roomInfo.depth > i ? ' '.repeat(roomLine.length) : roomLine || '');
		}
		roomLinesArrayMap[roomID] = ret;
	});

	['d', 'c'].forEach((roomID, index, arr) => {
		const roomLine = roomLineMap[roomID];
		const roomInfo = roomWorkingData[roomID];
		const padToDepth = Math.max(roomInfo.depth, roomWorkingData[arr[(index + 1) % 2]].depth);
		const ret: string[] = [];
		const blank = ' '.repeat(roomLine.length);
		// blank lines, equally on top or bottom (randomly)
		let diffCount = padToDepth - roomInfo.depth;
		for (let i = 0; i < diffCount; i++) {
			const method = rand() < 0.5 ? 'push' : 'unshift';
			ret[method](blank);
		}
		// the actual lines
		for (let i = 0; i < roomInfo.depth; i++) {
			ret.push(roomLine);
		}
		roomLinesArrayMap[roomID] = ret;
	});

	['a'].forEach((roomID) => {
		const roomLine = roomLineMap[roomID];
		const roomInfo = roomWorkingData[roomID];
		const ret = [];
		for (let i = 0; i < roomInfo.depth; i++) {
			ret.push(roomLine);
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
	// quickie: make a door between hallway and entrance

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
	[bottomOfHallWayIndex, bottomOfHallWayIndex + 1].forEach((index) => {
		mapASCII[index] = mapASCII[index]
			.split('')
			.map((c, i) => {
				return doorIndex === i ? 'z' : c;
			})
			.join('');
	});

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
			mapASCII[firstDoorIndex] = mapASCII[firstDoorIndex].replace(left + 'b', 'zz');
			indicesR = indicesR.filter((n) => n !== firstDoorIndex);
			let secondDoorIndex = indicesR.length > 0 ? randomFromArray(indicesR) : firstDoorIndex;
			if (!secondDoorIndex) {
				throw new Error('secondDoorIndex failed to be a valid value!');
			}
			mapASCII[secondDoorIndex] = mapASCII[secondDoorIndex].replace('b' + right, 'zz');
		} else {
			let firstDoorIndex = randomFromArray(indicesR);
			if (!firstDoorIndex) {
				throw new Error('firstDoorIndex failed to be a valid value!');
			}
			mapASCII[firstDoorIndex] = mapASCII[firstDoorIndex].replace('b' + right, 'zz');
			indicesL = indicesL.filter((n) => n !== firstDoorIndex);
			let secondDoorIndex = indicesL.length > 0 ? randomFromArray(indicesL) : firstDoorIndex;
			if (!secondDoorIndex) {
				throw new Error('secondDoorIndex failed to be a valid value!');
			}
			mapASCII[secondDoorIndex] = mapASCII[secondDoorIndex].replace(left + 'b', 'zz');
		}
	});

	/* -------------- HALLWAY CLEANUP -------------- */

	// Trim hallway
	const topmostDoorIndex = mapASCII.findIndex((line) => line.includes('z'));
	for (let i = 0; i < topmostDoorIndex - 1; i++) {
		mapASCII[i] = mapASCII[i].replace(/b/g, ' ');
	}

	// Get hallway depth
	roomWorkingData.b.depth = mapASCII.filter((line) => line.includes('b')).length;

	/* -------------- CONVERT ROOMS TO REAL COORDINATE SPACE -------------- */

	const arrayDoubler = <T>(arr: T[]): T[] => {
		let ret: T[] = [];
		arr.forEach((item) => {
			ret.push(item);
			ret.push(item);
		});
		return ret;
	};
	let doubledMap = arrayDoubler(
		mapASCII.map((line) => {
			return arrayDoubler(line.split('')).join('');
		}),
	);

	// get real corner coords
	const getCornerCords = (roomID: string, mapArray: string[]): XYRange => {
		// only works for square rooms
		let coordsY: number[] = [];
		let coordsXset: Set<number> = new Set();
		mapArray.forEach((line, i) => {
			if (line.includes(roomID)) {
				coordsY.push(i);
				line.split('').forEach((c, x) => {
					if (c === roomID) {
						coordsXset.add(x);
					}
				});
			}
		});
		let coordsX: number[] = Array.from(coordsXset).sort((a, b) => a - b);
		return {
			x: { min: coordsX[0], max: coordsX.slice(-1)[0] },
			y: { min: coordsY[0], max: coordsY.slice(-1)[0] },
		};
	};
	Object.keys(roomWorkingData).forEach((roomID) => {
		roomWorkingData[roomID].width *= 2;
		roomWorkingData[roomID].depth *= 2;
		const corners = getCornerCords(roomID, doubledMap);
		roomWorkingData[roomID].cornerCoords = corners;
	});
	Object.keys(roomWorkingData).forEach((roomID) => {
		if (
			roomID === 'b' &&
			roomWorkingData.a.cornerCoords.y.min - roomWorkingData.b.cornerCoords.y.max === 3
		) {
			roomWorkingData.b.cornerCoords.y.max += 2;
		}
		let b = roomWorkingData.b;
		b.depth = b.cornerCoords.y.max - b.cornerCoords.y.min + 1;
		let corners = roomWorkingData[roomID].cornerCoords;
		roomWorkingData[roomID].x = corners.x.min + (corners.x.max - corners.x.min) / 2;
		roomWorkingData[roomID].y = corners.y.min + (corners.y.max - corners.y.min) / 2;
		let doorCoords: XYPair[] = [];
		for (let y = corners.y.min; y <= corners.y.max; y++) {
			for (let x = corners.x.min; x <= corners.x.max; x++) {
				// console.log(`${x}, ${y} = ${doubledMap[y][x]}`);
				if (doubledMap[y][x] === 'z') {
					doorCoords.push({ x, y });
				}
			}
		}
		roomWorkingData[roomID].doorCoords = doorCoords;
	});

	/* -------------- ASSIGN ROOMS THEIR PURPOSES -------------- */

	roomWorkingData.a.name = 'livingRoom';
	roomWorkingData.a.label = 'a';

	roomWorkingData.b.name = 'hallway';
	roomWorkingData.b.label = 'b';

	let remainder = scrambleArray(['bedroom', 'bedroom', 'library', 'diningRoom']);
	['c', 'd', 'e', 'f'].forEach((floorName, i) => {
		roomWorkingData[floorName].name = remainder[i];
		roomWorkingData[floorName].label = floorName;
	});

	/* -------------- FLOOR ARRAY FOR EACH ROOM -------------- */

	Object.keys(roomWorkingData).forEach((roomID) => {
		let corners = roomWorkingData[roomID].cornerCoords;
		let floorTiles: Tile[] = [];
		for (let y = corners.y.min; y <= corners.y.max; y += 2) {
			for (let x = corners.x.min; x <= corners.x.max; x += 2) {
				let value = 's';
				if (y === corners.y.min) {
					if (x === corners.x.min) {
						value = 'q';
					} else if (x === corners.x.max - 1) {
						value = 'e';
					} else {
						value = 'w';
					}
				} else {
					if (x === corners.x.min) {
						value = 'a';
					} else if (x === corners.x.max - 1) {
						value = 'd';
					}
				}
				let destination = '';
				let doorDir = '';
				if (doubledMap[y][x] === 'z') {
					if (roomID !== 'b') {
						destination = 'b';
						doorDir = roomID === 'a' ? 'down' : 'left-or-right';
					} else {
						if (x < roomWorkingData[roomID].x) {
							// walk left
							for (let i = corners.x.min; i >= 0; i--) {
								const checkedValue = doubledMap[y][i];
								if (/[^A-Z]/.test(checkedValue)) {
									destination = checkedValue;
								}
							}
						} else {
							// walk right
							for (let i = corners.x.max; i < totalMapWidth; i++) {
								const checkedValue = doubledMap[y][i];
								if (/[^A-Z]/.test(checkedValue)) {
									destination = checkedValue;
								}
							}
						}
					}
				}
				const tileInfo = rotMap[value];
				floorTiles.push({
					asset: tileInfo.asset || '',
					name: roomID + tileInfo.tile + '-' + tileInfo.variant + '-' + `(${value})`,
					x: x + 0.5,
					y: y + 0.5,
					rot: tileInfo.rot,
					destination,
					doorDir,
					wallDir: '',
				});
			}
		}
		roomWorkingData[roomID].floorTiles = floorTiles;
	});
	Object.keys(roomWorkingData).forEach((roomID) => {
		if (roomID !== 'b') {
			let doorCornerCoords = roomWorkingData[roomID].doorCoords;
			let compositeDoorCoords = [
				doorCornerCoords.reduce((acc, pair) => acc + pair.x, 0) / 4,
				doorCornerCoords.reduce((acc, pair) => acc + pair.y, 0) / 4,
			];
			if (roomID === 'a') {
				compositeDoorCoords[1] -= 2;
			} else {
				compositeDoorCoords[0] += roomID === 'c' || roomID === 'f' ? -2 : 2;
			}
			let bFloorTiles = roomWorkingData.b.floorTiles;
			let targetDoor = bFloorTiles.filter((item) => {
				return item.x === compositeDoorCoords[0] && item.y === compositeDoorCoords[1];
			})[0];
			targetDoor.destination = roomID;
			targetDoor.doorDir = roomID === 'a' ? 'up' : 'left-or-right';
		}
	});

	/* -------------- CLEANUP -------------- */

	Object.keys(roomWorkingData).forEach((roomID) => {
		const room = roomWorkingData[roomID];

		// all floor tiles now local coords
		room.floors = room.floorTiles.map((item) => {
			item.x -= room.x;
			item.y -= room.y;
			item.name = `${item.x},${item.y}:${item.name}`;
			return item;
		});

		// splitting floors and doors into floors and doors
		room.floors = room.floorTiles.filter((item) => !item.destination);
		room.doors = room.floorTiles.filter((item) => item.destination);
	});

	return {
		rooms: roomWorkingData,
		printMap: doubledMap.join('\n'),
	};
};

console.log(buildMapFromSeed('1234').printMap);
