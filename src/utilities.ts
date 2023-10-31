// @ts-ignore
import seedrandom from 'seedrandom';
import { Furnishing } from './LevelBuilder';

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
export const getCenterForXYRange = (range: XYRange): XYCoord => {
	return {
		x: (range.x.max + range.x.min) / 2,
		y: (range.y.max + range.y.min) / 2,
	}
}
export const averageXYPairs = (arr: XYCoord[]): XYCoord => {
	return {
		x: arr.reduce((acc, coord) => acc + coord.x, 0) / arr.length,
		y: arr.reduce((acc, coord) => acc + coord.y, 0) / arr.length
	}
}
export const translateXY = (coord: XYCoord, moveBy: XYCoord): XYCoord => {
	return {
		x: coord.x + moveBy.x,
		y: coord.y + moveBy.y,
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
export const getRandomWithWeight = (input: RandomWeight[] | Record<string, number>): string => {
	const pickFrom: string[] = [];
	if (Array.isArray(input)) {
		// [{ item: itemName, weight: # }, {...}] version
		input.forEach((entry: RandomWeight) => {
			for (let i = 0; i < (entry.weight || 0); i++) {
				pickFrom.push(entry.item);
			}
		});
	} else {
		// { itemName: #, ... } version
		Object.entries(input).forEach(([key, count]) => {
			for (let i = 0; i < count; i++) {
				pickFrom.push(key);
			}
		});
	}
	return pickFrom[randomIndex(pickFrom.length)];
};
