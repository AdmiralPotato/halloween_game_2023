import { create } from 'zustand';
import { setupUserInput } from './userInputState';

enum GameModes {
	GAMEPLAY,
	MAIN_MENU,
	GAME_OVER,
}

interface Point {
	x: number;
	y: number;
}

interface GameState {
	candies: number;
	timeRemaining: number;
	buttonStateMap: Record<string, boolean | undefined>;
	joystick: Point;
	mode: GameModes;
	tickGame: () => void;
	clearInterval: () => void;
	startGame: () => void;
	gameOver: () => void;
	reset: () => void;
	addCandy: (value: number) => void;
}

let timerInterval: number;
export const useGameStore = create<GameState>()((set, get) => ({
	candies: 0,
	timeRemaining: 0,
	mode: GameModes.MAIN_MENU,
	buttonStateMap: {
		left: false,
		up: false,
		down: false,
		right: false,
		shift: false,
		action: false,
		camera: false,
		seed: false,
		devtools: false,
	},
	joystick: { x: 0, y: 0 },
	reset: () =>
		set(() => ({
			candies: 0,
			timeRemaining: 0,
			mode: GameModes.MAIN_MENU,
		})),
	startGame: () =>
		set(() => {
			get().clearInterval();
			setInterval(get().tickGame, 1000);
			return { candies: 0, mode: GameModes.GAMEPLAY, timeRemaining: 60 };
		}),
	clearInterval: () => {
		if (timerInterval) {
			clearInterval(timerInterval);
		}
	},
	tickGame: () =>
		set((state) => {
			const timeRemaining = state.timeRemaining - 1;
			if (timeRemaining <= 0) {
				get().gameOver();
			}
			return {
				timeRemaining,
			};
		}),
	gameOver: () =>
		set(() => {
			get().clearInterval();
			return { mode: GameModes.GAME_OVER };
		}),
	addCandy: (value) => set((state) => ({ candies: state.candies + value })),
}));
