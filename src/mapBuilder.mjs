import seedrandom from 'seedrandom';

/* -------------- SPECIFICATIONS -------------- */

// NOTE: rooms will probably break if less than 2
const normalWidth = [ 2, 4 ]; // these are ranges (min, max)
const normalDepth = [ 2, 3 ];
const hallWidth = [ 2, 3 ];
const entranceWidth = [ 4, 6 ];
const entranceDepth = [ 2, 3 ];

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
			return doorIndex === i ? '#' : c;
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
			mapASCII[firstDoorIndex] = mapASCII[firstDoorIndex].replace(left+'b', '##');
			indicesR = indicesR.filter(n=>n!==firstDoorIndex);
			let secondDoorIndex = indicesR.length > 0 ? randomFromArray(indicesR) : firstDoorIndex;
			mapASCII[secondDoorIndex] = mapASCII[secondDoorIndex].replace('b'+right, '##');
		} else {
			let firstDoorIndex = randomFromArray(indicesR);
			mapASCII[firstDoorIndex] = mapASCII[firstDoorIndex].replace('b'+right, '##');
			indicesL = indicesL.filter(n=>n!==firstDoorIndex);
			let secondDoorIndex = indicesL.length > 0 ? randomFromArray(indicesL) : firstDoorIndex;
			mapASCII[secondDoorIndex] = mapASCII[secondDoorIndex].replace(left+'b', '##');
		}
	});

	/* -------------- HALLWAY CLEANUP -------------- */

	// Trim hallway
	const topmostDoorIndex = mapASCII.findIndex(line=>line.includes('#'));
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
			x: [ coordsX[0], coordsX[coordsX.length-1] ],
			y: [ coordsY[0], coordsY[coordsY.length-1] ],
		};
	};
	Object.keys(mapFloorPlanInfo).forEach(roomName=>{
		['width','depth'].forEach(prop=>{ // double sizes
			mapFloorPlanInfo[roomName][prop] *= 2;
		});
		const corners = getCornerCords(roomName, doubledMap);
		mapFloorPlanInfo[roomName].cornerCoords = corners;
		mapFloorPlanInfo[roomName].x = corners.x[0] + (corners.x[1] - corners.x[0]) / 2;
		mapFloorPlanInfo[roomName].y = corners.y[0] + (corners.y[1] - corners.y[0]) / 2;
		let doorCoords = [];
		for (let y = corners.y[0]; y <= corners.y[1]; y++) {
			for (let x = corners.x[0]; x <= corners.x[1]; x++) {
				console.log(`${x}, ${y} = ${doubledMap[y][x]}`);
				if (doubledMap[y][x] === '#') {
					doorCoords.push([x, y]);
				}
			}
		}
		mapFloorPlanInfo[roomName].doorCoords = doorCoords;
	});

	/* -------------- ASSIGN ROOMS THEIR PURPOSES -------------- */

	mapFloorPlanInfo.a.name = 'livingRoom';
	mapFloorPlanInfo.a.label = 'a';
	
	mapFloorPlanInfo.a.name = 'hallway';
	mapFloorPlanInfo.a.label = 'b';

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

	/* -------------- CLEANUP -------------- */

	Object.keys(mapFloorPlanInfo).forEach(roomName=>{
		delete mapFloorPlanInfo[roomName].line;
		delete mapFloorPlanInfo[roomName].lines;
	});

	return {
		rooms: mapFloorPlanInfo,
		printMap: doubledMap.join('\n'),
	};
};

console.log(buildMapFromSeed(1).printMap);
console.log('break');
