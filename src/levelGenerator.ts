import { buildMapFromSeed } from './mapBuilder';
import { Tile } from './rooms';
import { Furnishing } from './LevelBuilder';
import { rand, getOppositeDirN } from './utilities';
import { Room } from './LevelBuilder';
import { furnishCenter, furnishCorners, furnishEdges } from './roomFurnishing';
import { FURNISHINGS2, ItemWithContext } from './furnitureForRooms';

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
		const convertNewThingToOld = (thing: ItemWithContext): Furnishing => { // BODGE
			if (!FURNISHINGS2[thing.name]) {
				throw new Error("Could not find furniture called " + thing.name)
			}
			return {
				label: '',
				asset: thing.name,
				name: FURNISHINGS2[thing.name].asset,
				x: thing.centerCoord.x,
				y: thing.centerCoord.y,
				w: FURNISHINGS2[thing.name].dimensions.width,
				d: FURNISHINGS2[thing.name].dimensions.depth,
				h: FURNISHINGS2[thing.name].dimensions.height,
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
		let doorFrames: ItemWithContext[] = rooms[roomID].doors
			.map((tile: Tile) => {
				return {
					collisionOffsetsCoords: [{ x: tile.x, y: tile.y }],
					centerCoord: { x: tile.x, y: tile.y },
					name: 'doorFrame',
					children: [],
					rot: (tile.rot % 2 === 0) ? tile.rot : getOppositeDirN(tile.rot),
				}
			});
		// combine the above
		newThings = newThings
			.concat(centerFurniture)
			.concat(cornerFurniture)
			.concat(edgeFurniture)
			.concat(doorFrames);
		// get rid of null furniture
		newThings = newThings.filter((item: ItemWithContext) => item.name !== "EMPTY");
		// convert furniture to the old shape
		let converted = newThings.map((item: ItemWithContext) => {
			return convertNewThingToOld(item);
		});
		// shove them in the old place
		rooms[roomID].furnishings = rooms[roomID].furnishings.concat(converted);
	});
	return Object.values(rooms);
};

let seed = '1111';
const mapWithRooms = makeRoomsWithSeed(seed);

// console.log(JSON.stringify(mapWithRooms, null, '\t'));
console.log('breakme');
