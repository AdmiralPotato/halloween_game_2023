// @ts-ignore
import seedrandom from 'seedrandom';
import { Furnishing } from './LevelBuilder';
import { Tile } from './rooms';

let randomizer = seedrandom('');

export const setSeed = (seed: string) => randomizer = seedrandom(seed);
export const rand = (): number => randomizer();
export const randomIndex = (max: number): number => {
	return Math.floor(rand() * max);
};
export const randomFromRange = (range: Range): number => {
	return randomIndex(range.max - range.min + 1) + range.min;
};

export interface Range {
	min: number,
	max: number,
}
export interface XYCoord {
	x: number;
	y: number;
}
export interface XYRange {
	x: Range;
	y: Range;
}
export const getXYRangeFromXYCoords = (coords: XYCoord[]) => {
	return coords.map(tile => {
		return {
			x: { min: tile.x, max: tile.x },
			y: { min: tile.y, max: tile.y }
		};
	}).reduce((range: XYRange, cur: XYRange) => {
		return {
			x: {
				min: Math.min(range.x.min, cur.x.min),
				max: Math.max(range.x.max, cur.x.max)
			},
			y: {
				min: Math.min(range.y.min, cur.y.min),
				max: Math.max(range.y.max, cur.y.max)
			},
		}
	}, {
		x: { min: Infinity, max: -Infinity },
		y: { min: Infinity, max: -Infinity },
	});
};
export const getCenterForXYRange = (range: XYRange): XYCoord => {
	return {
		x: (range.x.max + range.x.min) / 2,
		y: (range.y.max + range.y.min) / 2,
	}
}
export const averageXYCoords = (arr: XYCoord[]): XYCoord => {
	let coordsSum = arr.reduce((sum, v) => {
		return { x: sum.x + v.x, y: sum.y + v.y };
	}, { x: 0, y: 0 });
	return {
		x: coordsSum.x / arr.length,
		y: coordsSum.y / arr.length
	}
}
export const translateXY = (coord: XYCoord, moveBy: XYCoord): XYCoord => {
	return {
		x: coord.x + moveBy.x,
		y: coord.y + moveBy.y,
	}
}
export const multiplyXYs = (coord: XYCoord, scaleXYBy: XYCoord): XYCoord => {
	return {
		x: coord.x * scaleXYBy.x,
		y: coord.y * scaleXYBy.y,
	}
}
export const scaleXY = (coord: XYCoord, scale: number): XYCoord => {
	return {
		x: coord.x * scale,
		y: coord.y * scale,
	}
}
export const compareXY = (coord1: XYCoord, coord2: XYCoord): boolean => {
	return coord1.x === coord2.x && coord1.y === coord2.y;
}
export const randomFromArray = <T>(array: T[]): T | null => {
	if (array.length === 0) return null;
	const i = randomIndex(array.length);
	return array[i];
};
export const scrambleArray = <T>(arr: T[]): T[] => {
	const ret = [];
	let workingArr = arr.slice();
	while (workingArr.length) {
		let i = randomIndex(workingArr.length);
		ret.push(workingArr.splice(i, 1)[0]);
	}
	return ret;
};
export const DIRECTIONS = ['n', 'e', 's', 'w'];
export const getRandomDir = (): string => {
	return DIRECTIONS[randomIndex(4)];
};
export const getOppositeDir = (dir: string): string => {
	return DIRECTIONS[(DIRECTIONS.indexOf(dir) + 2) % 4];
};
export interface RandomWeight {
	weight?: number;
	count?: number;
	item: string;
}
export const getRandomWithWeight = (input: RandomWeight[]): string => {
	const pickFrom: string[] = [];
	// [{ item: itemName, weight: # }, {...}] version
	input.forEach((entry: RandomWeight) => {
		for (let i = 0; i < (entry.weight || 0); i++) {
			pickFrom.push(entry.item);
		}
	});
	return pickFrom[randomIndex(pickFrom.length)];
};
