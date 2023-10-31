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
export interface XYPoint {
	x: number;
	y: number;
}
export interface XYRange {
	x: Range;
	y: Range;
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
const DIRECTIONS = ['n', 'e', 's', 'w'];
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
