import seedrandom from 'seedrandom';

/* -------------- SPECIFICATIONS -------------- */

// NOTE: rooms will probably break if less than 2
const normalWidth = [ 4, 7 ]; // these are ranges (min, max)
const normalDepth = [ 3, 4 ];
const hallWidth = [ 2, 2 ];
const entranceWidth = [ 6, 9 ];
const entranceDepth = [ 4, 6 ];

////---------------------------------------------------------//
///---------------------- THE OWL???? ----------------------///
//---------------------------------------------------------////

export const buildMapFromSeed = (seed) => {
	let rand = seedrandom(seed);

	/* -------------- UTILITY -------------- */

	const randomIndex = (max) => {
		return Math.floor(rand() * max);
	};
	const randomFromRange = (min, max) => {
		const variation = randomIndex(max - min + 1);
		return variation + min;
	};
	const getRandomSize = (width, depth) => { // width first
		return {
			width: randomFromRange(...width),
			depth: randomFromRange(...depth),
		};
	};
	const randomFromArray = (array) => {
		if (array.length === 0) return null;
		const i = randomIndex(array.length);
		return array[i];
	};
	const scrambleArray = (arr) => {
		const ret = [];
		let workingArr = arr.slice();
		while (workingArr.length) {
			let i = randomIndex(workingArr.length);
			ret.push(workingArr.splice(i, 1)[0]);
		}
		return ret;
	};

	/* -------------- GET SIZES -------------- */

	const mapFloorPlanInfo = {
		// four normal rooms
		e: getRandomSize(normalWidth, normalDepth),
		f: getRandomSize(normalWidth, normalDepth),
		c: getRandomSize(normalWidth, normalDepth),
		d: getRandomSize(normalWidth, normalDepth),
		// hallway
		b: { width: randomFromRange(...hallWidth) }, // depth is procedural
		a: getRandomSize(entranceWidth, entranceDepth),
	};

	/* -------------- HORIZONTAL ASCII -------------- */
	
	// making the default ASCII row for each room
	Object.entries(mapFloorPlanInfo).forEach(([key,entry])=>{
		mapFloorPlanInfo[key].line = key.repeat(entry.width);
	});
	// align the leftmost rooms to the right, and the rightmost rooms to the left
	const padRoomToAlignOn = (r1, r2, side) => {
		const room = mapFloorPlanInfo[r1];
		const padWidth = mapFloorPlanInfo[r2].width;
		const method = side === 'right' ? 'padStart' : 'padEnd';
		room.line = room.line[method](padWidth, ' ');
	};
	padRoomToAlignOn('e', 'd', 'right');
	padRoomToAlignOn('d', 'e', 'right');
	padRoomToAlignOn('c', 'f', 'left');
	padRoomToAlignOn('f', 'c', 'left');

	// padding the central room horizontally with the rest

	const totalMapWidth = mapFloorPlanInfo.e.line.length // one of the leftmost rooms
	+ mapFloorPlanInfo.f.line.length // one of the rightmost rooms
	+ mapFloorPlanInfo.b.line.length; // hallway

	const padLineToWidth = (r, width) => {
		const room = mapFloorPlanInfo[r];
		const diff = Math.max(width - room.width, 0);
		const padCount = Math.floor(diff/2);
		let ret = ' '.repeat(padCount) + room.line + ' '.repeat(padCount);
		const method = randomIndex(2) === 0 ? 'padEnd' : 'padStart';
		ret = ret[method](1, ' ');
		return ret;
	};
	mapFloorPlanInfo.a.line = padLineToWidth('a', totalMapWidth);

	/* -------------- VERTICAL ASCII -------------- */

	['e','f'].forEach((roomName, index, arr) => {
		const room = mapFloorPlanInfo[roomName];
		const padToDepth = Math.max(
			room.depth,
			mapFloorPlanInfo[arr[(index+1)%2]].depth
		);
		const ret = [];
		for (let i = 0; i < padToDepth; i++) {
			ret.push(
				padToDepth - room.depth > i ? ' '.repeat(room.line.length) : room.line
			);
		}
		room.lines = ret;
	});

	['d','c'].forEach((roomName, index, arr) => {
		const room = mapFloorPlanInfo[roomName];
		const padToDepth = Math.max(
			room.depth,
			mapFloorPlanInfo[arr[(index+1)%2]].depth
		);
		const ret = [];
		const blank = ' '.repeat(room.line.length);
		// blank lines, equally on top or bottom (randomly)
		let diffCount = padToDepth - room.depth;
		for (let i = 0; i < diffCount; i++) {
			const method = rand() < 0.5 ? 'push' : 'unshift';
			ret[method](blank);
		}
		// the actual lines
		for (let i = 0; i < room.depth; i++) {
			ret.push(room.line);
		}
		room.lines = ret;
	});

	['a'].forEach((roomName) => {
		const room = mapFloorPlanInfo[roomName];
		const ret = [];
		for (let i = 0; i < room.depth; i++) {
			ret.push(room.line);
		}
		room.lines = ret;
	});

	const mapASCII = [];

	for (let i = 0; i < mapFloorPlanInfo.e.lines.length; i++) {
		mapASCII.push(
			mapFloorPlanInfo.e.lines[i]
		+ mapFloorPlanInfo.b.line
		+ mapFloorPlanInfo.f.lines[i]
		);
	}

	for (let i = 0; i < mapFloorPlanInfo.d.lines.length; i++) {
		mapASCII.push(
			mapFloorPlanInfo.d.lines[i]
		+ mapFloorPlanInfo.b.line
		+ mapFloorPlanInfo.c.lines[i]
		);
	}
	// quickie: make a door between hallway and entrance

	// find horiz coordinate
	let bottommostRow = mapASCII[mapASCII.length-1].split('');
	let topOfLivingRoom = mapFloorPlanInfo.a.line.split('');
	let potentialDoorIndices = [];
	bottommostRow.forEach((c,i)=>{
		if (c=='b' && topOfLivingRoom[i]!==' ') { potentialDoorIndices.push(i); }
	});
	if (potentialDoorIndices.length > 3) {
		potentialDoorIndices.pop();
		potentialDoorIndices.shift();
	}
	let doorIndex = randomFromArray(potentialDoorIndices);

	// for later
	let bottomOfHallWayIndex = mapASCII.length-1;

	// put in front room
	for (let i = 0; i < mapFloorPlanInfo.a.lines.length; i++) {
		mapASCII.push(mapFloorPlanInfo.a.lines[i]);
	}
	// it's later now
	[bottomOfHallWayIndex, bottomOfHallWayIndex+1].forEach(index=>{
		mapASCII[index] = mapASCII[index].split('').map((c,i)=>{
			return doorIndex === i ? 'z' : c;
		}).join('');
	});

	/* -------------- ADD DOORS -------------- */

	const getRowsWithPotentialDoor = (r1, r2) => {
		return mapASCII.map((line, i)=>{
			return line.includes(r1+r2) ? i : null;
		}).filter(i=>i!==null);
	};

	['ef','dc'].forEach(pair=>{
		const [left, right] = pair.split('');
		let indicesL = getRowsWithPotentialDoor(left, 'b');
		let indicesR = getRowsWithPotentialDoor('b', right);
		[indicesL, indicesR].forEach(list=> {
			if (list.length >= 3) { list.pop(), list.shift(); }
		});
		if (indicesL.length <= indicesR.length) {
			let firstDoorIndex = randomFromArray(indicesL);
			mapASCII[firstDoorIndex] = mapASCII[firstDoorIndex].replace(left+'b', 'zz');
			indicesR = indicesR.filter(n=>n!==firstDoorIndex);
			let secondDoorIndex = indicesR.length > 0 ? randomFromArray(indicesR) : firstDoorIndex;
			mapASCII[secondDoorIndex] = mapASCII[secondDoorIndex].replace('b'+right, 'zz');
		} else {
			let firstDoorIndex = randomFromArray(indicesR);
			mapASCII[firstDoorIndex] = mapASCII[firstDoorIndex].replace('b'+right, 'zz');
			indicesL = indicesL.filter(n=>n!==firstDoorIndex);
			let secondDoorIndex = indicesL.length > 0 ? randomFromArray(indicesL) : firstDoorIndex;
			mapASCII[secondDoorIndex] = mapASCII[secondDoorIndex].replace(left+'b', 'zz');
		}
	});

	/* -------------- HALLWAY CLEANUP -------------- */

	// Trim hallway
	const topmostDoorIndex = mapASCII.findIndex(line=>line.includes('z'));
	for (let i = 0; i < topmostDoorIndex - 1; i++) {
		mapASCII[i] = mapASCII[i].replace(/b/g,' ');
	}

	// Get hallway depth
	mapFloorPlanInfo.b.depth = mapASCII.filter(line=>line.includes('b')).length;

	/* -------------- CONVERT ROOMS TO REAL COORDINATE SPACE -------------- */
	
	const arrayDoubler = arr =>{
		let ret = [];
		arr.forEach(item=>{ret.push(item); ret.push(item);});
		return ret;
	};
	let doubledMap = arrayDoubler(mapASCII.map(line=>{
		return arrayDoubler(line.split('')).join('');
	}));

	// get real corner coords
	const getCornerCords = (roomName, mapArray) => { // only works for square rooms
		let coordsY = [];
		let coordsX = new Set();
		mapArray.forEach((line,i)=>{
			if (line.includes(roomName)) {
				coordsY.push(i);
				line.split('').forEach((c,x)=>{
					if (c===roomName) { coordsX.add(x); }
				});
			}
		});
		coordsX = Array.from(coordsX).sort((a,b)=>a-b);
		return {
			x: [ coordsX[0], coordsX.slice(-1)[0] ],
			y: [ coordsY[0], coordsY.slice(-1)[0] ],
		};
	};
	Object.keys(mapFloorPlanInfo).forEach(roomName=>{
		['width','depth'].forEach(prop=>{ // double sizes
			mapFloorPlanInfo[roomName][prop] *= 2;
		});
		const corners = getCornerCords(roomName, doubledMap);
		mapFloorPlanInfo[roomName].cornerCoords = corners;
		
	});
	Object.keys(mapFloorPlanInfo).forEach(roomName=>{
		if (
			roomName === 'b'
			&& mapFloorPlanInfo.a.cornerCoords.y[0] - mapFloorPlanInfo.b.cornerCoords.y[1] === 3
		) {
			mapFloorPlanInfo.b.cornerCoords.y[1] += 2;
		}
		let b = mapFloorPlanInfo.b;
		b.depth = b.cornerCoords.y[1] - b.cornerCoords.y[0] + 1;
		let corners = mapFloorPlanInfo[roomName].cornerCoords;
		mapFloorPlanInfo[roomName].x = corners.x[0] + (corners.x[1] - corners.x[0]) / 2;
		mapFloorPlanInfo[roomName].y = corners.y[0] + (corners.y[1] - corners.y[0]) / 2;
		let doorCoords = [];
		for (let y = corners.y[0]; y <= corners.y[1]; y++) {
			for (let x = corners.x[0]; x <= corners.x[1]; x++) {
				// console.log(`${x}, ${y} = ${doubledMap[y][x]}`);
				if (doubledMap[y][x] === 'z') {
					doorCoords.push([x, y]);
				}
			}
		}
		mapFloorPlanInfo[roomName].doorCoords = doorCoords;
	});

	/* -------------- ASSIGN ROOMS THEIR PURPOSES -------------- */

	mapFloorPlanInfo.a.name = 'livingRoom';
	mapFloorPlanInfo.a.label = 'a';
	
	mapFloorPlanInfo.b.name = 'hallway';
	mapFloorPlanInfo.b.label = 'b';

	let remainder = scrambleArray([
		'bedroom',
		'bedroom',
		'library',
		'diningRoom',
	]);
	['c','d','e','f'].forEach((floorName,i)=>{
		mapFloorPlanInfo[floorName].name = remainder[i];
		mapFloorPlanInfo[floorName].label = floorName;
	});

	/* -------------- FLOOR ARRAY FOR EACH ROOM -------------- */

	const rotMap = {
		a: { tile: 'wall', variant: 'edge', rot: 3, asset: 'wall_00' },
		q: { tile: 'wall', variant: 'corner', rot: 0 },
		w: { tile: 'wall', variant: 'edge', rot: 0, asset: 'wall_00' },
		e: { tile: 'wall', variant: 'corner', rot: 1 },
		d: { tile: 'wall', variant: 'edge', rot: 1, asset: 'wall_00' },
		s: { tile: 'wall', variant: 'floor', rot: 0, asset: 'floor_00.001' },

		A: { tile: 'door', variant: 'edge', rot: 3 },
		Q: { tile: 'door', variant: 'corner', rot: null },
		W: { tile: 'door', variant: 'edge', rot: 0 },
		E: { tile: 'door', variant: 'corner', rot: null },
		D: { tile: 'door', variant: 'edge', rot: 1 },
		S: { tile: 'door', variant: 'floor', rot: 0 },
	};

	Object.keys(mapFloorPlanInfo).forEach(roomName=>{
		let corners = mapFloorPlanInfo[roomName].cornerCoords;
		let floorTiles = [];
		for (let y = corners.y[0]; y <= corners.y[1]; y+=2) {
			for (let x = corners.x[0]; x <= corners.x[1]; x+=2) {
				let value = 's';
				if (y===corners.y[0]) {
					if (x===corners.x[0]) { value = 'q'; }
					else if (x===corners.x[1] - 1) { value = 'e'; }
					else { value = 'w'; }
				} else {
					if (x===corners.x[0]) { value = 'a'; }
					else if (x===corners.x[1] - 1) { value = 'd'; }
				}
				let destination = undefined;
				let doorDir = undefined;
				if (doubledMap[y][x] === 'z') {
					value = value.toUpperCase();
					if (roomName !== 'b') {
						destination = 'b';
						doorDir = roomName === 'a' ? 'down' : 'left-or-right';
					} else {
						if ( x < mapFloorPlanInfo.x) { // walk left
							for (let i = corners.x[0]; i >= 0; i--) {
								const checkedValue = doubledMap[y][i];
								if (/[^A-Z]/.test(checkedValue)) {
									destination = checkedValue;
								}
							}
						} else { // walk right
							for (let i = corners.x[1]; i < totalMapWidth; i++) {
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
					name: roomName
						+ tileInfo.tile + '-'
						+ tileInfo.variant +'-'+
						`(${value})`,
					x: x+0.5,
					y: y+0.5,
					rot: tileInfo.rot,
					destination,
					doorDir,
				});
			}
		}
		mapFloorPlanInfo[roomName].floorTiles = floorTiles;
	});
	Object.keys(mapFloorPlanInfo).forEach(roomName=>{
		if (roomName !== 'b') {
			let doorCornerCoords = mapFloorPlanInfo[roomName].doorCoords;
			let compositeDoorCoords = [
				doorCornerCoords.reduce((acc,pair)=>acc+pair[0], 0)/4,
				doorCornerCoords.reduce((acc,pair)=>acc+pair[1], 0)/4
			];
			if (roomName === 'a') {
				compositeDoorCoords[1] -= 2;
			} else {
				compositeDoorCoords[0] += roomName==='c' || roomName==='f' ? -2 : 2;
			}
			let bFloorTiles = mapFloorPlanInfo.b.floorTiles;
			let targetDoor = bFloorTiles.filter(item=>{
				return item.x === compositeDoorCoords[0]
				&& item.y === compositeDoorCoords[1];
			})[0];
			targetDoor.destination = roomName;
			targetDoor.doorDir = roomName === 'a' ? 'up' : 'left-or-right';
		}
	});

	/* -------------- CLEANUP -------------- */

	Object.keys(mapFloorPlanInfo).forEach(roomName=>{
		const room = mapFloorPlanInfo[roomName];

		// all floor tiles now local coords
		room.floors = room.floorTiles.map(item=>{
			item.x -= room.x;
			item.y -= room.y;
			item.name = `${item.x},${item.y}:${item.name}`;
			return item;
		});

		// splitting floors and doors into floors and doors
		room.floors = room.floorTiles.filter(item=>!item.destination);
		room.doors = room.floorTiles.filter(item=>item.destination);

		// remove properties no one wants anymore
		delete room.floorTiles;
		delete room.line;
		delete room.lines;
		delete room.cornerCoords;
		delete room.doorCoords;
	});

	return {
		rooms: mapFloorPlanInfo,
		printMap: doubledMap.join('\n'),
	};
};

// console.log(buildMapFromSeed(1234).printMap);
