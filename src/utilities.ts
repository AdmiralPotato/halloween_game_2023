// @ts-ignore
import seedrandom from 'seedrandom';
import { ItemWithContext } from './furnitureForRooms';

let randomizer = seedrandom('');

export const setSeed = (seed: string) => {
	(randomizer = seedrandom(seed));
	console.log("setting seed to " + seed);
};
export const rand = (): number => randomizer();
export const randomIndex = (max: number): number => {
	return Math.floor(rand() * max);
};
export const randomFromRange = (range: Range): number => {
	return randomIndex(range.max - range.min + 1) + range.min;
};

// getting randoms with a bias toward the center
export const randomAverageWithBellCurve = (rollCount: number): number => {
	// ≈ roll multiple dice and get the average
	let numbers = [];
	for (let i = 0; i < rollCount; i++) {
		numbers.push(rand());
	}
	return numbers.reduce((ac, v)=>ac+v,0) / numbers.length;
};
export const randomIndexWithBellCurve = (max: number, rollCount: number): number => {
	return Math.floor(randomAverageWithBellCurve(rollCount) * max);
};
export const randomWithBellCurveFromRange = (range: Range, rollCount: number): number => {
	return randomIndexWithBellCurve(range.max - range.min + 1, rollCount) + range.min;
};

export interface Range {
	min: number;
	max: number;
}
export interface XYCoord {
	x: number;
	y: number;
}
export interface XYRange {
	x: Range;
	y: Range;
}

export const getWidthFromItemsWithContext = (items: ItemWithContext[]) => {
	return items.map((item) => item.dimensions.width).reduce((ac, v) => ac + v, 0);
};
export const getXYRangeFromXYCoords = (coords: XYCoord[]) => {
	return coords
		.map((tile) => {
			return {
				x: { min: tile.x, max: tile.x },
				y: { min: tile.y, max: tile.y },
			};
		})
		.reduce(
			(range: XYRange, cur: XYRange) => {
				return {
					x: {
						min: Math.min(range.x.min, cur.x.min),
						max: Math.max(range.x.max, cur.x.max),
					},
					y: {
						min: Math.min(range.y.min, cur.y.min),
						max: Math.max(range.y.max, cur.y.max),
					},
				};
			},
			{
				x: { min: Infinity, max: -Infinity },
				y: { min: Infinity, max: -Infinity },
			},
		);
};
export const getCenterForXYRange = (range: XYRange): XYCoord => {
	return {
		x: (range.x.max + range.x.min) / 2,
		y: (range.y.max + range.y.min) / 2,
	};
};
export const averageXYCoords = (arr: XYCoord[]): XYCoord => {
	const coordsSum = arr.reduce(
		(sum, v) => {
			return { x: sum.x + v.x, y: sum.y + v.y };
		},
		{ x: 0, y: 0 },
	);
	return {
		x: coordsSum.x / arr.length,
		y: coordsSum.y / arr.length,
	};
};
export const translateXY = (coord: XYCoord, moveBy: XYCoord): XYCoord => {
	return {
		x: coord.x + moveBy.x,
		y: coord.y + moveBy.y,
	};
};
export const multiplyXYs = (coord: XYCoord, scaleXYBy: XYCoord): XYCoord => {
	return {
		x: coord.x * scaleXYBy.x,
		y: coord.y * scaleXYBy.y,
	};
};
export const scaleXY = (coord: XYCoord, scale: number): XYCoord => {
	return {
		x: coord.x * scale,
		y: coord.y * scale,
	};
};
export const compareXY = (coord1: XYCoord, coord2: XYCoord): boolean => {
	return coord1.x === coord2.x && coord1.y === coord2.y;
};
export const randomFromArray = <T>(array: T[]): T | null => {
	if (array.length === 0) return null;
	const i = randomIndex(array.length);
	return array[i];
};
export const scrambleArray = <T>(arr: T[]): T[] => {
	const ret = [];
	const workingArr = JSON.parse(JSON.stringify(arr));
	while (workingArr.length) {
		const i = randomIndex(workingArr.length);
		ret.push(workingArr.splice(i, 1)[0]);
	}
	return ret;
};
export const DIRECTIONS = ['n', 'w', 's', 'e']; // should be nesw, but wall rot was wrong otherwise? TODO pls investigate?
export const getRandomDir = (): string => {
	return DIRECTIONS[randomIndex(4)];
};
export const getOppositeDir = (s: string): string => {
	return DIRECTIONS[(DIRECTIONS.indexOf(s) + 2) % 4];
};
export const getOppositeDirN = (n: number): number => {
	return (n + 2) % 4;
};
export const rotateDir = (s: string, n: number): string => {
	return DIRECTIONS[(DIRECTIONS.indexOf(s) + n) % 4];
};
export const getNFromDir = (s: string): number => {
	return DIRECTIONS.indexOf(s);
};
export const makeDirFromN = (n: number): string => {
	return DIRECTIONS[n];
};
export const getScrambledDirs = () => {
	return scrambleArray(DIRECTIONS);
};
export interface RandomWeight {
	weight?: number;
	count?: number;
	item: string;
}
export const getRandomWithWeight = (input: RandomWeight[]): string => {
	const pickFrom: string[] = [];
	// [{ item: name, weight: # }, {...}] version
	input.forEach((entry: RandomWeight) => {
		for (let i = 0; i < (entry.weight || 0); i++) {
			pickFrom.push(entry.item);
		}
	});
	return pickFrom[randomIndex(pickFrom.length)];
};

export const clamp = (input: number, min: number, max: number): number => {
	return input < min ? min : input > max ? max : input;
};

export const rotateCoordsAroundZero = (coord: XYCoord, turns: number) => {
	let ret = JSON.parse(JSON.stringify(coord));
	for (let i = 0; i < turns; i++) {
		let capture = ret.x;
		ret.x = ret.y
		ret.y = -capture;
	}
	return ret;
}

export const mapRange = (
	current: number,
	in_min: number,
	in_max: number,
	out_min: number,
	out_max: number,
): number => {
	const mapped: number = ((current - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
	return clamp(mapped, out_min, out_max);
};

export const PI = Math.PI;
export const TAU = Math.PI * 2;
export const angle_subtract = (a: number, b: number): number => {
	const delta = a - b;
	if (Math.abs(delta) >= PI) {
		if (delta > 0.0) {
			return delta - TAU;
		} else {
			return delta + TAU;
		}
	} else {
		return delta;
	}
};

export const angleLerp = (a: number, b: number, theta: number): number => {
	const delta = angle_subtract(b, a);
	return a + delta * theta;
};
