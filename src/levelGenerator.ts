import { buildMapFromSeed } from './mapBuilder';
import { Tile } from './rooms';
import { Furnishing } from './LevelBuilder';
import { rand, getOppositeDirN } from './utilities';
import { Room } from './LevelBuilder';
import { furnishCenter, furnishCorners, furnishEdges } from './roomFurnishing';
import { FURNISHINGS, ItemWithContext } from './furnitureForRooms';

export const makeRoomsWithSeed = (seed: string): Room[] => {
	const mapInfo = buildMapFromSeed(seed);

	////---------------------------------------------------//
	/// ------------ THE REST OF THE OWL???? ------------ ///
	//---------------------------------------------------////

	let rooms = mapInfo.rooms;
	Object.keys(rooms).forEach((roomID) => {
		// getting room info for this room
		const roomType = rooms[roomID].name;

		// BODGE FOR NEW STUFF + TURNING IT INTO OLD STUFF
		const convertNewThingToOld = (thing: ItemWithContext): Furnishing => {
			// BODGE
			if (!FURNISHINGS[thing.name]) {
				throw new Error('Could not find furniture called ' + thing.name);
			}
			return {
				label: '',
				asset: thing.name,
				name: FURNISHINGS[thing.name].asset,
				x: thing.centerCoord.x,
				y: thing.centerCoord.y,
				w: FURNISHINGS[thing.name].dimensions.width,
				d: FURNISHINGS[thing.name].dimensions.depth,
				h: FURNISHINGS[thing.name].dimensions.height,
				rot: thing.rot,
				hasCandy: rand() < 0.3,
			};
		};
		let newThings: ItemWithContext[] = [];
		// put the center objects in
		let centerFurniture: ItemWithContext[] = furnishCenter(rooms[roomID], roomType);
		// put the corner objects in
		let cornerFurniture: ItemWithContext[] = furnishCorners(rooms[roomID], roomType);
		// put the edge objects in
		let edgeFurniture: ItemWithContext[] = furnishEdges(rooms[roomID], roomType);
		// Add doorframes
		let doorframes: ItemWithContext[] = rooms[roomID].doors.map((tile: Tile) => {
			return {
				collisionOffsetsCoords: [],
				centerCoord: { x: tile.x, y: tile.y },
				name: 'doorframe',
				dimensions: FURNISHINGS['doorframe'].dimensions,
				rot: tile.rot % 2 === 0 ? tile.rot : getOppositeDirN(tile.rot),
			};
		});
		// Take the doorway out of the south walls, now that we've used it to make a doorframe
		rooms[roomID].doors = rooms[roomID].doors.filter((item) => !(item.rot === 2));
		// combine the above
		newThings = newThings
			.concat(centerFurniture)
			.concat(cornerFurniture)
			.concat(edgeFurniture)
			.concat(doorframes);
		// get rid of null furniture
		newThings = newThings.filter((item: ItemWithContext) => item.name !== 'EMPTY');
		// convert furniture to the old shape
		let converted = newThings.map((item: ItemWithContext) => {
			return convertNewThingToOld(item);
		});
		// shove them in the old place
		rooms[roomID].furnishings = rooms[roomID].furnishings.concat(converted);
	});
	return Object.values(rooms);
};

let seed = 'bob';
const mapWithRooms = makeRoomsWithSeed(seed);

// console.log(JSON.stringify(mapWithRooms, null, '\t'));
console.log('breakme');
